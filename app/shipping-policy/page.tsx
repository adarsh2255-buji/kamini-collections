import React from 'react';
import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Learn about Kamini Collections insured Pan-India shipping timelines, delivery fees, and order dispatch.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              Transparent Operations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F] mt-1">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-xs text-[#645E59] mt-2">Last updated: October 2026</p>
          </div>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              1. Domestic Shipping Coverage
            </h2>
            <p>
              Kamini Collections ships across all serviceable pin codes in India through trusted premium logistics partners including Blue Dart, Delhivery, DTDC, and India Post Speed Post.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              2. Shipping Charges
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Complimentary Free Shipping:</strong> Applicable on all prepaid and Cash on Delivery (COD) orders with an order total of ₹2,000 and above.
              </li>
              <li>
                <strong>Standard Shipping:</strong> A flat shipping charge of ₹150 applies to orders below ₹2,000.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              3. Processing and Delivery Timelines
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Dispatch:</strong> Orders are verified, folded in protective breathable muslin wraps, and dispatched from our studio within 24 to 48 business hours.
              </li>
              <li>
                <strong>Metro Cities:</strong> Typically delivered within 2 to 4 business days post-dispatch.
              </li>
              <li>
                <strong>Rest of India:</strong> Typically delivered within 4 to 7 business days post-dispatch.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              4. Real-Time Tracking &amp; Transit Insurance
            </h2>
            <p>
              Once your saree package is handed over to our courier partner, you will receive your tracking details. You can also track your shipment status anytime directly on our <a href="/track-order" className="text-[#702638] underline font-medium">Track Order</a> page. Every shipment is fully insured in transit against loss or damage.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              5. Cash on Delivery (COD) Protocol
            </h2>
            <p>
              For COD orders, our courier partners will collect the exact invoice amount in cash or via on-the-spot UPI QR code upon delivery. We kindly request customers to keep payment ready.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
