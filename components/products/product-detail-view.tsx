'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/pricing';
import { useCart } from '@/context/cart-context';
import { getWhatsAppLink } from '@/lib/site-config';

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedNotice, setIsAddedNotice] = useState(false);

  const images = (product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', product_id: product.id, image_url: '/saree.jpg', alt_text: product.name, sort_order: 1, is_primary: true, created_at: '' }]
  ).map((img) => ({
    ...img,
    image_url: (img.image_url || '/saree.jpg').replace(/\.jfif$/i, '.jpg'),
  }));

  const activeImage = images[selectedImageIndex] || images[0];
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const discount = calculateDiscountPercentage(product.price_paise, product.compare_at_price_paise);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAddedNotice(true);
    setTimeout(() => setIsAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const whatsappInquiryUrl = getWhatsAppLink(
    `Hello Kamini Collections, I am interested in purchasing "${product.name}" (SKU: ${product.sku}, Price: ${formatPrice(product.price_paise)}). Is it currently available for immediate dispatch?`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* ============================================================================== */}
      {/* LEFT: IMAGE GALLERY WITH THUMBNAILS */}
      {/* ============================================================================== */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails list if multiple images exist */}
        {images.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-28 rounded-xs overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-[#702638] ring-2 ring-[#702638]/20'
                    : 'border-[#E6DCD1] hover:border-[#B99A5B]'
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || product.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Primary Magnified Display */}
        <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-[#F5EFEB] border border-[#E6DCD1] shadow-sm">
          <Image
            src={activeImage.image_url}
            alt={activeImage.alt_text || product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
          />

          {discount && (
            <span className="absolute top-4 right-4 bg-[#B99A5B] text-white text-xs font-bold px-3 py-1 rounded-xs shadow-md">
              {discount}% OFF
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-white text-[#26221F] font-serif text-sm uppercase tracking-widest px-6 py-3 font-semibold shadow-lg">
                Currently Sold Out
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* RIGHT: PRODUCT DETAILS & BUYING CONTROLS */}
      {/* ============================================================================== */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div>
          {/* Category / Fabric Tag */}
          <div className="flex items-center gap-2 mb-2">
            {product.fabric && (
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B99A5B]">
                {product.fabric}
              </span>
            )}
            <span className="text-[#E6DCD1]">•</span>
            <span className="text-xs text-[#645E59]">SKU: {product.sku}</span>
          </div>

          {/* Product Title */}
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26221F] leading-tight">
            {product.name}
          </h1>

          {/* Pricing Box */}
          <div className="mt-4 p-4 bg-[#F5EFEB] border border-[#E6DCD1] rounded-xs flex items-baseline gap-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#702638]">
              {formatPrice(product.price_paise)}
            </span>
            {product.compare_at_price_paise && (
              <span className="text-sm sm:text-base text-[#645E59] line-through">
                {formatPrice(product.compare_at_price_paise)}
              </span>
            )}
            <span className="text-xs text-[#645E59] ml-auto">
              Inclusive of all taxes &amp; insurance
            </span>
          </div>

          {/* Stock Notification */}
          <div className="mt-4">
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xs">
                <span>Sold out. Inquire via WhatsApp for custom artisan re-weaving.</span>
              </div>
            ) : isLowStock ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#702638] bg-[#FAF7F0] border border-[#702638]/20 px-3 py-1.5 rounded-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B99A5B]" />
                <span>Limited Heritage Piece: Only {product.stock_quantity} left in stock</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock &amp; Ready for Express Dispatch</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="mt-6">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#26221F] mb-2">
              The Weave &amp; Story
            </h3>
            <p className="text-sm text-[#645E59] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Saree Specifications Table */}
          <div className="mt-6 border-t border-[#E6DCD1] pt-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#26221F] mb-3">
              Specifications
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {product.fabric && (
                <div className="flex justify-between py-1 border-b border-[#E6DCD1]/60">
                  <dt className="text-[#645E59]">Fabric:</dt>
                  <dd className="font-medium text-[#26221F] text-right">{product.fabric}</dd>
                </div>
              )}
              {product.color && (
                <div className="flex justify-between py-1 border-b border-[#E6DCD1]/60">
                  <dt className="text-[#645E59]">Color:</dt>
                  <dd className="font-medium text-[#26221F] text-right">{product.color}</dd>
                </div>
              )}
              {product.occasion && (
                <div className="flex justify-between py-1 border-b border-[#E6DCD1]/60">
                  <dt className="text-[#645E59]">Occasion:</dt>
                  <dd className="font-medium text-[#26221F] text-right">{product.occasion}</dd>
                </div>
              )}
              {product.saree_length && (
                <div className="flex justify-between py-1 border-b border-[#E6DCD1]/60">
                  <dt className="text-[#645E59]">Length:</dt>
                  <dd className="font-medium text-[#26221F] text-right">{product.saree_length}</dd>
                </div>
              )}
              {product.blouse_details && (
                <div className="sm:col-span-2 flex justify-between py-1 border-b border-[#E6DCD1]/60">
                  <dt className="text-[#645E59]">Blouse Piece:</dt>
                  <dd className="font-medium text-[#26221F] text-right">{product.blouse_details}</dd>
                </div>
              )}
              {product.care_instructions && (
                <div className="sm:col-span-2 flex justify-between py-1 border-b border-[#E6DCD1]/60">
                  <dt className="text-[#645E59]">Wash Care:</dt>
                  <dd className="font-medium text-[#26221F] text-right">{product.care_instructions}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quantity Selector & Purchase Actions */}
          {!isOutOfStock && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#26221F]">
                  Quantity:
                </span>
                <div className="flex items-center border border-[#E6DCD1] rounded-xs bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-[#26221F] hover:bg-[#F5EFEB] disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 text-[#26221F] hover:bg-[#F5EFEB] disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-[#FAF7F0] hover:bg-white text-[#702638] border-2 border-[#702638] py-3.5 rounded-xs font-semibold text-sm tracking-wide transition-all shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white py-3.5 rounded-xs font-semibold text-sm tracking-wide transition-all shadow-md"
                >
                  <Zap className="w-4 h-4 fill-current text-[#B99A5B]" />
                  <span>Buy Now</span>
                </button>
              </div>

              {isAddedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center justify-between animate-fadeIn">
                  <span>✓ Added to your bag!</span>
                  <button
                    onClick={() => router.push('/cart')}
                    className="font-semibold underline ml-2 hover:text-emerald-950"
                  >
                    View Bag →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Direct Inquiry */}
          <div className="mt-4">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 py-2.5 rounded-xs text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Inquire / Video Call on WhatsApp</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 pt-6 border-t border-[#E6DCD1] grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-[#B99A5B] mb-1" />
              <span className="text-[11px] font-semibold text-[#26221F]">Pan-India Delivery</span>
              <span className="text-[10px] text-[#645E59]">3-7 Business Days</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-[#B99A5B] mb-1" />
              <span className="text-[11px] font-semibold text-[#26221F]">COD Available</span>
              <span className="text-[10px] text-[#645E59]">Pay upon receipt</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-[#B99A5B] mb-1" />
              <span className="text-[11px] font-semibold text-[#26221F]">Authentic Silk</span>
              <span className="text-[10px] text-[#645E59]">Direct from looms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
