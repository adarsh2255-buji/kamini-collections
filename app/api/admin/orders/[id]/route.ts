import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { updateOrderStatusSchema } from '@/lib/validation';
import { verifyAdminSession } from '@/lib/auth';

/**
 * GET /api/admin/orders/[id]
 * Fetch single order with items and payment history.
 * Protected: requires authenticated user with role === 'admin'.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ success: false, error: 'Database service is not configured' }, { status: 503 });
  }

  const { data: order, error } = await adminClient
    .from('orders')
    .select('*, items:order_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order fulfilment status, payment status (e.g. COD cash collection),
 * courier carrier, tracking number, and admin notes.
 * Protected: requires authenticated user with role === 'admin'.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const rawBody = await req.json();

    const parsed = updateOrderStatusSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { order_status, payment_status, tracking_carrier, tracking_number, notes } = parsed.data;
    const adminClient = getAdminClient();

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'Database service is not configured' }, { status: 503 });
    }

    // 1. Fetch current order to verify state
    const { data: currentOrder, error: fetchErr } = await adminClient
      .from('orders')
      .select('order_status, payment_status')
      .eq('id', id)
      .single();

    if (fetchErr || !currentOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (order_status) {
      updates.order_status = order_status;
    }
    if (payment_status) {
      updates.payment_status = payment_status;
    }
    if (tracking_carrier !== undefined) {
      updates.tracking_carrier = tracking_carrier;
    }
    if (tracking_number !== undefined) {
      updates.tracking_number = tracking_number;
    }
    if (notes !== undefined) {
      updates.notes = notes;
    }

    // 2. If transitioning to 'cancelled' from a non-cancelled state, restore inventory
    if (order_status === 'cancelled' && currentOrder.order_status !== 'cancelled') {
      await adminClient.rpc('restore_order_inventory', { p_order_id: id });
    }

    // 3. Update order in database
    const { data: updatedOrder, error: updateErr } = await adminClient
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, items:order_items(*)')
      .single();

    if (updateErr) {
      console.error('Order update error:', updateErr);
      throw new Error(updateErr.message);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: unknown) {
    console.error('Admin order update API error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
