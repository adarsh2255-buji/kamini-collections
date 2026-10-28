import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyAdminSession } from '@/lib/auth';
import { rupeesToPaise } from '@/lib/pricing';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().trim().min(3).max(255).optional(),
  slug: z.string().trim().min(2).max(255).regex(/^[a-z0-9-]+$/).optional(),
  sku: z.string().trim().min(3).max(50).optional(),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(10).optional(),
  fabric: z.string().trim().max(100).nullable().optional(),
  color: z.string().trim().max(100).nullable().optional(),
  occasion: z.string().trim().max(100).nullable().optional(),
  saree_length: z.string().trim().max(50).nullable().optional(),
  blouse_details: z.string().trim().max(255).nullable().optional(),
  care_instructions: z.string().trim().max(255).nullable().optional(),
  price_rupees: z.number().min(1).optional(),
  compare_at_price_rupees: z.number().nullable().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

/**
 * GET /api/admin/products/[id]
 * Fetch single product details with images.
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

  const { data, error } = await adminClient
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, product: data });
}

/**
 * PATCH /api/admin/products/[id]
 * Update product specifications, stock, or pricing.
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
    const parsed = updateProductSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'Database service is not configured' }, { status: 503 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const d = parsed.data;
    if (d.name !== undefined) updates.name = d.name;
    if (d.slug !== undefined) updates.slug = d.slug;
    if (d.sku !== undefined) updates.sku = d.sku;
    if (d.category_id !== undefined) updates.category_id = d.category_id;
    if (d.description !== undefined) updates.description = d.description;
    if (d.fabric !== undefined) updates.fabric = d.fabric;
    if (d.color !== undefined) updates.color = d.color;
    if (d.occasion !== undefined) updates.occasion = d.occasion;
    if (d.saree_length !== undefined) updates.saree_length = d.saree_length;
    if (d.blouse_details !== undefined) updates.blouse_details = d.blouse_details;
    if (d.care_instructions !== undefined) updates.care_instructions = d.care_instructions;
    if (d.price_rupees !== undefined) updates.price_paise = rupeesToPaise(d.price_rupees);
    if (d.compare_at_price_rupees !== undefined) {
      updates.compare_at_price_paise = d.compare_at_price_rupees
        ? rupeesToPaise(d.compare_at_price_rupees)
        : null;
    }
    if (d.stock_quantity !== undefined) updates.stock_quantity = d.stock_quantity;
    if (d.is_active !== undefined) updates.is_active = d.is_active;
    if (d.is_featured !== undefined) updates.is_featured = d.is_featured;

    const { data: updatedProd, error: updateErr } = await adminClient
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*), images:product_images(*)')
      .single();

    if (updateErr) {
      console.error('Error updating product:', updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updatedProd });
  } catch (error: unknown) {
    console.error('Admin product update error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Deactivate product (soft-delete).
 */
export async function DELETE(
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

  const { data, error } = await adminClient
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error deactivating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Product deactivated successfully', product: data });
}
