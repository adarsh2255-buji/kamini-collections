import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Sparkles, AlertCircle } from 'lucide-react';
import { getProducts } from '@/services/products';
import { formatPrice } from '@/lib/pricing';
import { verifyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminProductsPage() {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    redirect('/admin/login');
  }

  const { products, total } = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DCD1] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#26221F] mt-1">
            Sarees &amp; Inventory
          </h1>
          <p className="text-xs text-[#645E59] mt-1">
            Total {total} sarees currently in catalog
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-5 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Saree</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E6DCD1] rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFEB] text-[#645E59] uppercase tracking-wider border-b border-[#E6DCD1]">
              <tr>
                <th className="py-3 px-4 font-semibold">Image</th>
                <th className="py-3 px-4 font-semibold">SKU &amp; Name</th>
                <th className="py-3 px-4 font-semibold">Weave / Fabric</th>
                <th className="py-3 px-4 font-semibold">Selling Price</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DCD1]">
              {products.map((product) => {
                const rawImg =
                  product.images?.find((i) => i.is_primary)?.image_url ||
                  product.images?.[0]?.image_url ||
                  '/saree.jpg';
                const img = rawImg.replace(/\.jfif$/i, '.jpg');

                const isLow = product.stock_quantity <= 3;
                const isOut = product.stock_quantity === 0;

                return (
                  <tr key={product.id} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-10 h-14 bg-[#F5EFEB] rounded-xs overflow-hidden border border-[#E6DCD1]">
                        <Image src={img} alt={product.name} fill className="object-cover" />
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono text-[10px] text-[#B99A5B] block font-semibold">
                        {product.sku}
                      </span>
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="font-medium text-[#26221F] hover:text-[#702638] font-serif text-sm line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#702638] font-semibold mt-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-[#B99A5B]" />
                          Signature Featured
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#645E59]">
                      <span className="block font-medium text-[#26221F]">
                        {product.fabric || 'Pure Silk'}
                      </span>
                      <span className="text-[10px] text-[#645E59]">{product.color}</span>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#702638] text-sm">
                      {formatPrice(product.price_paise)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isOut
                            ? 'text-red-700'
                            : isLow
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isLow && <AlertCircle className="w-3.5 h-3.5" />}
                        {product.stock_quantity} units
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          product.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Draft / Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 text-[#702638] hover:text-[#591D2B] font-semibold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
