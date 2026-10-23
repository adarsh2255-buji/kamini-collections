import React from 'react';
import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { ProductCard } from '@/components/products/product-card';
import { ShopFiltersBar } from '@/components/shop/shop-filters';
import { getProducts, getCategories } from '@/services/products';
import { ShopFilters } from '@/types';

export const metadata: Metadata = {
  title: 'All Sarees Collection',
  description:
    'Browse the complete Kamini Collections catalog of authentic Banarasi silk, Kanchipuram bridal pattu, handcrafted organza, and artisanal cotton sarees.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const fabric = typeof resolvedParams.fabric === 'string' ? resolvedParams.fabric : undefined;
  const color = typeof resolvedParams.color === 'string' ? resolvedParams.color : undefined;
  const occasion = typeof resolvedParams.occasion === 'string' ? resolvedParams.occasion : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? (resolvedParams.sort as ShopFilters['sort']) : 'newest';
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const inStockOnly = resolvedParams.inStockOnly === 'true';

  const [{ products, total }, categories] = await Promise.all([
    getProducts({
      category,
      fabric,
      color,
      occasion,
      sort,
      search,
      inStockOnly,
    }),
    getCategories(),
  ]);

  // Extract unique filter options from the current database catalog
  const fabrics = Array.from(
    new Set(
      products
        .map((p) => p.fabric)
        .filter(Boolean)
        .map((f) => f!.split(' ')[0])
    )
  ) as string[];

  const colors = Array.from(
    new Set(
      products
        .map((p) => p.color)
        .filter(Boolean)
        .map((c) => c!.split(' ')[0])
    )
  ) as string[];

  const occasions = ['Bridal', 'Wedding', 'Festive', 'Party', 'Casual'];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb & Header */}
        <div className="mb-8 border-b border-[#E6DCD1] pb-6">
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Catalog &amp; Collections
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F]">
              Handcrafted Saree Collection
            </h1>
            <p className="text-xs text-[#645E59]">
              Showing <strong className="text-[#26221F]">{total}</strong> authentic {total === 1 ? 'saree' : 'sarees'}
            </p>
          </div>
        </div>

        {/* Filters and Product Grid Container */}
        <div className="flex flex-col">
          <ShopFiltersBar
            categories={categories}
            availableFabrics={fabrics}
            availableColors={colors}
            availableOccasions={occasions}
            activeCategory={category}
            activeFabric={fabric}
            activeColor={color}
            activeOccasion={occasion}
            activeSort={sort}
            activeSearch={search}
            inStockOnly={inStockOnly}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Products Grid */}
            <div className="flex-1">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-4 bg-white border border-[#E6DCD1] rounded-xs">
                  <h3 className="font-serif text-xl font-medium text-[#26221F]">
                    No Sarees Found
                  </h3>
                  <p className="text-sm text-[#645E59] mt-2 max-w-md mx-auto">
                    We couldn’t find any sarees matching your selected filters. Try adjusting your search or clearing active filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
