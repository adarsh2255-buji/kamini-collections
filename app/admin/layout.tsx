import React from 'react';
import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/admin-nav';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Kamini Collections',
  description: 'Administration and product management for Kamini Collections',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminNav>{children}</AdminNav>;
}
