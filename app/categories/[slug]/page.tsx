import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { ProductCard } from '@/components/products/product-card';
import { getCategoryBySlug, getProducts } from '@/services/products';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Sarees`,
    description: category.description || `Explore our handpicked collection of authentic ${category.name} sarees at Kamini Collections.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products, total } = await getProducts({ category: slug });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Category Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto border-b border-[#E6DCD1] pb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-[#645E59] uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-[#702638]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#702638]">Collections</Link>
            <span>/</span>
            <span className="text-[#B99A5B] font-semibold">{category.name}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#26221F] mt-2">
            {category.name} Sarees
          </h1>

          {category.description && (
            <p className="text-sm sm:text-base text-[#645E59] mt-3 leading-relaxed">
              {category.description}
            </p>
          )}

          <p className="text-xs text-[#B99A5B] font-semibold tracking-wider mt-4">
            {total} {total === 1 ? 'Design' : 'Designs'} Available
          </p>
        </div>

        {/* Category Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white border border-[#E6DCD1] rounded-xs">
            <h3 className="font-serif text-xl font-medium text-[#26221F]">
              No Sarees Currently in this Weave
            </h3>
            <p className="text-sm text-[#645E59] mt-2 mb-6">
              Our artisans are currently handweaving fresh pieces for this collection.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#702638] text-white px-6 py-2.5 rounded-xs text-sm font-medium"
            >
              Browse All Sarees
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
