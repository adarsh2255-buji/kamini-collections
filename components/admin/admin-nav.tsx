'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return null;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#26221F] text-[#FAF7F0] flex flex-col justify-between shrink-0 border-r border-[#B99A5B]/30">
      <div>
        {/* Brand Logo in Admin */}
        <div className="p-6 border-b border-[#FAF7F0]/10">
          <Link href="/admin" className="block">
            <span className="font-serif text-xl tracking-wider text-[#FAF7F0] font-semibold">
              KAMINI
            </span>
            <span className="block text-[10px] tracking-[0.25em] text-[#B99A5B] font-medium uppercase">
              Admin Studio
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xs transition-colors ${
                  isActive
                    ? 'bg-[#702638] text-white font-semibold'
                    : 'text-[#FAF7F0]/75 hover:bg-[#FAF7F0]/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B99A5B]' : 'text-[#FAF7F0]/60'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#FAF7F0]/10 space-y-2 text-xs">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2 text-[#DFC89B] hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Public Storefront</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 text-[#FAF7F0]/60 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminNav({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF7F0] text-[#26221F]">
      <Suspense fallback={<aside className="w-full md:w-64 bg-[#26221F]" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
