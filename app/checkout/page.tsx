'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, CreditCard, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCart } from '@/context/cart-context';
import { formatPrice, calculateShipping } from '@/lib/pricing';
import { indianStates } from '@/lib/validation';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPaise, clearCart, isHydrated } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Karnataka',
    postalCode: '',
    landmark: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shippingPaise = calculateShipping(subtotalPaise);
  const totalPaise = subtotalPaise + shippingPaise;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  // Dynamically load Razorpay standard checkout script if not already loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend verification
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }
    if (!formData.addressLine1.trim()) {
      setErrorMessage('Please enter your delivery street address');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city/town');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.postalCode.trim())) {
      setErrorMessage('Please enter a valid 6-digit PIN code');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit order payload to secure backend
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_address: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || undefined,
            address_line1: formData.addressLine1.trim(),
            address_line2: formData.addressLine2.trim() || undefined,
            landmark: formData.landmark.trim() || undefined,
            city: formData.city.trim(),
            state: formData.state.trim(),
            postal_code: formData.postalCode.trim(),
          },
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          payment_method: paymentMethod,
          notes: formData.notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      const { order, razorpayOrder } = data;

      // 2. If Cash on Delivery, checkout is complete!
      if (paymentMethod === 'cod') {
        clearCart();
        router.push(
          `/order-success?order_number=${order.order_number}&method=cod&total=${order.total_paise}`
        );
        return;
      }

      // 3. If Razorpay, open Razorpay Standard Checkout
      if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay || !razorpayOrder) {
          // If Razorpay gateway is not configured or fails to load, gracefully transition to COD confirmation or test success
          clearCart();
          router.push(
            `/order-success?order_number=${order.order_number}&method=razorpay_pending&total=${order.total_paise}`
          );
          return;
        }

        const rzp = new window.Razorpay({
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Kamini Collections',
          description: `Order ${order.order_number}`,
          order_id: razorpayOrder.id,
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
            email: formData.email,
          },
          theme: {
            color: '#702638',
          },
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              // Verify signature on server
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  internal_order_id: order.id,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                router.push(
                  `/order-success?order_number=${order.order_number}&method=razorpay&payment_id=${response.razorpay_payment_id}`
                );
              } else {
                throw new Error('Payment verification signature failed');
              }
            } catch (err) {
              console.error('Payment verification failed:', err);
              router.push(
                `/order-success?order_number=${order.order_number}&method=razorpay_pending&note=verification_pending`
              );
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        });

        rzp.open();
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong with checkout. Please try again.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-[#645E59]">Loading checkout...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-medium text-[#26221F]">Your Bag is Empty</h2>
          <p className="text-sm text-[#645E59] mt-2 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#702638] text-white px-6 py-2.5 rounded-xs text-sm font-medium"
          >
            Explore Sarees
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Checkout Header */}
        <div className="mb-8 border-b border-[#E6DCD1] pb-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              Fast &amp; Secure Guest Checkout
            </span>
            <h1 className="font-serif text-3xl font-normal text-[#26221F] mt-1">
              Delivery &amp; Payment Details
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#645E59]">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* ============================================================================== */}
            {/* LEFT: SHIPPING ADDRESS & PAYMENT SELECTION */}
            {/* ============================================================================== */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Address Section */}
              <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-[#26221F] pb-3 border-b border-[#E6DCD1]">
                  1. Shipping Address (India)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Ananya Sharma"
                      required
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      Mobile Number (10 digits) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-[#E6DCD1] bg-[#F5EFEB] text-xs font-medium text-[#645E59]">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        required
                        className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-r-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ananya@example.com"
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      House / Flat / Building / Street *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="Flat 402, Royal Palms, 12th Main Road"
                      required
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      Area / Locality / Landmark
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Near City Centre Mall"
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Bengaluru"
                      required
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      State / UT *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      maxLength={6}
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="560001"
                      required
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] uppercase tracking-wider mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Please call before delivery"
                      className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-[#26221F] pb-3 border-b border-[#E6DCD1]">
                  2. Choose Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Razorpay Online */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xs border-2 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#702638] bg-[#FAF7F0]'
                        : 'border-[#E6DCD1] bg-white hover:border-[#B99A5B]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 text-[#702638] focus:ring-[#702638]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#702638]" />
                        <span className="font-serif font-semibold text-sm text-[#26221F]">
                          Razorpay Online Payment (Instant)
                        </span>
                      </div>
                      <p className="text-xs text-[#645E59] mt-1">
                        Pay securely with UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or NetBanking.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xs border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#702638] bg-[#FAF7F0]'
                        : 'border-[#E6DCD1] bg-white hover:border-[#B99A5B]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-[#702638] focus:ring-[#702638]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#702638]" />
                        <span className="font-serif font-semibold text-sm text-[#26221F]">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-xs text-[#645E59] mt-1">
                        Pay with cash or UPI directly to the courier agent upon doorstep delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ============================================================================== */}
            {/* RIGHT: ORDER SUMMARY & PLACE ORDER BUTTON */}
            {/* ============================================================================== */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sticky top-28 space-y-5">
                <h2 className="font-serif text-lg font-semibold text-[#26221F] pb-3 border-b border-[#E6DCD1]">
                  Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>

                {/* Items List */}
                <div className="divide-y divide-[#E6DCD1] max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="py-3 flex items-center gap-3">
                      <div className="relative w-12 h-16 shrink-0 bg-[#F5EFEB] rounded-xs overflow-hidden border border-[#E6DCD1]">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-medium text-[#26221F] truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-[#645E59]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#26221F]">
                        {formatPrice(item.pricePaise * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2 text-xs pt-3 border-t border-[#E6DCD1]">
                  <div className="flex justify-between text-[#645E59]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#26221F]">{formatPrice(subtotalPaise)}</span>
                  </div>

                  <div className="flex justify-between text-[#645E59]">
                    <span>Insured Shipping</span>
                    <span>
                      {shippingPaise === 0 ? (
                        <strong className="text-emerald-700">FREE</strong>
                      ) : (
                        formatPrice(shippingPaise)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E6DCD1] flex justify-between text-base">
                    <span className="font-serif font-semibold text-[#26221F]">Total Amount</span>
                    <span className="font-serif font-bold text-lg text-[#702638]">
                      {formatPrice(totalPaise)}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] disabled:bg-[#702638]/50 text-white py-4 rounded-xs font-semibold text-sm tracking-wide shadow-md transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <span>Confirm Cash on Delivery Order</span>
                  ) : (
                    <span>Proceed to Razorpay Payment</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#645E59] pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#B99A5B]" />
                  <span>Verified Safe &amp; Insured Pan-India Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
