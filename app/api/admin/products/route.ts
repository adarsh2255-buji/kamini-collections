import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { productFormSchema } from '@/lib/validation';
import { rupeesToPaise } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsed = productFormSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const adminClient = getAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        {
          success: true,
          message: 'Product validated successfully (Note: configure Supabase in .env.local to persist permanently to PostgreSQL).',
          product: { ...data, id: `prod_${Date.now()}` },
        },
        { status: 200 }
      );
    }

    // 1. Insert product row
    const { data: newProd, error: prodErr } = await adminClient
      .from('products')
      .insert({
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        category_id: data.category_id || null,
        description: data.description,
        fabric: data.fabric || null,
        color: data.color || null,
        occasion: data.occasion || null,
        saree_length: data.saree_length || null,
        blouse_details: data.blouse_details || null,
        care_instructions: data.care_instructions || null,
        price_paise: rupeesToPaise(data.price_rupees),
        compare_at_price_paise: data.compare_at_price_rupees
          ? rupeesToPaise(data.compare_at_price_rupees)
          : null,
        stock_quantity: data.stock_quantity,
        is_active: data.is_active,
        is_featured: data.is_featured,
      })
      .select()
      .single();

    if (prodErr || !newProd) {
      console.error('Database product insert error:', prodErr);
      throw new Error(prodErr?.message || 'Failed to save product in database');
    }

    // 2. Insert product images if provided
    if (data.image_urls && data.image_urls.length > 0) {
      const imagesToInsert = data.image_urls.map((url, idx) => ({
        product_id: newProd.id,
        image_url: url,
        alt_text: `${newProd.name} View ${idx + 1}`,
        sort_order: idx + 1,
        is_primary: idx === 0,
      }));

      await adminClient.from('product_images').insert(imagesToInsert);
    }

    return NextResponse.json({ success: true, product: newProd }, { status: 201 });
  } catch (err: unknown) {
    console.error('Product creation route error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
