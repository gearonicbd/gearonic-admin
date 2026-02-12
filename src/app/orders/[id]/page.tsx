"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiUrl, ORDER_STATUSES } from "@/lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  shipping: {
    name: string;
    zone: string;
    mobile: string;
    address: string;
    comment?: string | null;
  };

  payment: {
    status: string | null;
    method: string | null;
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
  const [generating, setGenerating] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setGenerating(true);

    try {
      // Calculate delivery charge based on zone
      const deliveryCharge =
        order.shipping.zone.toLowerCase() === "outside" ? 120 : 60;
      const subtotal = order.total - deliveryCharge;

      // Create hidden div with invoice HTML
      const invoiceDiv = document.createElement("div");
      invoiceDiv.style.position = "absolute";
      invoiceDiv.style.left = "-9999px";
      invoiceDiv.style.width = "210mm"; // A4 width
      invoiceDiv.style.padding = "20mm";
      invoiceDiv.style.backgroundColor = "white";
      invoiceDiv.style.fontFamily = "'Noto Sans Bengali', 'Arial', sans-serif";

      invoiceDiv.innerHTML = `
      <div style="max-width: 170mm; margin: 0 auto; color: #000;">
        <!-- Header -->
        <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">
            Gadget City BD
          </h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">INVOICE</p>
        </div>

        <!-- Order Info Row -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px;">
          <div>
            <div style="margin-bottom: 5px;">
              <strong>Order Number:</strong> #${order.id}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        <!-- Shipping Information -->
        <div style="margin-bottom: 30px; padding: 15px; border: 1px solid #000;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">
            Shipping Information
          </h3>
          
          <div style="font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 6px;">
              <strong>Customer Name:</strong> ${order.shipping.name}
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Mobile:</strong> ${order.shipping.mobile}
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Zone:</strong> ${order.shipping.zone}
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Address:</strong> ${order.shipping.address}
            </div>
            ${
              order.shipping.comment
                ? `
              <div style="margin-bottom: 6px;">
                <strong>Comment:</strong> ${order.shipping.comment}
              </div>
            `
                : ""
            }
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #000;">
              <strong>Paid By:</strong> ${order.payment?.method ?? "N/A"}
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">
            Order Items
          </h3>
          
          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                <th style="padding: 10px; text-align: left; font-weight: bold;">Product</th>
                <th style="padding: 10px; text-align: center; font-weight: bold; width: 80px;">Qty</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; width: 100px;">Price</th>
                <th style="padding: 10px; text-align: right; font-weight: bold; width: 100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #ccc;">
                  <td style="padding: 12px 10px;">
                    <div style="font-weight: 500; margin-bottom: 3px;">
                      ${item.productTitle}
                    </div>
                    <div style="font-size: 11px; color: #666;">
                      ${item.productBrand}${item.variantColor ? ` • ${item.variantColor}` : ""}
                    </div>
                  </td>
                  <td style="padding: 12px 10px; text-align: center;">
                    ${item.quantity}
                  </td>
                  <td style="padding: 12px 10px; text-align: right;">
                    ৳${item.price.toFixed(2)}
                  </td>
                  <td style="padding: 12px 10px; text-align: right; font-weight: 500;">
                    ৳${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <!-- Subtotal and Delivery Charge -->
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px; font-size: 14px;">
            <div style="width: 200px; display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span>৳${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px; font-size: 14px;">
            <div style="width: 200px; display: flex; justify-content: space-between;">
              <span>Delivery Charge (${order.shipping.zone}):</span>
              <span>৳${deliveryCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div style="margin-top: 10px; padding-top: 15px; border-top: 2px solid #000;">
          <div style="text-align: right; font-size: 16px;">
            <strong>TOTAL: ৳${order.total.toFixed(2)}</strong>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #000; text-align: center; font-size: 11px; color: #666;">
          <p style="margin: 0;">Thank you for your ordering!</p>
        </div>
      </div>
    `;

      document.body.appendChild(invoiceDiv);

      // Wait for fonts to load
      await document.fonts.ready;

      // Convert HTML to Canvas
      const canvas = await html2canvas(invoiceDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Convert Canvas to PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice_${order.id}.pdf`);

      // Cleanup
      document.body.removeChild(invoiceDiv);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

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
      } finally {
        console.log(order);
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
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={generating}
            className="border border-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {generating ? "Generating..." : "Download Invoice (PDF)"}
          </button>
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
            <div className="bg-white border rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4">
                Shipping Information
              </h3>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-medium text-gray-900">
                    Customer Name:
                  </span>
                  <div>{order.shipping.name}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-900">Mobile:</span>
                  <div>{order.shipping.mobile}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-900">Zone:</span>
                  <div className="capitalize">{order.shipping.zone}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-900">Address:</span>
                  <div>{order.shipping.address}</div>
                </div>

                {order.shipping.comment && (
                  <div>
                    <span className="font-medium text-gray-900">Comment:</span>
                    <div className="italic text-gray-600">
                      {order.shipping.comment}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
