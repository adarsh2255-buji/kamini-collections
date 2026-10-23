import { NextRequest, NextResponse } from 'next/server';
import { checkoutRequestSchema } from '@/lib/validation';
import { processCheckout } from '@/services/orders';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate request body schema with Zod
    const validationResult = checkoutRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // 2. Process checkout atomically (re-validates prices from DB, reserves stock)
    const result = await processCheckout({
      shipping_address: payload.shipping_address,
      items: payload.items,
      payment_method: payload.payment_method,
      notes: payload.notes,
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      razorpayOrder: result.razorpayOrder,
    });
  } catch (error: unknown) {
    console.error('Checkout API error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
