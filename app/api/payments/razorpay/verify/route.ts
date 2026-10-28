import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_order_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    // 1. Verify HMAC-SHA256 signature cryptographically
    const isValid = verifyRazorpayPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid Razorpay signature for order:', internal_order_id);
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // 2. Update order and payment records in Supabase
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data: currentOrder } = await adminClient
        .from('orders')
        .select('order_status')
        .eq('id', internal_order_id)
        .single();

      const orderUpdates: Record<string, unknown> = {
        payment_status: 'captured',
        updated_at: new Date().toISOString(),
      };
      if (currentOrder && currentOrder.order_status === 'placed') {
        orderUpdates.order_status = 'processing';
      }

      // Update order status
      await adminClient
        .from('orders')
        .update(orderUpdates)
        .eq('id', internal_order_id);

      // Update payment record
      await adminClient
        .from('payments')
        .update({
          provider_payment_id: razorpay_payment_id,
          provider_signature: razorpay_signature,
          status: 'captured',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', internal_order_id)
        .eq('provider_order_id', razorpay_order_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and captured successfully',
    });
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
