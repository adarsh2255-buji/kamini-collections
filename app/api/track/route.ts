import { NextRequest, NextResponse } from 'next/server';
import { trackOrderSchema } from '@/lib/validation';
import { trackOrder } from '@/services/orders';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsed = trackOrderSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid Order Number and 10-digit mobile number',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { order_number, phone } = parsed.data;
    const order = await trackOrder(order_number, phone);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'No order found matching this Order Number and Mobile Number. Please verify your details.',
        },
        { status: 404 }
      );
    }

    // Mask sensitive customer PII before sending back
    const maskedOrder = {
      order_number: order.order_number,
      created_at: order.created_at,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      total_paise: order.total_paise,
      subtotal_paise: order.subtotal_paise,
      shipping_paise: order.shipping_paise,
      tracking_carrier: order.tracking_carrier,
      tracking_number: order.tracking_number,
      shipping_city: order.shipping_address?.city,
      shipping_state: order.shipping_address?.state,
      shipping_postal_code: order.shipping_address?.postal_code,
      items: order.items?.map((item) => ({
        product_name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price_paise: item.unit_price_paise,
        image_url: item.image_url,
      })),
    };

    return NextResponse.json({
      success: true,
      order: maskedOrder,
    });
  } catch (error: unknown) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Tracking service error. Please try again later.' },
      { status: 500 }
    );
  }
}
