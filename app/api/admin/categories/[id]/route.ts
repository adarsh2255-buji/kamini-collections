import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyAdminSession } from '@/lib/auth';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  image_url: z.string().trim().nullable().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

/**
 * PATCH /api/admin/categories/[id]
 * Update category fields or toggle active state.
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
    const parsed = updateCategorySchema.safeParse(rawBody);

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
    if (d.description !== undefined) updates.description = d.description;
    if (d.image_url !== undefined) updates.image_url = d.image_url;
    if (d.is_active !== undefined) updates.is_active = d.is_active;
    if (d.display_order !== undefined) updates.display_order = d.display_order;

    const { data: updatedCat, error: updateErr } = await adminClient
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating category:', updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: updatedCat });
  } catch (error: unknown) {
    console.error('Admin category update error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Deactivate category (soft-delete).
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
    .from('categories')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error deactivating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Category deactivated successfully', category: data });
}
