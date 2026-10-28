'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/pricing';
import { useCart } from '@/context/cart-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const rawImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    '/saree.jpg';
  const primaryImage = rawImage.replace(/\.jfif$/i, '.jpg');

  const discount = calculateDiscountPercentage(product.price_paise, product.compare_at_price_paise);
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <article className="group relative flex flex-col bg-white border border-[#E6DCD1] rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Product Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-[#F5EFEB]"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.fabric && (
            <span className="bg-[#FAF7F0]/90 backdrop-blur-xs text-[#26221F] text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-xs border border-[#E6DCD1]">
              {product.fabric.split(' ')[0]}
            </span>
          )}
          {product.is_featured && (
            <span className="bg-[#702638] text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#B99A5B]" />
              Signature
            </span>
          )}
        </div>

        {discount && (
          <span className="absolute top-3 right-3 bg-[#B99A5B] text-white text-[11px] font-bold px-2 py-0.5 rounded-xs shadow-xs z-10">
            {discount}% OFF
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-white text-[#26221F] font-serif text-xs uppercase tracking-widest px-4 py-2 font-semibold">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Fabric subtitle */}
          {product.fabric && (
            <p className="text-[11px] uppercase tracking-wider text-[#B99A5B] font-medium mb-1">
              {product.fabric}
            </p>
          )}

          {/* Title */}
          <h3 className="font-serif text-base font-medium text-[#26221F] line-clamp-1 group-hover:text-[#702638] transition-colors">
            <Link href={`/products/${product.slug}`} title={product.name}>
              {product.name}
            </Link>
          </h3>

          {/* Stock Indicator */}
          {isLowStock && (
            <p className="text-[11px] text-[#702638] font-medium mt-1">
              Only {product.stock_quantity} left in stock
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#702638]">
              {formatPrice(product.price_paise)}
            </span>
            {product.compare_at_price_paise && (
              <span className="text-xs text-[#645E59] line-through">
                {formatPrice(product.compare_at_price_paise)}
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="p-2 text-[#702638] hover:text-white hover:bg-[#702638] border border-[#702638]/30 rounded-xs transition-colors"
              title="Add to Cart"
              aria-label={`Add ${product.name} to Cart`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
