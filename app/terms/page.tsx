import React from 'react';
import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for shopping on the Kamini Collections website.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              Legal Agreement
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F] mt-1">
              Terms of Service
            </h1>
            <p className="text-xs text-[#645E59] mt-2">Last updated: October 2026</p>
          </div>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing from the Kamini Collections website, you agree to be bound by these Terms of Service and all applicable Indian commercial laws and regulations.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              2. Product Descriptions &amp; Handloom Variations
            </h2>
            <p>
              We strive to display our saree photography with absolute color fidelity. However, due to variations in monitor displays, screen resolutions, and camera color profiles, actual silk hues may slightly differ. Saree length and blouse measurements are approximate as each piece is individually handwoven.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              3. Pricing and Order Integrity
            </h2>
            <p>
              All prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to cancel or refuse any order in the event of an inadvertent technical pricing error or sudden inventory exhaustion prior to database reconciliation.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              4. Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
