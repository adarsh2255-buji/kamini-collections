'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/pricing';

interface OrderDetailManagerProps {
  initialOrder: Order;
}

export function OrderDetailManager({ initialOrder }: OrderDetailManagerProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [orderStatus, setOrderStatus] = useState(initialOrder.order_status);
  const [carrier, setCarrier] = useState(initialOrder.tracking_carrier || 'Blue Dart Express');
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.tracking_number || '');
  const [adminNotes, setAdminNotes] = useState(initialOrder.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: orderStatus,
          tracking_carrier: carrier.trim() || undefined,
          tracking_number: trackingNumber.trim() || undefined,
          notes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order');
      }

      setNotice('Order updated successfully!');
      if (data.order) {
        setOrder(data.order);
      }
    } catch (err: unknown) {
      console.error('Update order error:', err);
      const msg = err instanceof Error ? err.message : 'Error updating order';
      setNotice(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DCD1] gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 text-[#645E59] hover:text-[#702638] rounded-xs border border-[#E6DCD1] bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              Order Reference
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#702638]">
              {order.order_number}
            </h1>
            <p className="text-xs text-[#645E59]">
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Line Items & Customer Information */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer & Shipping Details Card */}
          <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs shadow-xs space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
              Customer &amp; Delivery Destination
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#645E59] block">Recipient Name:</span>
                <strong className="text-sm font-semibold text-[#26221F]">
                  {order.customer_name}
                </strong>
              </div>

              <div>
                <span className="text-[#645E59] block">Contact Mobile:</span>
                <strong className="text-sm font-semibold text-[#26221F]">
                  +91 {order.phone.slice(-10)}
                </strong>
              </div>

              {order.email && (
                <div>
                  <span className="text-[#645E59] block">Email:</span>
                  <span className="text-[#26221F]">{order.email}</span>
                </div>
              )}

              <div>
                <span className="text-[#645E59] block">Payment Method:</span>
                <span className="font-medium uppercase text-[#702638]">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay Online'}
                </span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-[#FAF7F0]">
                <span className="text-[#645E59] block mb-1">Shipping Street Address:</span>
                <p className="text-[#26221F] leading-relaxed">
                  {order.shipping_address?.address_line1}
                  {order.shipping_address?.address_line2 && `, ${order.shipping_address.address_line2}`}
                  <br />
                  {order.shipping_address?.landmark && `Landmark: ${order.shipping_address.landmark}, `}
                  {order.shipping_address?.city}, {order.shipping_address?.state} –{' '}
                  <strong>{order.shipping_address?.postal_code}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Saree Line Items Table */}
          <div className="bg-white border border-[#E6DCD1] rounded-xs shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E6DCD1]">
              <h2 className="font-serif text-base font-semibold text-[#26221F]">
                Purchased Sarees Snapshot
              </h2>
            </div>

            <div className="divide-y divide-[#E6DCD1]">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="relative w-12 h-16 shrink-0 bg-[#F5EFEB] rounded-xs overflow-hidden border border-[#E6DCD1]">
                    <Image
                      src={item.image_url || '/saree.jfif'}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-sm font-medium text-[#26221F]">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-[#645E59]">SKU: {item.sku}</p>
                    <p className="text-xs text-[#645E59]">
                      Unit: {formatPrice(item.unit_price_paise)} &times; {item.quantity}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#702638]">
                    {formatPrice(item.line_total_paise)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F5EFEB] border-t border-[#E6DCD1] space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-[#645E59]">
                <span>Items Subtotal:</span>
                <span>{formatPrice(order.subtotal_paise)}</span>
              </div>
              <div className="flex justify-between text-[#645E59]">
                <span>Insured Shipping Fee:</span>
                <span>{formatPrice(order.shipping_paise)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#702638] pt-2 border-t border-[#E6DCD1]">
                <span>Grand Total:</span>
                <span>{formatPrice(order.total_paise)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Transition & Courier Carrier Controls */}
        <div className="lg:col-span-4 space-y-6">
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 border border-[#E6DCD1] rounded-xs shadow-xs space-y-4"
          >
            <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
              Fulfilment Controls
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Order Fulfilment Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as Order['order_status'])}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              >
                <option value="placed">Placed (New Order)</option>
                <option value="processing">Processing (Packing &amp; Quality Check)</option>
                <option value="shipped">Shipped (In Transit with Courier)</option>
                <option value="delivered">Delivered to Customer</option>
                <option value="cancelled">Cancelled (Restores Inventory)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Courier Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Blue Dart, Delhivery, DTDC"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                AWB / Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BD-892183921"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Staff Internal Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes regarding packaging or dispatch..."
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white py-3 rounded-xs font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Order...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Fulfilment Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
