import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get('x-razorpay-signature');

    if (!webhookSignature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    // 1. Verify HMAC signature with raw body
    const isValid = verifyRazorpayWebhookSignature(rawBody, webhookSignature);
    if (!isValid) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.event_id || req.headers.get('x-razorpay-event-id');
    const eventType = event.event;

    const adminClient = getAdminClient();
    if (!adminClient) {
      // If Supabase is not yet configured, acknowledge the webhook to avoid gateway retry loops
      return NextResponse.json({ status: 'acknowledged_without_db' }, { status: 200 });
    }

    // 2. Idempotency Check: Prevent duplicate webhook processing
    if (eventId) {
      const { data: existingEvent } = await adminClient
        .from('webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();

      if (existingEvent) {
        // Event has already been processed idempotently
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      // Record event in webhook_events table
      await adminClient.from('webhook_events').insert({
        event_id: eventId,
        provider: 'razorpay',
        event_type: eventType,
        payload: event,
      });
    }

    // 3. Process Event Types
    switch (eventType) {
      case 'payment.captured': {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        const paymentId = payment?.id;

        if (razorpayOrderId) {
          // Find internal order associated with this Razorpay order
          const { data: paymentRecord } = await adminClient
            .from('payments')
            .select('order_id')
            .eq('provider_order_id', razorpayOrderId)
            .single();

          if (paymentRecord?.order_id) {
            await Promise.all([
              adminClient
                .from('orders')
                .update({
                  payment_status: 'captured',
                  order_status: 'processing',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', paymentRecord.order_id),

              adminClient
                .from('payments')
                .update({
                  provider_payment_id: paymentId,
                  status: 'captured',
                  updated_at: new Date().toISOString(),
                })
                .eq('provider_order_id', razorpayOrderId),
            ]);
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;

        if (razorpayOrderId) {
          await adminClient
            .from('payments')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('provider_order_id', razorpayOrderId);
        }
        break;
      }

      default:
        // Ignore unhandled events with HTTP 200 OK
        break;
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Webhook processing exception:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
