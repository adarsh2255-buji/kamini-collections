import React from 'react';
import Image from 'next/image';
import { getCategories } from '@/services/products';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DCD1] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Taxonomy &amp; Weaves
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#26221F] mt-1">
            Saree Categories &amp; Weaves
          </h1>
          <p className="text-xs text-[#645E59] mt-1">
            Organize sarees by authentic Indian weaving regions
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-[#E6DCD1] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] bg-[#F5EFEB]">
              <Image
                src={cat.image_url || '/saree.jfif'}
                alt={cat.name}
                fill
                className="object-cover"
              />
              <span
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cat.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#26221F]">
                  {cat.name}
                </h3>
                <span className="font-mono text-[10px] text-[#B99A5B] block">
                  slug: /{cat.slug}
                </span>
                {cat.description && (
                  <p className="text-xs text-[#645E59] mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#FAF7F0] flex items-center justify-between text-xs text-[#645E59]">
                <span>Sort Order: {cat.display_order}</span>
                <span className="text-emerald-700 font-medium">Active Weave</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
