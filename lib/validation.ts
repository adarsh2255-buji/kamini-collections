// ==============================================================================
// KAMINI COLLECTIONS - ZOD VALIDATION SCHEMAS
// ==============================================================================

import { z } from 'zod';

// Indian phone regex: 10 digits starting with 6, 7, 8, or 9
export const indianPhoneRegex = /^[6-9]\d{9}$/;

// Indian Postal PIN Code: 6 digits
export const indianPincodeRegex = /^[1-9][0-9]{5}$/;

export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const shippingAddressSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  address_line1: z.string().trim().min(5, 'Address must be at least 5 characters').max(200),
  address_line2: z.string().trim().max(200).optional().or(z.literal('')),
  landmark: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'Please select or enter your state'),
  postal_code: z.string().trim().regex(indianPincodeRegex, 'Enter a valid 6-digit PIN code'),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 per order'),
});

export const checkoutRequestSchema = z.object({
  shipping_address: shippingAddressSchema,
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  payment_method: z.enum(['razorpay', 'cod'], {
    message: 'Please select a valid payment method',
  }),
  notes: z.string().trim().max(500).optional(),
});

export const trackOrderSchema = z.object({
  order_number: z.string().trim().min(4, 'Order number is required'),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, 'Enter the 10-digit phone number used during checkout'),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(3, 'Product name is required').max(255),
  slug: z.string().trim().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  sku: z.string().trim().min(3, 'SKU is required').max(50),
  category_id: z.string().uuid('Please select a valid category').nullable().optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  fabric: z.string().trim().max(100).optional().nullable(),
  color: z.string().trim().max(100).optional().nullable(),
  occasion: z.string().trim().max(100).optional().nullable(),
  saree_length: z.string().trim().max(50).optional().nullable(),
  blouse_details: z.string().trim().max(255).optional().nullable(),
  care_instructions: z.string().trim().max(255).optional().nullable(),
  price_rupees: z.number().min(1, 'Price must be greater than 0'),
  compare_at_price_rupees: z.number().optional().nullable(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  image_urls: z.array(z.string().url('Invalid image URL')).default([]),
});

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().trim().max(500).optional().nullable(),
  image_url: z.string().trim().optional().nullable(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export const updateOrderStatusSchema = z.object({
  order_status: z.enum(['placed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'authorized', 'captured', 'failed', 'refunded']).optional(),
  tracking_carrier: z.string().trim().max(100).optional(),
  tracking_number: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});
