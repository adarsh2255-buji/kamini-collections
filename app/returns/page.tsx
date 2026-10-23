import React from 'react';
import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy',
  description: 'Understand Kamini Collections policy regarding handloom saree inspection, returns, and exchanges.',
};

export default function ReturnsPolicyPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              Quality Assurance
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F] mt-1">
              Returns &amp; Exchange Policy
            </h1>
            <p className="text-xs text-[#645E59] mt-2">Last updated: October 2026</p>
          </div>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              1. The Nature of Authentic Handlooms
            </h2>
            <p>
              Each saree in our collection is painstakingly woven by hand. Slight irregularities in weaving, slubs in hand-spun yarn, or minor color variations are inherent signatures of artisanal handloom creation and should not be considered defects.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              2. Return Eligibility Window
            </h2>
            <p>
              If you receive a package that is physically damaged in transit or has a genuine manufacturing defect, please notify us within <strong>48 hours of delivery</strong> by contacting our WhatsApp concierge or emailing our customer support.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              3. Condition for Returns &amp; Exchanges
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The saree must remain unworn, unwashed, and unpleated.</li>
              <li>All original boutique tags, folds, and packaging (including muslin cloth and box) must be intact.</li>
              <li>The blouse piece must remain attached and unstitched. If the blouse piece has been cut or altered, returns cannot be accepted.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              4. Return Initiation Process
            </h2>
            <p>
              To initiate a return or exchange request, please message our care team at{' '}
              <a href={`https://wa.me/${whatsappNumber}`} className="text-[#702638] font-medium underline">
                WhatsApp Care
              </a>{' '}
              along with your Order Reference and a brief photo/video of the issue. Our team will arrange a reverse pickup where serviceable.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
