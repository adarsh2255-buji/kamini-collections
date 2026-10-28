'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { formatPrice } from '@/lib/pricing';

interface TrackedOrder {
  order_number: string;
  created_at: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total_paise: number;
  subtotal_paise: number;
  shipping_paise: number;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  items?: {
    product_name: string;
    sku: string;
    quantity: number;
    unit_price_paise: number;
    image_url: string | null;
  }[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    if (!orderNumber.trim()) {
      setError('Please enter your Order Reference (e.g. KC-202610-1234)');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Please enter the 10-digit mobile number used when placing the order');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to locate order');
      }

      setOrder(data.order);
    } catch (err: unknown) {
      console.error('Tracking query error:', err);
      const msg = err instanceof Error ? err.message : 'Order not found. Please verify your order number and phone.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">Delivered</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">In Transit / Shipped</span>;
      case 'processing':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">Processing &amp; Packaging</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-semibold">Cancelled</span>;
      case 'placed':
      default:
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-semibold">Order Placed</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Real-Time Shipment Journey
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F] mt-1">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#645E59] mt-2">
            Enter your Order Reference Number and the 10-digit mobile number provided during checkout.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-8 shadow-sm max-w-xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                Order Number *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. KC-202610-8492"
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2.5 px-3 text-sm focus:outline-none focus:border-[#702638] uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                10-Digit Mobile Number *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-[#E6DCD1] bg-[#F5EFEB] text-xs font-medium text-[#645E59]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-r-xs py-2.5 px-3 text-sm focus:outline-none focus:border-[#702638]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white py-3.5 rounded-xs font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locating Shipment...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Results Card */}
        {order && (
          <div className="mt-10 bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6DCD1] gap-2">
              <div>
                <span className="text-xs text-[#645E59]">Order Reference</span>
                <h2 className="font-serif text-xl font-bold text-[#702638]">
                  {order.order_number}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.order_status)}
              </div>
            </div>

            {/* Courier Tracking Details */}
            {order.tracking_number && (
              <div className="p-4 bg-[#F5EFEB] border border-[#B99A5B]/40 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#702638]" />
                  <div>
                    <span className="text-xs text-[#645E59]">Courier Partner</span>
                    <p className="font-medium text-xs text-[#26221F]">
                      {order.tracking_carrier || 'Blue Dart / Delhivery Express'}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[#645E59]">AWB / Tracking Number</span>
                  <p className="font-mono text-xs font-bold text-[#702638]">
                    {order.tracking_number}
                  </p>
                </div>
              </div>
            )}

            {/* Destination Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#645E59] py-2 border-b border-[#E6DCD1]">
              <div>
                <span className="block font-semibold text-[#26221F] mb-1">Destination</span>
                <span>
                  {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
                </span>
              </div>
              <div>
                <span className="block font-semibold text-[#26221F] mb-1">Payment Method</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div>
                <span className="block font-semibold text-[#26221F] mb-1">Total Amount</span>
                <span className="font-bold text-[#702638] text-sm">
                  {formatPrice(order.total_paise)}
                </span>
              </div>
            </div>

            {/* Ordered Sarees List */}
            {order.items && order.items.length > 0 && (
              <div>
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#26221F] mb-3">
                  Sarees in this Package
                </h3>
                <div className="divide-y divide-[#E6DCD1]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center gap-4">
                      <div className="relative w-12 h-16 shrink-0 bg-[#F5EFEB] rounded-xs overflow-hidden border border-[#E6DCD1]">
                        <Image
                          src={(item.image_url || '/saree.jpg').replace(/\.jfif$/i, '.jpg')}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif text-xs font-medium text-[#26221F]">
                          {item.product_name}
                        </h4>
                        <p className="text-[10px] text-[#645E59]">
                          SKU: {item.sku} • Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#26221F]">
                        {formatPrice(item.unit_price_paise * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
