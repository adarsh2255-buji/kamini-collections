// ==============================================================================
// KAMINI COLLECTIONS - ORDER & CHECKOUT SERVICE
// Server-side order lifecycle, atomic checkout, inventory deduction, and tracking
// ==============================================================================

import { Order, PaymentMethod, PaymentStatus, OrderStatus, ShippingAddress } from '@/types';
import { getAdminClient } from '@/lib/supabase/admin';
import { computeOrderTotals } from '@/lib/pricing';
import { getRazorpayClient } from '@/lib/razorpay';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export interface CheckoutPayload {
  shipping_address: ShippingAddress;
  items: { productId: string; quantity: number }[];
  payment_method: PaymentMethod;
  notes?: string;
}

/**
 * Generates an elegant, non-sequential boutique order number e.g. KC-202610-8492
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KC-${dateStr}-${randomSuffix}`;
}

/**
 * Atomic checkout processor:
 * 1. Fetches current product prices & stock from database (NEVER trusts client prices)
 * 2. Validates availability
 * 3. Calculates exact totals in integer paise
 * 4. Inserts order and immutable order items snapshot
 * 5. Decrements stock atomically
 * 6. Initiates Razorpay gateway order if payment_method is 'razorpay'
 */
export async function processCheckout(payload: CheckoutPayload): Promise<{
  order: Order;
  razorpayOrder?: { id: string; amount: number; currency: string; key: string } | null;
}> {
  const adminClient = getAdminClient();
  const orderNumber = generateOrderNumber();

  // 1. Fetch products & validate
  const resolvedItems: {
    product_id: string;
    product_name: string;
    sku: string;
    unit_price_paise: number;
    quantity: number;
    line_total_paise: number;
    image_url: string;
  }[] = [];

  if (adminClient) {
    const productIds = payload.items.map((i) => i.productId);
    const { data: dbProducts, error } = await adminClient
      .from('products')
      .select('*, images:product_images(*)')
      .in('id', productIds)
      .eq('is_active', true);

    if (error || !dbProducts || dbProducts.length === 0) {
      throw new Error('One or more selected products are unavailable');
    }

    for (const item of payload.items) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) {
        throw new Error(`Product not found or inactive`);
      }
      if (prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stock_quantity} remaining.`);
      }

      const primaryImg =
        prod.images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url ||
        prod.images?.[0]?.image_url ||
        '/saree.jfif';

      resolvedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        unit_price_paise: Number(prod.price_paise),
        quantity: item.quantity,
        line_total_paise: Number(prod.price_paise) * item.quantity,
        image_url: primaryImg,
      });
    }
  } else {
    // Fallback using curated catalog
    for (const item of payload.items) {
      const prod = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      if (!prod) throw new Error('Product not found');
      if (prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stock_quantity} left.`);
      }
      resolvedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        unit_price_paise: prod.price_paise,
        quantity: item.quantity,
        line_total_paise: prod.price_paise * item.quantity,
        image_url: prod.images?.[0]?.image_url || '/saree.jfif',
      });
    }
  }

  // 2. Compute accurate financial totals on server
  const { subtotalPaise, shippingPaise, discountPaise, totalPaise } = computeOrderTotals(
    resolvedItems.map((i) => ({ price_paise: i.unit_price_paise, quantity: i.quantity }))
  );

  const paymentStatus: PaymentStatus = 'pending';
  const orderStatus: OrderStatus = 'placed';

  // 3. Database persistence
  let createdOrder: Order;

  if (adminClient) {
    // Create order row
    const { data: orderData, error: orderErr } = await adminClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: payload.shipping_address.full_name,
        phone: payload.shipping_address.phone,
        email: payload.shipping_address.email || null,
        shipping_address: payload.shipping_address,
        subtotal_paise: subtotalPaise,
        shipping_paise: shippingPaise,
        discount_paise: discountPaise,
        total_paise: totalPaise,
        payment_method: payload.payment_method,
        payment_status: paymentStatus,
        order_status: orderStatus,
        notes: payload.notes || null,
      })
      .select()
      .single();

    if (orderErr || !orderData) {
      console.error('Failed to create order record:', orderErr);
      throw new Error('Failed to create order. Please try again.');
    }

    createdOrder = orderData as Order;

    // Insert order items snapshot
    const itemsToInsert = resolvedItems.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      unit_price_paise: item.unit_price_paise,
      quantity: item.quantity,
      line_total_paise: item.line_total_paise,
      image_url: item.image_url,
    }));

    const { error: itemsErr } = await adminClient.from('order_items').insert(itemsToInsert);
    if (itemsErr) {
      console.error('Failed to insert order items:', itemsErr);
    }

    // Safely decrement inventory atomically with concurrency check
    for (const item of resolvedItems) {
      const { data: success, error: decErr } = await adminClient.rpc('decrement_product_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });

      if (decErr || success === false) {
        // Rollback any inventory decremented so far for this order
        await adminClient.rpc('restore_order_inventory', { p_order_id: createdOrder.id });
        await adminClient
          .from('orders')
          .update({
            order_status: 'cancelled',
            notes: 'Cancelled due to concurrent inventory reservation collision',
            updated_at: new Date().toISOString(),
          })
          .eq('id', createdOrder.id);

        throw new Error(
          `We apologize, but "${item.product_name}" was just reserved by another customer. Please adjust your bag.`
        );
      }
    }
  } else {
    // Mock order creation for preview/unconnected state
    createdOrder = {
      id: `ord_${Date.now()}`,
      order_number: orderNumber,
      customer_name: payload.shipping_address.full_name,
      phone: payload.shipping_address.phone,
      email: payload.shipping_address.email || null,
      shipping_address: payload.shipping_address,
      subtotal_paise: subtotalPaise,
      shipping_paise: shippingPaise,
      discount_paise: discountPaise,
      total_paise: totalPaise,
      payment_method: payload.payment_method,
      payment_status: paymentStatus,
      order_status: orderStatus,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 4. Handle Razorpay Gateway Order Creation if requested
  let razorpayOrderPayload = null;
  if (payload.payment_method === 'razorpay') {
    const razorpay = getRazorpayClient();
    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: totalPaise, // in paise
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            internal_order_id: createdOrder.id,
            order_number: orderNumber,
            customer_phone: payload.shipping_address.phone,
          },
        });

        razorpayOrderPayload = {
          id: rzpOrder.id,
          amount: totalPaise,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID || '',
        };

        if (adminClient) {
          // Record payment attempt
          await adminClient.from('payments').insert({
            order_id: createdOrder.id,
            provider: 'razorpay',
            provider_order_id: rzpOrder.id,
            amount_paise: totalPaise,
            status: 'created',
          });
        }
      } catch (rzpErr) {
        console.error('Razorpay order creation failed:', rzpErr);
        if (adminClient) {
          await adminClient.rpc('restore_order_inventory', { p_order_id: createdOrder.id });
          await adminClient
            .from('orders')
            .update({
              order_status: 'cancelled',
              payment_status: 'failed',
              notes: 'Cancelled due to payment gateway order initialization failure',
              updated_at: new Date().toISOString(),
            })
            .eq('id', createdOrder.id);
          throw new Error('Payment gateway error. Please try again or select Cash on Delivery.');
        }
      }
    }
  }

  createdOrder.items = resolvedItems.map((item, idx) => ({
    id: `item_${idx}`,
    order_id: createdOrder.id,
    product_id: item.product_id,
    product_name: item.product_name,
    sku: item.sku,
    unit_price_paise: item.unit_price_paise,
    quantity: item.quantity,
    line_total_paise: item.line_total_paise,
    image_url: item.image_url,
    created_at: new Date().toISOString(),
  }));

  return { order: createdOrder, razorpayOrder: razorpayOrderPayload };
}

