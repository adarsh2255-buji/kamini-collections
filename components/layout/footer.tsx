import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { STORE_CONFIG, getWhatsAppLink } from '@/lib/site-config';

export function Footer() {
  const whatsappUrl = getWhatsAppLink('Hello Kamini Collections, I have an inquiry about an order or collection.');

  return (
    <footer className="bg-[#26221F] text-[#FAF7F0] pt-16 pb-12 border-t-2 border-[#B99A5B]/30 mt-auto">
      {/* Trust & Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-[#FAF7F0]/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-[#702638] text-[#B99A5B] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#FAF7F0]">100% Handloom Authenticity</h4>
              <p className="text-xs text-[#FAF7F0]/70 mt-1">Directly sourced from generational master weavers across India.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-[#702638] text-[#B99A5B] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#FAF7F0]">Pan-India Insured Express</h4>
              <p className="text-xs text-[#FAF7F0]/70 mt-1">Free delivery above ₹2,000 with real-time tracking to your doorstep.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-[#702638] text-[#B99A5B] shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#FAF7F0]">Cash on Delivery & Easy Return</h4>
              <p className="text-xs text-[#FAF7F0]/70 mt-1">Pay comfortably upon delivery or choose secure online checkout.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-[#702638] text-[#B99A5B] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#FAF7F0]">Razorpay Verified Security</h4>
              <p className="text-xs text-[#FAF7F0]/70 mt-1">UPI, Credit/Debit cards & NetBanking with 256-bit bank encryption.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl tracking-wider text-[#FAF7F0] font-semibold">
                KAMINI
              </span>
              <span className="block text-[11px] tracking-[0.25em] text-[#B99A5B] font-medium uppercase">
                Collections
              </span>
            </Link>
            <p className="text-sm text-[#FAF7F0]/75 max-w-sm leading-relaxed">
              Preserving and presenting the timeless heritage of Indian handlooms. Each Kamini Collections saree is a celebrated piece of textile art, handwoven with pride, dedication, and pure silk.
            </p>
            <div className="pt-2 text-xs text-[#DFC89B]">
              <span>Boutique Care: </span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium text-white"
              >
                {STORE_CONFIG.displayPhone} (WhatsApp)
              </a>
            </div>
          </div>

          {/* Weaves */}
          <div>
            <h5 className="font-serif text-sm tracking-wider uppercase text-[#B99A5B] font-semibold mb-4">
              Signature Weaves
            </h5>
            <ul className="space-y-2.5 text-sm text-[#FAF7F0]/70">
              <li>
                <Link href="/categories/banarasi-silk" className="hover:text-white transition-colors">
                  Banarasi Silk
                </Link>
              </li>
              <li>
                <Link href="/categories/kanchipuram-silk" className="hover:text-white transition-colors">
                  Kanchipuram Pattu
                </Link>
              </li>
              <li>
                <Link href="/categories/chanderi-organza" className="hover:text-white transition-colors">
                  Organza & Chanderi
                </Link>
              </li>
              <li>
                <Link href="/categories/cotton-linen" className="hover:text-white transition-colors">
                  Artisanal Jamdani Cotton
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#B99A5B] transition-colors font-medium">
                  Browse All Collections →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Help */}
          <div>
            <h5 className="font-serif text-sm tracking-wider uppercase text-[#B99A5B] font-semibold mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-sm text-[#FAF7F0]/70">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Boutique
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Kamini Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h5 className="font-serif text-sm tracking-wider uppercase text-[#B99A5B] font-semibold mb-4">
              Policies & Store
            </h5>
            <ul className="space-y-2.5 text-sm text-[#FAF7F0]/70">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-xs text-[#B99A5B] hover:text-white transition-colors">
                  Staff / Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#FAF7F0]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F0]/50 gap-4">
        <p>© 2026 Kamini Collections. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Accepting UPI • Cards • NetBanking • Cash on Delivery</span>
        </p>
      </div>
    </footer>
  );
}
