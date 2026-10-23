// ==============================================================================
// KAMINI COLLECTIONS - DOMAIN TYPES
// ==============================================================================

export type Role = 'admin' | 'customer' | 'staff';

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  fabric: string | null;
  color: string | null;
  occasion: string | null;
  saree_length: string | null;
  blouse_details: string | null;
  care_instructions: string | null;
  price_paise: number; // Always integer paise: e.g. 1250000 = Rs. 12,500.00
  compare_at_price_paise: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  category?: Category;
  images?: ProductImage[];
}

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
  image_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  shipping_address: ShippingAddress;
  subtotal_paise: number;
  shipping_paise: number;
  discount_paise: number;
  total_paise: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_token_hash?: string | null;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface Payment {
  id: string;
  order_id: string;
  provider: 'razorpay' | 'cod';
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_signature: string | null;
  amount_paise: number;
  status: 'created' | 'attempted' | 'captured' | 'failed' | 'refunded';
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Client Cart Item
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  pricePaise: number;
  compareAtPricePaise: number | null;
  imageUrl: string;
  quantity: number;
  maxStock: number;
  fabric?: string | null;
  color?: string | null;
}

// Filter Options for /shop
export interface ShopFilters {
  category?: string;
  fabric?: string;
  color?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  search?: string;
}
