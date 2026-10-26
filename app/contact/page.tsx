import React from 'react';
import type { Metadata } from 'next';
import { Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { ContactForm } from '@/components/contact/contact-form';

import { STORE_CONFIG, getWhatsAppLink } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact Boutique',
  description: 'Connect with Kamini Collections customer care, bridal consultations, and WhatsApp styling support.',
};

export default function ContactPage() {
  const whatsappUrl = getWhatsAppLink(
    'Hello Kamini Collections, I would like to inquire about your saree collections and bridal concierge.'
  );
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || STORE_CONFIG.email;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            We are Here to Assist You
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#26221F] mt-2">
            Contact Kamini Collections
          </h1>
          <p className="text-sm text-[#645E59] mt-3">
            Whether you need help selecting a wedding saree, checking custom blouse details, or tracking an order, we are delighted to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left: Contact Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs space-y-6">
              <h2 className="font-serif text-lg font-semibold text-[#702638] pb-3 border-b border-[#E6DCD1]">
                Boutique Assistance
              </h2>

              <div className="flex items-start gap-3 text-xs text-[#645E59]">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[#26221F]">WhatsApp Concierge</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#128C7E] font-medium hover:underline"
                  >
                    {STORE_CONFIG.displayPhone} (Instant Video/Chat)
                  </a>
                  <p className="text-[11px] text-[#645E59] mt-0.5">{STORE_CONFIG.operatingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#645E59]">
                <Mail className="w-4 h-4 text-[#702638] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[#26221F]">Customer Care Email</span>
                  <a href={`mailto:${contactEmail}`} className="hover:underline text-[#702638]">
                    {contactEmail}
                  </a>
                  <p className="text-[11px] text-[#645E59] mt-0.5">Typically responds within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#645E59]">
                <MapPin className="w-4 h-4 text-[#B99A5B] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[#26221F]">Store / Studio Address</span>
                  <p className="mt-0.5">
                    Kamini Collections Retail Boutique<br />
                    [Business Address to be updated by Owner]<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#645E59]">
                <Clock className="w-4 h-4 text-[#702638] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[#26221F]">Operating Hours</span>
                  <p className="mt-0.5">Monday to Saturday: 10:00 AM – 8:00 PM IST<br />Sunday: Closed for Family &amp; Loom Rest</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 border border-[#E6DCD1] rounded-xs shadow-xs">
            <h2 className="font-serif text-lg font-semibold text-[#26221F] pb-3 border-b border-[#E6DCD1] mb-6">
              Send us an Inquiry
            </h2>
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
