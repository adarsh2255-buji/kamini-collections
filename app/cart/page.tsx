'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { useCart } from '@/context/cart-context';
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD_PAISE } from '@/lib/pricing';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotalPaise, isHydrated } = useCart();

  const shippingPaise = calculateShipping(subtotalPaise);
  const totalPaise = subtotalPaise + shippingPaise;
  const isFreeShipping = shippingPaise === 0 && subtotalPaise > 0;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-sm text-[#645E59]">Loading your shopping bag...</p>
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
        {/* Page Title */}
        <div className="mb-8 border-b border-[#E6DCD1] pb-6">
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Review Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F] mt-1">
            Shopping Cart
          </h1>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="text-center py-20 px-4 bg-white border border-[#E6DCD1] rounded-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#F5EFEB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#702638]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#26221F]">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-sm text-[#645E59] mt-2 mb-6 max-w-md mx-auto">
              You haven’t added any sarees to your bag yet. Explore our handcrafted weaves from Banaras, Kanchipuram, and Bengal.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-7 py-3 rounded-xs font-medium text-sm transition-all shadow-sm"
            >
              <span>Explore Saree Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Populated Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Indicator */}
              <div className="p-4 bg-[#F5EFEB] border border-[#E6DCD1] rounded-xs flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#B99A5B] shrink-0" />
                <div className="flex-1 text-xs">
                  {isFreeShipping ? (
                    <span className="font-medium text-emerald-800">
                      ✓ You have unlocked <strong>Free Insured Shipping</strong> across India!
                    </span>
                  ) : (
                    <span>
                      Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more to unlock{' '}
                      <strong>Free Insured Delivery</strong>!
                    </span>
                  )}
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white border border-[#E6DCD1] rounded-xs divide-y divide-[#E6DCD1]">
                {items.map((item) => (
                  <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative w-20 h-28 sm:w-24 sm:h-32 shrink-0 bg-[#F5EFEB] rounded-xs overflow-hidden border border-[#E6DCD1]"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {item.fabric && (
                        <p className="text-[10px] uppercase tracking-wider text-[#B99A5B] font-semibold">
                          {item.fabric}
                        </p>
                      )}
                      <h3 className="font-serif text-base font-medium text-[#26221F] truncate hover:text-[#702638]">
                        <Link href={`/products/${item.slug}`}>{item.name}</Link>
                      </h3>
                      <p className="text-xs text-[#645E59] mt-0.5">SKU: {item.sku}</p>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-semibold text-sm text-[#702638]">
                          {formatPrice(item.pricePaise)}
                        </span>
                        {item.compareAtPricePaise && (
                          <span className="text-xs text-[#645E59] line-through">
                            {formatPrice(item.compareAtPricePaise)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-[#FAF7F0]">
                      <div className="flex items-center border border-[#E6DCD1] rounded-xs bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 text-[#26221F] hover:bg-[#F5EFEB]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-[#26221F] hover:bg-[#F5EFEB] disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="font-serif font-semibold text-sm text-[#26221F] min-w-16 text-right">
                        {formatPrice(item.pricePaise * item.quantity)}
                      </span>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[#645E59] hover:text-red-600 p-1.5 transition-colors"
                        title="Remove item"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-[#702638] hover:text-[#591D2B] underline"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Order Summary Box */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sticky top-28 space-y-5">
                <h2 className="font-serif text-lg font-semibold text-[#26221F] pb-3 border-b border-[#E6DCD1]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[#645E59]">
                    <span>Bag Subtotal</span>
                    <span className="font-semibold text-[#26221F]">{formatPrice(subtotalPaise)}</span>
                  </div>

                  <div className="flex justify-between text-[#645E59]">
                    <span>Estimated Shipping</span>
                    <span>
                      {isFreeShipping ? (
                        <strong className="text-emerald-700">FREE</strong>
                      ) : (
                        formatPrice(shippingPaise)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E6DCD1] flex justify-between text-sm">
                    <span className="font-serif font-semibold text-[#26221F]">Estimated Total</span>
                    <span className="font-serif font-bold text-base text-[#702638]">
                      {formatPrice(totalPaise)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#645E59] bg-[#FAF7F0] p-3 rounded-xs border border-[#E6DCD1]">
                  Prices and stock availability will be re-verified against live database inventory at checkout.
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white py-3.5 rounded-xs font-semibold text-sm tracking-wide shadow-md transition-all duration-300"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#645E59] pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Razorpay Standard Checkout &amp; COD Available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
