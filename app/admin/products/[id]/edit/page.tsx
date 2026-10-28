import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProducts } from '@/services/products';
import { paiseToRupees } from '@/lib/pricing';
import { verifyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const { products } = await getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E6DCD1]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-[#645E59] hover:text-[#702638] rounded-xs border border-[#E6DCD1] bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
              SKU: {product.sku}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#26221F]">
              Edit: {product.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
          Current Saree Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#645E59] block">Selling Price:</span>
            <strong className="text-sm font-semibold text-[#702638]">
              ₹{paiseToRupees(product.price_paise)}
            </strong>
          </div>

          <div>
            <span className="text-[#645E59] block">Current Stock:</span>
            <strong className="text-sm font-semibold text-[#26221F]">
              {product.stock_quantity} units
            </strong>
          </div>

          <div>
            <span className="text-[#645E59] block">Fabric:</span>
            <span className="text-[#26221F]">{product.fabric || 'Pure Silk'}</span>
          </div>

          <div>
            <span className="text-[#645E59] block">Status:</span>
            <span className="font-semibold text-emerald-700">
              {product.is_active ? 'Active on Storefront' : 'Inactive'}
            </span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-[#FAF7F0]">
            <span className="text-[#645E59] block mb-1">Description:</span>
            <p className="text-[#26221F] leading-relaxed">{product.description}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E6DCD1]">
          <Link
            href="/admin/products"
            className="inline-block bg-[#702638] text-white px-6 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider"
          >
            ← Return to Products List
          </Link>
        </div>
      </div>
    </div>
  );
}
