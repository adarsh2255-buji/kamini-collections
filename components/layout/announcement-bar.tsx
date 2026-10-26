'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Phone, ShieldCheck } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/site-config';

export function AnnouncementBar() {
  const whatsappUrl = getWhatsAppLink(
    'Hello Kamini Collections, I would like to inquire about your saree collections.'
  );

  return (
    <div className="bg-[#702638] text-[#FAF7F0] text-xs font-medium py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Sparkles className="w-3.5 h-3.5 text-[#B99A5B] shrink-0" />
          <span>
            Complimentary Insured Shipping Across India on orders above ₹2,000 | Cash on Delivery Available
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#DFC89B]">
          <Link
            href="/track-order"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </Link>
          <span className="text-[#91753D]">|</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Care</span>
          </a>
        </div>
      </div>
    </div>
  );
}
