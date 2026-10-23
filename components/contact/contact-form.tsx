'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xs space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
        <h3 className="font-serif text-lg font-semibold text-emerald-950">
          Inquiry Received With Thanks
        </h3>
        <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
          Our boutique team has received your message. We will reach out to you via WhatsApp or email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
          Your Full Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Priya Nair"
          required
          className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
            Mobile Phone *
          </label>
          <input
            type="tel"
            placeholder="10-digit number"
            required
            className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="priya@example.com"
            className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
          Subject / Saree of Interest
        </label>
        <input
          type="text"
          placeholder="e.g. Inquiring about Bridal Kanchipuram Saree"
          className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
          Your Message *
        </label>
        <textarea
          rows={4}
          placeholder="Tell us how we can help you..."
          required
          className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white py-3 rounded-xs font-semibold text-xs tracking-wider uppercase transition-colors"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Submit Message</span>
      </button>
    </form>
  );
}
