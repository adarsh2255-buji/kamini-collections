import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Award, HeartHandshake } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';

export const metadata: Metadata = {
  title: 'Our Heritage & Story',
  description: 'The story behind Kamini Collections: Preserving India’s celebrated textile handlooms and celebrating pure silk artistry.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            About Kamini Collections
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#26221F] mt-2">
            The Soul of Handwoven Artistry
          </h1>
          <div className="w-16 h-0.5 bg-[#B99A5B] mx-auto mt-4" />
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center mb-16">
          <div className="md:col-span-6 relative aspect-[3/4] rounded-xs overflow-hidden shadow-lg border border-[#E6DCD1]">
            <Image
              src="/saree.jpg"
              alt="Kamini Collections Handloom Heritage"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-6 space-y-5 text-sm sm:text-base text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-2xl font-normal text-[#26221F]">
              Woven for Life&apos;s Grandest Moments
            </h2>
            <p>
              Kamini Collections was founded with a singular devotion: to honour the timeless beauty of Indian handlooms and bring authentic, museum-quality sarees directly to women celebrating life&apos;s most cherished milestones.
            </p>
            <p>
              In an age of synthetic imitations and fast-fashion mechanization, we stand unwaveringly by the rhythmic clatter of traditional wooden looms. Every Banarasi katan silk, royal Kanchipuram pattu, and delicate sheer organza in our boutique is individually selected for its pure fibers, authentic zari, and impeccable drape.
            </p>
            <p>
              Our family-owned boutique works in direct partnership with master weavers in Varanasi, Tamil Nadu, and Bengal, ensuring fair wages and preserving centuries of sacred textile heritage.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#E6DCD1]">
          <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#702638] text-[#B99A5B] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#26221F]">Pure Silk &amp; Zari</h3>
            <p className="text-xs text-[#645E59] leading-relaxed">
              We never compromise on fiber authenticity. Tested pure silks and genuine zari that remain family heirlooms for generations.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#702638] text-[#B99A5B] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#26221F]">Direct Artisan Sourcing</h3>
            <p className="text-xs text-[#645E59] leading-relaxed">
              By working directly with generational weaving clusters, we support weaver families while providing you authentic luxury at honest value.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#702638] text-[#B99A5B] flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#26221F]">Personal Concierge</h3>
            <p className="text-xs text-[#645E59] leading-relaxed">
              Our boutique team assists with video consultations, color matching, and saree care advice via direct WhatsApp support.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-10 border-t border-[#E6DCD1]">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-8 py-3.5 rounded-xs font-medium text-sm tracking-wide shadow-md transition-all"
          >
            <span>Explore Our Saree Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
