'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const prefilledMessage = encodeURIComponent(
    'Hello Kamini Collections, I would like to inquire about your saree collections.'
  );

  return (
    <aside aria-label="Customer WhatsApp Support">
      <a
        href={`https://wa.me/${whatsappNumber}?text=${prefilledMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        title="Chat with Kamini Collections on WhatsApp"
        aria-label="Direct WhatsApp assistance"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
          WhatsApp Care
        </span>
      </a>
    </aside>
  );
}
