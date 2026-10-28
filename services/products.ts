// ==============================================================================
// KAMINI COLLECTIONS - PRODUCT & CATEGORY SERVICE
// Connects to Supabase PostgreSQL when configured; falls back gracefully to
// curated catalog data during initialization or missing environment variables.
// ==============================================================================

import { Product, Category, ShopFilters } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createPublicSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/mock-data';

/**
 * Fetches all active categories
 */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_CATEGORIES;
  }

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return INITIAL_CATEGORIES;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Database query error in getCategories:', error.message);
      return [];
    }

    return (data || []) as Category[];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

/**
 * Fetches a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    return INITIAL_CATEGORIES.find((c) => c.slug === slug && c.is_active) || null;
  }

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return INITIAL_CATEGORIES.find((c) => c.slug === slug) || null;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Database query error in getCategoryBySlug:', error.message);
      }
      return null;
    }

    return data as Category;
  } catch (err) {
    console.error('Error fetching category by slug:', err);
    return null;
  }
}

/**
 * Fetches products with full filtering, sorting, and pagination
 */
export async function getProducts(filters: ShopFilters = {}): Promise<{ products: Product[]; total: number }> {
  if (!isSupabaseConfigured()) {
    let result = [...INITIAL_PRODUCTS.filter((p) => p.is_active)];

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const cat = INITIAL_CATEGORIES.find((c) => c.slug === filters.category);
      if (cat) {
        result = result.filter((p) => p.category_id === cat.id);
      }
    }

    // Fabric filter
    if (filters.fabric) {
      const fabLower = filters.fabric.toLowerCase();
      result = result.filter((p) => p.fabric?.toLowerCase().includes(fabLower));
    }

    // Color filter
    if (filters.color) {
      const colLower = filters.color.toLowerCase();
      result = result.filter((p) => p.color?.toLowerCase().includes(colLower));
    }

    // Occasion filter
    if (filters.occasion) {
      const occLower = filters.occasion.toLowerCase();
      result = result.filter((p) => p.occasion?.toLowerCase().includes(occLower));
    }

    // Price range
    if (filters.minPrice != null) {
      result = result.filter((p) => p.price_paise >= filters.minPrice! * 100);
    }
    if (filters.maxPrice != null) {
      result = result.filter((p) => p.price_paise <= filters.maxPrice! * 100);
    }

    // In stock only
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock_quantity > 0);
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'price_asc':
        result.sort((a, b) => a.price_paise - b.price_paise);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price_paise - a.price_paise);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return { products: result, total: result.length };
  }

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return { products: INITIAL_PRODUCTS, total: INITIAL_PRODUCTS.length };

    let query = supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)', { count: 'exact' })
      .eq('is_active', true);

    if (filters.category && filters.category !== 'all') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.category)
        .single();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (filters.fabric) {
      query = query.ilike('fabric', `%${filters.fabric}%`);
    }

    if (filters.color) {
      query = query.ilike('color', `%${filters.color}%`);
    }

    if (filters.occasion) {
      query = query.ilike('occasion', `%${filters.occasion}%`);
    }

    if (filters.minPrice != null) {
      query = query.gte('price_paise', filters.minPrice * 100);
    }
    if (filters.maxPrice != null) {
      query = query.lte('price_paise', filters.maxPrice * 100);
    }

    if (filters.inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    if (filters.search) {
      const q = filters.search.trim();
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,description.ilike.%${q}%`);
    }

    switch (filters.sort) {
      case 'price_asc':
        query = query.order('price_paise', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_paise', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Database query error in getProducts:', error.message);
      return { products: [], total: 0 };
    }

    return { products: (data || []) as Product[], total: count != null ? count : (data?.length || 0) };
  } catch (err) {
    console.error('Error fetching products:', err);
    return { products: [], total: 0 };
  }
}

/**
 * Fetches featured products for homepage
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await getProducts();
  return products.filter((p) => p.is_featured).slice(0, 4);
}

/**
 * Fetches a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return INITIAL_PRODUCTS.find((p) => p.slug === slug && p.is_active) || null;
  }

  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Database query error in getProductBySlug:', error.message);
      }
      return null;
    }

    return data as Product;
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return null;
  }
}

/**
 * Fetches related products from the same category
 */
export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4): Promise<Product[]> {
  const { products } = await getProducts();
  return products
    .filter((p) => p.id !== productId && (categoryId ? p.category_id === categoryId : true))
    .slice(0, limit);
}
