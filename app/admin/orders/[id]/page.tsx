import React from 'react';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/services/orders';
import { OrderDetailManager } from '@/components/admin/order-detail-manager';

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailManager initialOrder={order} />;
}
