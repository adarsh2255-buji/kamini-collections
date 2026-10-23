import React from 'react';
import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Kamini Collections privacy commitment, customer data protection, and secure payment handling.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              Data Protection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#26221F] mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#645E59] mt-2">Last updated: October 2026</p>
          </div>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              1. Information We Collect
            </h2>
            <p>
              When you purchase or inquire on Kamini Collections, we collect necessary contact and delivery information including your name, 10-digit mobile number, optional email address, and shipping destination to fulfill your order.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              2. Payment Information Security
            </h2>
            <p>
              We do not store your credit card numbers, debit card details, UPI PINs, or bank account credentials on our servers. All digital transactions are processed through Razorpay, a PCI-DSS Level 1 compliant payment gateway with bank-grade 256-bit encryption.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#645E59] leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              3. Use of Your Personal Details
            </h2>
            <p>
              Your personal information is used solely to dispatch orders, send shipment notifications, verify delivery for Cash on Delivery, and respond to your customer service inquiries. We never sell, rent, or trade your data to third-party advertisers.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
