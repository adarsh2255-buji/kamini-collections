import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { getAdminDashboardMetrics } from '@/services/orders';
import { formatPrice } from '@/lib/pricing';
import { verifyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    redirect('/admin/login');
  }

  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DCD1] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Store Administration
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#26221F] mt-1">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white px-4 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Add New Saree</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Confirmed Net Revenue */}
        <div className="bg-white p-5 border border-[#E6DCD1] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#645E59]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Confirmed Net Revenue
            </span>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#702638]">
            {formatPrice(metrics.confirmedRevenuePaise)}
          </div>
          <p className="text-[11px] text-[#645E59]">
            From captured online payments
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 border border-[#E6DCD1] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#645E59]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Awaiting Processing
            </span>
            <div className="p-2 rounded-full bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#26221F]">
            {metrics.pendingOrders}
          </div>
          <p className="text-[11px] text-[#645E59]">
            Orders ready for dispatch
          </p>
        </div>

        {/* Pending COD Collections */}
        <div className="bg-white p-5 border border-[#E6DCD1] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#645E59]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending COD Dues
            </span>
            <div className="p-2 rounded-full bg-purple-50 text-purple-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#26221F]">
            {formatPrice(metrics.pendingCodPaise)}
          </div>
          <p className="text-[11px] text-[#645E59]">
            To be collected at doorstep
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 border border-[#E6DCD1] rounded-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#645E59]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="p-2 rounded-full bg-red-50 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-red-600">
            {metrics.lowStockCount}
          </div>
          <p className="text-[11px] text-[#645E59]">
            Sarees with &le; 3 inventory remaining
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-[#E6DCD1] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6DCD1] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#26221F]">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[#645E59] mt-0.5">
              Total {metrics.totalOrders} lifetime orders placed
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#702638] hover:text-[#591D2B] flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFEB] text-[#645E59] uppercase tracking-wider border-b border-[#E6DCD1]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Reference</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Fulfilment</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCD1]">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#702638]">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-[#645E59]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#26221F]">
                      {order.customer_name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#26221F]">
                      {formatPrice(order.total_paise)}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] tracking-wider text-[#645E59]">
                      {order.payment_method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.payment_status === 'captured'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800 capitalize">
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#702638] font-semibold hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#645E59]">
            No customer orders placed yet. Orders will appear here as soon as customers checkout.
          </div>
        )}
      </div>
    </div>
  );
}
