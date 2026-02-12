"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiUrl, ORDER_STATUSES } from "@/lib/api";

interface OrderListItem {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  payment?: { status: string | null };
  user?: { name?: string | null; email?: string | null; phone?: string | null };
  items?: { id: string; quantity: number }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl("/api/admin/orders"), {
          cache: "no-store",
        });
        const json = await res.json();
        setOrders(json || []);
      } catch (err) {
        console.error(err);
      } finally {
        console.log(orders)
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600">
            Manage customer orders and update their statuses.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Items",
                  "Total",
                  "Payment",
                  "Status",
                  "Created",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    <Link href={`/orders/${order.id}`}>{order.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">
                      {order.user?.name || "Guest"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {order.user?.email || order.user?.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.items?.reduce((sum, it) => sum + it.quantity, 0) ??
                      0}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    ৳{order.total}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.payment?.status ?? "pending"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
