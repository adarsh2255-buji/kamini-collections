import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getAdminOrderById } from '@/services/orders';
import { OrderDetailManager } from '@/components/admin/order-detail-manager';
import { verifyAdminSession } from '@/lib/auth';

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailManager initialOrder={order} />;
}
