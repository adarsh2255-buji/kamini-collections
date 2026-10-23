'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Compass, User } from 'lucide-react';
import { useCart } from '@/context/cart-context';

export function Header() {
  const router = useRouter();
  const { itemCount, isHydrated } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'All Sarees', href: '/shop' },
    { label: 'Banarasi Silk', href: '/categories/banarasi-silk' },
    { label: 'Kanchipuram', href: '/categories/kanchipuram-silk' },
    { label: 'Organza & Chanderi', href: '/categories/chanderi-organza' },
    { label: 'Cotton & Linen', href: '/categories/cotton-linen' },
    { label: 'Our Story', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E6DCD1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#26221F] hover:text-[#702638] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <Link href="/" className="group flex flex-col items-center lg:items-start">
              <span className="font-serif text-2xl sm:text-3xl tracking-wider text-[#702638] font-semibold group-hover:text-[#591D2B] transition-colors">
                KAMINI
              </span>
              <span className="text-[10px] sm:text-xs tracking-[0.28em] text-[#B99A5B] font-medium -mt-1 uppercase">
                Collections
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide text-[#26221F] hover:text-[#702638] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#B99A5B] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#26221F] hover:text-[#702638] transition-colors"
              aria-label="Search sarees"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order */}
            <Link
              href="/track-order"
              className="hidden sm:flex items-center p-2 text-[#26221F] hover:text-[#702638] transition-colors"
              title="Track Order"
            >
              <Compass className="w-5 h-5" />
            </Link>

            {/* Admin Portal Entry */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center p-2 text-[#26221F] hover:text-[#702638] transition-colors"
              title="Store Administration"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-[#26221F] hover:text-[#702638] transition-colors flex items-center"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {isHydrated && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#702638] text-white text-[11px] font-semibold rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="py-4 border-t border-[#E6DCD1] animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search by weave, fabric, color, or saree name (e.g., Banarasi, Katan, Organza)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white border border-[#B99A5B] rounded-full py-2.5 pl-5 pr-12 text-sm text-[#26221F] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#702638]/20"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#702638] hover:text-[#591D2B] p-1"
                aria-label="Submit Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F0] border-b border-[#E6DCD1] px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sarees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E6DCD1] rounded-md py-2 pl-4 pr-10 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#702638]">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-[#26221F] hover:text-[#702638] py-1 border-b border-[#E6DCD1]/50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-[#702638] py-1"
            >
              Track Your Order
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs uppercase tracking-wider text-[#B99A5B] pt-2"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