/**
 * Secure order tracking query
 * Verifies both order_number and customer phone to prevent sequential ID harvesting
 */
export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  const adminClient = getAdminClient();
  const cleanPhone = phone.trim().slice(-10); // Standardize to last 10 digits
  const cleanNumber = orderNumber.trim().toUpperCase();

  if (!adminClient) {
    // If order was placed in this session or matches mock, return mock order
    return {
      id: 'demo-order-id',
      order_number: cleanNumber,
      customer_name: 'Valued Customer',
      phone: cleanPhone,
      email: 'customer@example.com',
      shipping_address: {
        full_name: 'Valued Customer',
        phone: cleanPhone,
        address_line1: 'Boutique Residence, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560001',
      },
      subtotal_paise: 1250000,
      shipping_paise: 0,
      discount_paise: 0,
      total_paise: 1250000,
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'processing',
      tracking_carrier: 'Blue Dart Express',
      tracking_number: 'BD-847291039',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          order_id: 'demo-order-id',
          product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          product_name: 'Royal Crimson Kadwa Banarasi Silk Saree',
          sku: 'KC-BAN-001',
          unit_price_paise: 1250000,
          quantity: 1,
          line_total_paise: 1250000,
          image_url: '/saree.jfif',
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  try {
    const { data: order, error } = await adminClient
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('order_number', cleanNumber)
      .single();

    if (error || !order) return null;

    // Secure phone verification: must end with the provided 10 digits
    const orderPhone = (order.phone || '').replace(/\D/g, '');
    if (!orderPhone.endsWith(cleanPhone)) {
      return null;
    }

    return order as Order;
  } catch (err) {
    console.error('Track order query error:', err);
    return null;
  }
}

/**
 * Admin: Get all orders with filtering and search
 */
export async function getAdminOrders(params: {
  search?: string;
  order_status?: string;
  payment_status?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ orders: Order[]; total: number }> {
  const adminClient = getAdminClient();
  if (!adminClient) {
    return { orders: [], total: 0 };
  }

  let query = adminClient
    .from('orders')
    .select('*, items:order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.search) {
    const s = params.search.trim();
    query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,phone.ilike.%${s}%`);
  }

  if (params.order_status && params.order_status !== 'all') {
    query = query.eq('order_status', params.order_status);
  }

  if (params.payment_status && params.payment_status !== 'all') {
    query = query.eq('payment_status', params.payment_status);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, count, error } = await query;
  if (error || !data) return { orders: [], total: 0 };

  return { orders: data as Order[], total: count || data.length };
}

/**
 * Admin: Fetch single order by ID with full item details and payment records
 */
export async function getAdminOrderById(orderId: string): Promise<Order | null> {
  const adminClient = getAdminClient();
  if (!adminClient) return null;

  const { data, error } = await adminClient
    .from('orders')
    .select('*, items:order_items(*), payments(*)')
    .eq('id', orderId)
    .single();

  if (error || !data) return null;
  return data as Order;
}

/**
 * Admin: Dashboard KPI metrics computed dynamically from database
 */
export async function getAdminDashboardMetrics() {
  const adminClient = getAdminClient();
  if (!adminClient) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      confirmedRevenuePaise: 0,
      pendingCodPaise: 0,
      lowStockCount: 0,
      recentOrders: [],
    };
  }

  const [ordersRes, lowStockRes] = await Promise.all([
    adminClient.from('orders').select('*').order('created_at', { ascending: false }),
    adminClient.from('products').select('id, name, sku, stock_quantity').lte('stock_quantity', 3),
  ]);

  const orders = ordersRes.data || [];
  const lowStock = lowStockRes.data || [];

  let confirmedRevenuePaise = 0;
  let pendingCodPaise = 0;
  let pendingOrders = 0;
  let deliveredOrders = 0;

  for (const o of orders) {
    if (o.payment_status === 'captured') {
      confirmedRevenuePaise += Number(o.total_paise || 0);
    }
    if (o.payment_method === 'cod' && o.payment_status === 'pending' && o.order_status !== 'cancelled') {
      pendingCodPaise += Number(o.total_paise || 0);
    }
    if (o.order_status === 'placed' || o.order_status === 'processing') {
      pendingOrders++;
    }
    if (o.order_status === 'delivered') {
      deliveredOrders++;
    }
  }

  return {
    totalOrders: orders.length,
    pendingOrders,
    deliveredOrders,
    confirmedRevenuePaise,
    pendingCodPaise,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock,
    recentOrders: orders.slice(0, 5),
  };
}
