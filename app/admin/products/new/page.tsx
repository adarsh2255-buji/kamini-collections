'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Sparkles,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Plus,
} from 'lucide-react';
import { Category } from '@/types';
import { createClient } from '@/lib/supabase/client';

const PRESET_ASSETS = [
  { label: 'Banarasi Kadwa', url: '/saree.jfif' },
  { label: 'Kanchipuram Pattu', url: '/kanchipuram.jpg' },
  { label: 'Organza Floral', url: '/organza.jpg' },
  { label: 'Jamdani Weave', url: '/jamdani.jpg' },
];

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Images state (first element is always the primary cover image)
  const [images, setImages] = useState<string[]>(['/saree.jfif']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

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
  });

  // Verify client session and fetch categories
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.push('/admin/login');
        }
      }
    }
    checkAuth();

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
  }, [router]);

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

  // Upload handler for Supabase Storage
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      setImages((prev) => {
        // If only default preset existed, replace it with actual uploaded files
        if (prev.length === 1 && prev[0] === '/saree.jfif') {
          return uploadedUrls;
        }
        return [...prev, ...uploadedUrls];
      });
    } catch (err: unknown) {
      console.error('Image upload failed:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddPreset = (url: string) => {
    setImages((prev) => {
      if (prev.includes(url)) return prev;
      if (prev.length === 1 && prev[0] === '/saree.jfif' && url !== '/saree.jfif') {
        return [url];
      }
      return [...prev, url];
    });
  };

  const handleAddCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      setUploadError('Please enter a valid URL (starting with http://, https://, or /)');
      return;
    }

    setImages((prev) => {
      if (prev.includes(trimmed)) return prev;
      if (prev.length === 1 && prev[0] === '/saree.jfif') {
        return [trimmed];
      }
      return [...prev, trimmed];
    });
    setCustomUrlInput('');
    setUploadError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(formData.priceRupees);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid selling price in Rupees');
      return;
    }

    const compareNum =
      formData.compareAtPriceRupees && !isNaN(parseFloat(formData.compareAtPriceRupees))
        ? parseFloat(formData.compareAtPriceRupees)
        : null;

    const stockNum = parseInt(formData.stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Please enter a valid stock quantity');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one saree photo or select a boutique preset');
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
          category_id: formData.categoryId ? formData.categoryId.trim() : null,
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
          image_urls: images,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        let errorMsg = data.error || 'Failed to save saree';
        if (data.details) {
          const detailMessages = Object.entries(data.details)
            .map(([field, errs]) => `${field.replace(/_/g, ' ')}: ${(errs as string[]).join(', ')}`)
            .join(' | ');
          if (detailMessages) {
            errorMsg = `${errorMsg}: ${detailMessages}`;
          }
        }
        throw new Error(errorMsg);
      }

      alert('Saree published successfully!');
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
            className="p-2 text-[#645E59] hover:text-[#702638] rounded-xs border border-[#E6DCD1] bg-white transition-colors"
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Saree Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Crimson Kadwa Banarasi Silk Saree"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm font-mono text-xs focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                SKU Reference *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm font-mono text-xs focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Weave Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              >
                <option value="">Select an authentic weave collection...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Artisanal Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the weaving technique, zari craftsmanship, motifs, and texture..."
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
            Pricing &amp; Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={formData.priceRupees}
                onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                placeholder="12500"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Original Price (₹ MRP)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.compareAtPriceRupees}
                onChange={(e) => setFormData({ ...formData, compareAtPriceRupees: e.target.value })}
                placeholder="15000"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Units in Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>
        </div>

        {/* Saree Specifications Card */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#26221F] pb-2 border-b border-[#E6DCD1]">
            Fabric &amp; Craftsmanship Specifications
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
                placeholder="Pure Katan Silk, Mulberry Silk"
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
                Color Palette
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
          </div>
        </div>

        {/* IMAGE UPLOAD & GALLERY SECTION */}
        <div className="bg-white p-6 border border-[#E6DCD1] rounded-xs shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E6DCD1] gap-2">
            <div>
              <h2 className="font-serif text-base font-semibold text-[#26221F] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#702638]" />
                <span>Saree Photography &amp; Gallery</span>
              </h2>
              <p className="text-xs text-[#645E59]">
                Upload high-resolution photos of the saree (pallu, border, pleats, blouse piece). The first image serves as the primary storefront cover.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#702638] bg-[#F5EFEB] px-2.5 py-1 rounded-xs shrink-0">
              {images.length} {images.length === 1 ? 'Photo' : 'Photos'} Selected
            </span>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                handleFileUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xs p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#702638] bg-[#FAF7F0]'
                : 'border-[#E6DCD1] hover:border-[#B99A5B] bg-[#FAF7F0]/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jfif"
              multiple
              onChange={(e) => {
                if (e.target.files) handleFileUpload(e.target.files);
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-[#F5EFEB] text-[#702638]">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#26221F]">
                  {isUploading ? 'Uploading to Supabase CDN...' : 'Click to Upload Saree Photos or Drag & Drop'}
                </p>
                <p className="text-xs text-[#645E59] mt-1">
                  JPG, PNG, WebP or JFIF (Max 10MB per image)
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Images Grid */}
          {images.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#26221F] block">
                Selected Photos (First photo is Primary Cover)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((url, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={`${url}-${idx}`}
                      className={`group relative aspect-[3/4] bg-[#F5EFEB] rounded-xs overflow-hidden border ${
                        isPrimary ? 'border-[#702638] ring-2 ring-[#702638]/20' : 'border-[#E6DCD1]'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Saree View ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={url.startsWith('/')}
                      />

                      {/* Primary Badge */}
                      {isPrimary && (
                        <span className="absolute top-2 left-2 bg-[#702638] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-current" />
                          Cover
                        </span>
                      )}

                      {/* Hover Overlay Controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            title="Remove photo"
                            className="p-1.5 bg-white/90 text-red-700 hover:bg-white rounded-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(idx);
                            }}
                            className="w-full bg-[#FAF7F0] text-[#702638] text-[11px] font-semibold py-1 rounded-xs hover:bg-white transition-colors"
                          >
                            Set as Cover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Presets & Custom URL Accordion */}
          <div className="pt-4 border-t border-[#E6DCD1] space-y-4 text-xs">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#645E59] block mb-2">
                Quick-Add Boutique Photography Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_ASSETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => handleAddPreset(preset.url)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F0] border border-[#E6DCD1] hover:border-[#702638] text-[#26221F] rounded-xs transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#702638]" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#645E59] block mb-1">
                Or Add Image via External URL:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/saree-photo.jpg"
                  className="flex-1 bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2 px-3 text-xs focus:outline-none focus:border-[#702638]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-4 py-2 bg-[#26221F] hover:bg-[#3D3733] text-white rounded-xs font-semibold text-xs transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Toggles */}
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

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-[#E6DCD1] rounded-xs text-xs font-semibold uppercase tracking-wider text-[#645E59] hover:bg-[#F5EFEB] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-8 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
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
