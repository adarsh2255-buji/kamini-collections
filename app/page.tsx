import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { ProductCard } from '@/components/products/product-card';
import { getFeaturedProducts, getCategories } from '@/services/products';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* ============================================================================== */}
        {/* HERO BANNER SECTION */}
        {/* ============================================================================== */}
        <section className="relative bg-[#F5EFEB] border-b border-[#E6DCD1] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Editorial Headline & Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F0] border border-[#B99A5B]/40 rounded-full text-xs font-medium text-[#702638]">
                  <Sparkles className="w-3.5 h-3.5 text-[#B99A5B]" />
                  <span>The Festive & Bridal Collection 2026</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#26221F] font-normal leading-[1.15]">
                  Authentic Handlooms,{' '}
                  <span className="italic font-serif text-[#702638] font-medium">
                    Woven with Soul
                  </span>{' '}
                  and Royal Grace.
                </h1>

                <p className="text-base sm:text-lg text-[#645E59] max-w-xl leading-relaxed">
                  Discover exquisite pure Banarasi katan silk, authentic temple border Kanchipuram pattu, and delicate sheer organza sarees. Handcrafted by master weavers across India for life’s most cherished moments.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-8 py-3.5 rounded-xs font-medium text-sm tracking-wide shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <span>Explore All Sarees</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/categories/kanchipuram-silk"
                    className="inline-flex items-center justify-center gap-2 bg-[#FAF7F0] hover:bg-white text-[#26221F] border border-[#B99A5B] px-7 py-3.5 rounded-xs font-medium text-sm tracking-wide transition-all"
                  >
                    <span>Bridal Kanchipuram</span>
                  </Link>
                </div>

                {/* Subtle Value Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E6DCD1]/80 max-w-lg">
                  <div>
                    <span className="block font-serif text-lg font-semibold text-[#702638]">100%</span>
                    <span className="text-xs text-[#645E59]">Pure Silk & Zari</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg font-semibold text-[#702638]">Pan-India</span>
                    <span className="text-xs text-[#645E59]">Insured Shipping</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg font-semibold text-[#702638]">COD</span>
                    <span className="text-xs text-[#645E59]">Available at Door</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Frame */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-md aspect-[3/4] rounded-sm overflow-hidden shadow-2xl border-4 border-[#FAF7F0] ring-1 ring-[#B99A5B]/30">
                  <Image
                    src="/saree.jfif"
                    alt="Kamini Collections Royal Crimson Banarasi Silk Saree"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-[11px] uppercase tracking-widest text-[#DFC89B] font-medium">
                      Handcrafted Masterpiece
                    </span>
                    <h3 className="font-serif text-xl font-medium">
                      Kadwa Banarasi Silk Saree
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Available with unstitched brocade blouse piece
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================================== */}
        {/* SHOP BY WEAVE / CATEGORY */}
        {/* ============================================================================== */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B99A5B] font-semibold">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26221F] mt-2">
              Explore by Signature Weave
            </h2>
            <div className="w-16 h-0.5 bg-[#B99A5B] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative flex flex-col bg-white border border-[#E6DCD1] overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5EFEB]">
                  <Image
                    src={category.image_url || '/saree.jfif'}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#26221F]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-lg font-medium group-hover:text-[#DFC89B] transition-colors">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-[#DFC89B] mt-1 font-medium">
                      <span>View Collection</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================================== */}
        {/* FEATURED BESTSELLERS */}
        {/* ============================================================================== */}
        <section className="py-16 sm:py-20 bg-[#F5EFEB] border-y border-[#E6DCD1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#B99A5B] font-semibold">
                  Handpicked by Kamini
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26221F] mt-1">
                  Signature Sarees
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#702638] hover:text-[#591D2B] transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================================== */}
        {/* BRAND HERITAGE & CRAFTSMANSHIP STORY */}
        {/* ============================================================================== */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-xl border border-[#E6DCD1]">
                <Image
                  src="/kanchipuram.jpg"
                  alt="Authentic Kanchipuram Weaving Craftsmanship"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-[0.28em] text-[#B99A5B] font-semibold">
                Our Heritage & Artistry
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26221F] leading-snug">
                Honouring the Generations Who Weave the Fabric of India
              </h2>

              <p className="text-sm sm:text-base text-[#645E59] leading-relaxed">
                At <strong className="text-[#26221F]">Kamini Collections</strong>, our passion begins at the wooden looms where master artisans spend weeks interlacing pure silk with golden zari. We eliminate middlemen to bring authentic handlooms straight from heritage weaving clusters into your wardrobe.
              </p>

              <p className="text-sm sm:text-base text-[#645E59] leading-relaxed">
                Whether you are stepping into a wedding mandap, welcoming an auspicious festival, or gifting a cherished heirloom, each Kamini saree carries elegance that transcends fleeting trends.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#702638] hover:text-[#591D2B] border-b border-[#702638] pb-1 transition-all"
                >
                  <span>Read the Story of Kamini Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
