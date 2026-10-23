'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Category } from '@/types';

interface ShopFiltersProps {
  categories: Category[];
  availableFabrics: string[];
  availableColors: string[];
  availableOccasions: string[];
  activeCategory?: string;
  activeFabric?: string;
  activeColor?: string;
  activeOccasion?: string;
  activeSort?: string;
  activeSearch?: string;
  inStockOnly?: boolean;
}

export function ShopFiltersBar({
  categories,
  availableFabrics,
  availableColors,
  availableOccasions,
  activeCategory,
  activeFabric,
  activeColor,
  activeOccasion,
  activeSort = 'newest',
  activeSearch,
  inStockOnly,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
    setIsMobileDrawerOpen(false);
  };

  const hasActiveFilters = Boolean(
    activeCategory || activeFabric || activeColor || activeOccasion || activeSearch || inStockOnly
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="font-serif text-sm font-semibold text-[#26221F] mb-3 uppercase tracking-wider">
          Weave & Category
        </h4>
        <div className="space-y-1.5 text-sm">
          <button
            type="button"
            onClick={() => updateParam('category', null)}
            className={`w-full text-left py-1 px-2 rounded-xs transition-colors ${
              !activeCategory
                ? 'bg-[#702638] text-white font-medium'
                : 'text-[#26221F] hover:bg-[#F5EFEB]'
            }`}
          >
            All Weaves
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`w-full text-left py-1 px-2 rounded-xs transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-[#702638] text-white font-medium'
                  : 'text-[#26221F] hover:bg-[#F5EFEB]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric Filter */}
      <div>
        <h4 className="font-serif text-sm font-semibold text-[#26221F] mb-3 uppercase tracking-wider">
          Fabric
        </h4>
        <div className="space-y-1.5 text-sm">
          <button
            type="button"
            onClick={() => updateParam('fabric', null)}
            className={`w-full text-left py-1 px-2 rounded-xs transition-colors ${
              !activeFabric ? 'font-semibold text-[#702638]' : 'text-[#645E59] hover:text-[#26221F]'
            }`}
          >
            All Fabrics
          </button>
          {availableFabrics.map((fab) => (
            <button
              key={fab}
              type="button"
              onClick={() => updateParam('fabric', fab)}
              className={`w-full text-left py-1 px-2 rounded-xs transition-colors ${
                activeFabric?.toLowerCase() === fab.toLowerCase()
                  ? 'font-semibold text-[#702638] bg-[#F5EFEB]'
                  : 'text-[#645E59] hover:text-[#26221F]'
              }`}
            >
              {fab}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Filter */}
      <div>
        <h4 className="font-serif text-sm font-semibold text-[#26221F] mb-3 uppercase tracking-wider">
          Occasion
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {availableOccasions.map((occ) => (
            <button
              key={occ}
              type="button"
              onClick={() => updateParam('occasion', activeOccasion === occ ? null : occ)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activeOccasion === occ
                  ? 'bg-[#702638] text-white border-[#702638]'
                  : 'bg-white text-[#26221F] border-[#E6DCD1] hover:border-[#B99A5B]'
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Filter Toggle */}
      <div className="pt-2 border-t border-[#E6DCD1]">
        <label className="flex items-center gap-2 text-sm text-[#26221F] cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(inStockOnly)}
            onChange={(e) => updateParam('inStockOnly', e.target.checked ? 'true' : null)}
            className="rounded-xs text-[#702638] focus:ring-[#702638] border-[#E6DCD1]"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#702638] border border-[#702638]/40 py-2 rounded-xs hover:bg-[#702638] hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Top Filter and Sort Controls for Desktop & Mobile */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-4 sm:px-6 bg-[#F5EFEB] border border-[#E6DCD1] rounded-xs mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-[#702638] text-white text-xs font-medium px-3.5 py-2 rounded-xs"
          >
            <Filter className="w-4 h-4" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {activeSearch && (
            <div className="flex items-center gap-1.5 text-xs bg-white border border-[#B99A5B] px-3 py-1.5 rounded-full">
              <span>Search: &ldquo;{activeSearch}&rdquo;</span>
              <button
                type="button"
                onClick={() => updateParam('search', null)}
                className="hover:text-[#702638]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeCategory && (
            <div className="flex items-center gap-1.5 text-xs bg-white border border-[#B99A5B] px-3 py-1.5 rounded-full">
              <span>Weave: {activeCategory}</span>
              <button
                type="button"
                onClick={() => updateParam('category', null)}
                className="hover:text-[#702638]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <SlidersHorizontal className="w-4 h-4 text-[#645E59] hidden sm:inline" />
          <span className="text-xs text-[#645E59] hidden sm:inline font-medium">Sort By:</span>
          <select
            value={activeSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-white border border-[#E6DCD1] rounded-xs py-1.5 px-3 text-xs text-[#26221F] focus:outline-none focus:border-[#702638]"
          >
            <option value="newest">Newest Additions</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Desktop Sidebar Container (Used on shop page) */}
      <aside className="hidden lg:block w-64 shrink-0 pr-8">
        <div className="bg-white p-5 border border-[#E6DCD1] rounded-xs sticky top-28">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Drawer Modal */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#FAF7F0] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DCD1] mb-6">
                <span className="font-serif text-lg font-semibold text-[#702638]">
                  Filter Sarees
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-[#26221F] hover:text-[#702638]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
            </div>

            <div className="pt-6 border-t border-[#E6DCD1] mt-6">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full bg-[#702638] text-white py-2.5 rounded-xs text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
