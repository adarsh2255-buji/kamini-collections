'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Category } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    description: '',
    fabric: 'Pure Katan Silk',
    color: '',
    occasion: 'Bridal, Wedding, Festive',
    sareeLength: '5.5 Meters',
    blouseDetails: 'Includes unstitched matching blouse piece (0.8 Meter)',
    careInstructions: 'Dry clean only. Store wrapped in soft muslin cloth.',
    priceRupees: '',
    compareAtPriceRupees: '',
    stockQuantity: '10',
    isActive: true,
    isFeatured: false,
    imageUrl: '/saree.jfif',
  });

  // Fetch categories for dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories) setCategories(data.categories);
        }
      } catch (err) {
        console.warn('Could not fetch categories:', err);
      }
    }
    loadCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const generatedSku = `KC-${val.slice(0, 3).toUpperCase() || 'SAR'}-${Math.floor(100 + Math.random() * 900)}`;

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
      sku: prev.sku || generatedSku,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(formData.priceRupees);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid selling price in Rupees');
      return;
    }

    const compareNum = formData.compareAtPriceRupees
      ? parseFloat(formData.compareAtPriceRupees)
      : null;

    const stockNum = parseInt(formData.stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Please enter a valid stock quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          sku: formData.sku.trim(),
          category_id: formData.categoryId || undefined,
          description: formData.description.trim(),
          fabric: formData.fabric.trim() || undefined,
          color: formData.color.trim() || undefined,
          occasion: formData.occasion.trim() || undefined,
          saree_length: formData.sareeLength.trim() || undefined,
          blouse_details: formData.blouseDetails.trim() || undefined,
          care_instructions: formData.careInstructions.trim() || undefined,
          price_rupees: priceNum,
          compare_at_price_rupees: compareNum,
          stock_quantity: stockNum,
          is_active: formData.isActive,
          is_featured: formData.isFeatured,
          image_urls: formData.imageUrl ? [formData.imageUrl.trim()] : ['/saree.jfif'],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save saree');
      }

      alert('Saree created successfully!');
      router.push('/admin/products');
    } catch (err: unknown) {
      console.error('Save product error:', err);
      const msg = err instanceof Error ? err.message : 'Error creating product';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Product Studio
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#26221F]">
              Add New Saree
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
            1. Saree Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Saree Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Crimson Kadwa Banarasi Silk Saree"
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Unique SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="KC-BAN-001"
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638] uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="royal-crimson-banarasi-silk"
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Weave / Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Description &amp; Heritage Story *
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the weaving technique, zari details, and drape feel..."
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
            2. Pricing &amp; Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.priceRupees}
                onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                placeholder="12500"
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Compare-at Price (₹ INR)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.compareAtPriceRupees}
                onChange={(e) => setFormData({ ...formData, compareAtPriceRupees: e.target.value })}
                placeholder="15000"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="10"
                required
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>
        </div>

        {/* Saree Specifications */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
            3. Textile Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Fabric
              </label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                placeholder="Pure Katan Silk"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Crimson Red & Antique Gold"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Occasion
              </label>
              <input
                type="text"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                placeholder="Bridal, Wedding, Festive"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Saree Length
              </label>
              <input
                type="text"
                value={formData.sareeLength}
                onChange={(e) => setFormData({ ...formData, sareeLength: e.target.value })}
                placeholder="5.5 Meters"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Blouse Details
              </label>
              <input
                type="text"
                value={formData.blouseDetails}
                onChange={(e) => setFormData({ ...formData, blouseDetails: e.target.value })}
                placeholder="Includes unstitched matching blouse piece (0.8 Meter)"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={formData.careInstructions}
                onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                placeholder="Dry clean only."
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Primary Image URL or Asset Path
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/saree.jfif or /kanchipuram.jpg"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded-xs text-[#702638] focus:ring-[#702638]"
            />
            <span className="text-sm font-semibold text-[#26221F]">
              Publish Saree to Live Storefront
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded-xs text-[#702638] focus:ring-[#702638]"
            />
            <span className="text-sm font-semibold text-[#26221F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B99A5B]" />
              Feature in Homepage Signature Collection
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-[#E6DCD1] rounded-xs text-xs font-semibold uppercase tracking-wider text-[#645E59] hover:bg-[#F5EFEB]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-8 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Saree...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Saree</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
