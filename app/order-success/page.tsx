import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, Clock, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { formatPrice } from '@/lib/pricing';
import { getWhatsAppLink } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Thank you for shopping at Kamini Collections. Your order has been placed.',
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const orderNumber = typeof resolvedParams.order_number === 'string' ? resolvedParams.order_number : 'KC-PENDING';
  const method = typeof resolvedParams.method === 'string' ? resolvedParams.method : 'cod';
  const paymentId = typeof resolvedParams.payment_id === 'string' ? resolvedParams.payment_id : null;
  const rawTotal = typeof resolvedParams.total === 'string' ? parseInt(resolvedParams.total, 10) : null;

  const isCod = method === 'cod';
  const isPaidOnline = method === 'razorpay' && Boolean(paymentId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#26221F]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 sm:p-10 shadow-sm text-center">
          {/* Status Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-50 text-emerald-700">
            {isPaidOnline ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <Clock className="w-10 h-10 text-[#702638]" />
            )}
          </div>

          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Thank you for shopping with Kamini Collections
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26221F] mt-2">
            {isPaidOnline ? 'Payment Verified & Order Confirmed!' : 'Order Placed Successfully!'}
          </h1>

          <div className="mt-6 p-4 bg-[#F5EFEB] border border-[#E6DCD1] rounded-xs inline-block max-w-md w-full text-left">
            <div className="flex justify-between py-1 text-xs border-b border-[#E6DCD1]/60">
              <span className="text-[#645E59]">Order Reference:</span>
              <strong className="font-mono text-[#702638] text-sm">{orderNumber}</strong>
            </div>

            <div className="flex justify-between py-1 text-xs border-b border-[#E6DCD1]/60">
              <span className="text-[#645E59]">Payment Method:</span>
              <span className="font-medium text-[#26221F]">
                {isCod ? 'Cash on Delivery (COD)' : 'Razorpay Online Payment'}
              </span>
            </div>

            <div className="flex justify-between py-1 text-xs border-b border-[#E6DCD1]/60">
              <span className="text-[#645E59]">Payment Status:</span>
              <span
                className={`font-semibold ${
                  isPaidOnline
                    ? 'text-emerald-700'
                    : isCod
                    ? 'text-[#702638]'
                    : 'text-amber-700'
                }`}
              >
                {isPaidOnline
                  ? 'Paid (Verified Online)'
                  : isCod
                  ? 'Pending (To be collected at delivery)'
                  : 'Awaiting Webhook Confirmation'}
              </span>
            </div>

            {paymentId && (
              <div className="flex justify-between py-1 text-xs border-b border-[#E6DCD1]/60">
                <span className="text-[#645E59]">Payment ID:</span>
                <span className="font-mono text-[11px] text-[#26221F]">{paymentId}</span>
              </div>
            )}

            {rawTotal != null && !isNaN(rawTotal) && (
              <div className="flex justify-between py-1 text-xs pt-2">
                <span className="text-[#645E59]">Amount:</span>
                <span className="font-bold text-sm text-[#702638]">{formatPrice(rawTotal)}</span>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-8 text-left max-w-md mx-auto space-y-3 text-xs text-[#645E59]">
            <h3 className="font-serif text-sm font-semibold text-[#26221F] uppercase tracking-wider">
              What happens next?
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>Our team will carefully inspect your handcrafted saree and fold it in protective muslin.</li>
              <li>Your order will be dispatched via insured express courier within 24-48 business hours.</li>
              <li>You can track the shipment journey anytime using your Order Number.</li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/track-order?order_number=${encodeURIComponent(orderNumber)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-7 py-3 rounded-xs font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Track Your Order</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FAF7F0] hover:bg-white text-[#26221F] border border-[#B99A5B] px-7 py-3 rounded-xs font-medium text-xs tracking-wider uppercase transition-all"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Direct Support */}
          <div className="mt-10 pt-6 border-t border-[#E6DCD1] text-xs text-[#645E59] flex flex-col sm:flex-row items-center justify-center gap-4">
            <span>Need assistance with this order?</span>
            <a
              href={getWhatsAppLink(
                `Hello Kamini Collections, I placed order ${orderNumber} and would like an update.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#128C7E] font-semibold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
