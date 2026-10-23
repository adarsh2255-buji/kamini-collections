import React from 'react';
import Link from 'next/link';
import { getAdminOrders } from '@/services/orders';
import { formatPrice } from '@/lib/pricing';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const orderStatus = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  const { orders, total } = await getAdminOrders({
    search,
    order_status: orderStatus,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DCD1] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-semibold">
            Fulfilment &amp; Logistics
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#26221F] mt-1">
            Customer Orders
          </h1>
          <p className="text-xs text-[#645E59] mt-1">
            Total {total} orders recorded
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E6DCD1] rounded-xs shadow-xs overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EFEB] text-[#645E59] uppercase tracking-wider border-b border-[#E6DCD1]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Reference</th>
                  <th className="py-3 px-4 font-semibold">Placed Date</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Mobile Phone</th>
                  <th className="py-3 px-4 font-semibold">Order Total</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Fulfilment</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCD1]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#702638]">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-[#645E59]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#26221F]">
                      {order.customer_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#645E59]">
                      +91 {order.phone.slice(-10)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#702638]">
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
          <div className="p-12 text-center text-xs text-[#645E59]">
            No orders found in the database. When customers checkout on the storefront, their orders will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
