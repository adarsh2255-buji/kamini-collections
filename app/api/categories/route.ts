import { NextResponse } from 'next/server';
import { getCategories } from '@/services/products';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    console.error('Categories API error:', error);
    return NextResponse.json({ success: false, categories: [] }, { status: 500 });
  }
}
