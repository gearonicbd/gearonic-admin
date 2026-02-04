"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiUrl, ORDER_STATUSES } from "@/lib/api";

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment?: {
    status: string | null;
    method?: string | null;
    transactionId?: string | null;
  };
  items: {
    id: string;
    productTitle: string;
    productBrand: string;
    productImage: string;
    quantity: number;
    price: number;
    variantColor?: string | null;
  }[];
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/api/admin/orders/${params.id}`), {
          cache: "no-store",
        });
        const json = await res.json();
        setOrder(json);
        setStatus(json.status);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [params.id]);

  const updateStatus = async () => {
    try {
      setSaving(true);
      await fetch(apiUrl(`/api/admin/orders/${params.id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-sm text-gray-500">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Order {order.id}
          </h1>
          <p className="text-sm text-gray-600">
            Created: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={updateStatus}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Status"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex gap-3">
                <img
                  src={item.productImage}
                  alt={item.productTitle}
                  className="w-16 h-16 rounded object-cover border"
                />
                <div className="flex-1">
                  <div className="font-semibold">{item.productTitle}</div>
                  <div className="text-sm text-gray-600">
                    {item.productBrand}
                  </div>
                  {item.variantColor && (
                    <div className="text-xs text-gray-500">
                      Variant: {item.variantColor}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm">
                  <div>Qty: {item.quantity}</div>
                  <div className="font-semibold">৳{item.price}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 text-right text-lg font-bold">
            Total: ৳{order.total}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold mb-2">Shipping</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(order.shipping, null, 2)}
            </pre>
          </div>
          <div className="bg-white border rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold mb-2">Payment</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Status: {order.payment?.status ?? "pending"}</div>
              <div>Method: {order.payment?.method ?? "N/A"}</div>
              {order.payment?.transactionId && (
                <div>Txn: {order.payment.transactionId}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
