import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { categoryFormSchema } from '@/lib/validation';
import { verifyAdminSession } from '@/lib/auth';

/**
 * GET /api/admin/categories
 * Fetch all categories (including inactive).
 * Protected: requires authenticated user with role === 'admin'.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ success: false, error: 'Database service is not configured' }, { status: 503 });
  }

  const { data, error } = await adminClient
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Admin categories fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, categories: data });
}

/**
 * POST /api/admin/categories
 * Create a new saree category/weave.
 * Protected: requires authenticated user with role === 'admin'.
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const rawBody = await req.json();
    const parsed = categoryFormSchema.safeParse(rawBody);

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

    const { data: newCat, error: insertErr } = await adminClient
      .from('categories')
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image_url: parsed.data.image_url || '/saree.jfif',
        is_active: parsed.data.is_active,
        display_order: parsed.data.display_order,
      })
      .select()
      .single();

    if (insertErr || !newCat) {
      console.error('Error inserting category:', insertErr);
      return NextResponse.json(
        { success: false, error: insertErr?.message || 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, category: newCat }, { status: 201 });
  } catch (error: unknown) {
    console.error('Admin category create API error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
