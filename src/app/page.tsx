"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

interface DashboardData {
  productCount: number;
  flashSaleCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  userCount: number;
  unansweredQuestions: number;
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    payment?: { status: string | null };
  }[];
}

const StatCard = ({
  label,
  value,
  subtitle,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-amber-600 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 ${color} rounded-lg`}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
    </div>
  </div>
);

const QuickAction = ({
  href,
  icon,
  title,
  subtitle,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}) => (
  <Link
    href={href}
    className={`flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-${color}-500 hover:bg-${color}-50 transition-all group`}
  >
    <div
      className={`p-2 bg-${color}-100 rounded-lg group-hover:bg-${color}-200 transition-colors`}
    >
      <svg
        className={`w-6 h-6 text-${color}-600`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
    </div>
    <div className="ml-4">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </Link>
);

const StatusBadge = ({
  status,
  type,
}: {
  status: string;
  type: "order" | "payment";
}) => {
  const colors: Record<string, string> =
    type === "order"
      ? {
          pending: "bg-yellow-100 text-yellow-800",
          processing: "bg-blue-100 text-blue-800",
          shipped: "bg-purple-100 text-purple-800",
          delivered: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        }
      : {
          paid: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          failed: "bg-red-100 text-red-800",
        };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
        colors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl("/api/admin/dashboard"), {
          cache: "no-store",
        });
        setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data
    ? [
        {
          label: "Total Products",
          value: data.productCount,
          icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
          color: "bg-blue-100 text-blue-600",
        },
        {
          label: "Flash Sales",
          value: data.flashSaleCount,
          icon: "M13 10V3L4 14h7v7l9-11h-7z",
          color: "bg-orange-100 text-orange-600",
        },
        {
          label: "Total Orders",
          value: data.totalOrders,
          subtitle: `${data.pendingOrders} pending`,
          icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
          color: "bg-green-100 text-green-600",
        },
        {
          label: "Total Revenue",
          value: `৳${data.totalRevenue.toLocaleString()}`,
          icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "bg-purple-100 text-purple-600",
        },
        {
          label: "Total Users",
          value: data.userCount,
          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
          color: "bg-indigo-100 text-indigo-600",
        },
        {
          label: "Unanswered Questions",
          value: data.unansweredQuestions,
          icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "bg-red-100 text-red-600",
        },
      ]
    : [];

  const actions = [
    {
      href: "/products/add",
      icon: "M12 4v16m8-8H4",
      title: "Add New Product",
      subtitle: "Create a new product listing",
      color: "blue",
    },
    {
      href: "/orders",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      title: "Manage Orders",
      subtitle: "View and update orders",
      color: "indigo",
    },
    {
      href: "/questions",
      icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
      title: "Answer Questions",
      subtitle: "Respond to customer queries",
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <Link
              href="/products/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>

              <div className="bg-white mb-8 rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {actions.map((action) => (
                    <QuickAction key={action.href} {...action} />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Orders
                  </h2>
                  <Link
                    href="/orders"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Order ID", "Status", "Payment", "Total", "Date"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              #{order.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={order.status} type="order" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge
                              status={order.payment?.status ?? "pending"}
                              type="payment"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ৳{order.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
