import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { ProductDetailView } from '@/components/products/product-detail-view';
import { ProductCard } from '@/components/products/product-card';
import { getProductBySlug, getRelatedProducts } from '@/services/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Saree Not Found',
    };
  }

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    '/saree.jfif';

  return {
    title: `${product.name} | Kamini Collections`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} - Authentic Handloom Saree`,
      description: product.description.slice(0, 160),
      images: [{ url: primaryImage }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category_id, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#645E59]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#702638]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#702638]">Sarees</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-[#702638]">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#26221F] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product View */}
        <ProductDetailView product={product} />

        {/* Related Sarees Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#E6DCD1]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
                You May Also Admire
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#26221F] mt-1">
                Complementary Sarees
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
