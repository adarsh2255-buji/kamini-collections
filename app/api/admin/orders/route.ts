import { NextRequest, NextResponse } from 'next/server';
import { getAdminOrders } from '@/services/orders';
import { verifyAdminSession } from '@/lib/auth';

/**
 * GET /api/admin/orders
 * List orders with optional search and status filter.
 * Protected: requires authenticated user with role === 'admin'.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const { orders, total } = await getAdminOrders({
      search,
      order_status: status,
    });

    return NextResponse.json({ success: true, orders, total });
  } catch (error: unknown) {
    console.error('Error in GET /api/admin/orders:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
