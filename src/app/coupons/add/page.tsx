"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

export default function AddCouponPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    scopeType: "all",
    categoryName: "",
    productIdsStr: "",
    minOrderAmount: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const productIds = form.productIdsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(apiUrl("/api/admin/coupons"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          scopeType: form.scopeType,
          categoryName:
            form.scopeType === "category" ? form.categoryName.trim() || null : null,
          productIds: form.scopeType === "product" ? productIds : [],
          minOrderAmount:
            form.minOrderAmount === ""
              ? null
              : Number(form.minOrderAmount) || null,
          maxUses: form.maxUses === "" ? null : Number(form.maxUses) || null,
          validFrom: form.validFrom ? form.validFrom : null,
          validUntil: form.validUntil ? form.validUntil : null,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create coupon");
        return;
      }
      router.push("/coupons");
    } catch (err) {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/coupons"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Coupons
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900">Add Coupon</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Code *
          </label>
          <input
            type="text"
            name="code"
            required
            value={form.code}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g. SAVE10"
          />
          <p className="mt-1 text-xs text-gray-500">
            Stored in uppercase. Must be unique.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount type *
            </label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Fixed amount (৳)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Value * {form.discountType === "percentage" ? "(1-100)" : "(৳)"}
            </label>
            <input
              type="number"
              name="discountValue"
              required
              min={form.discountType === "percentage" ? 1 : 0}
              max={form.discountType === "percentage" ? 100 : undefined}
              value={form.discountValue}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Applies to *
          </label>
          <select
            name="scopeType"
            value={form.scopeType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
          >
            <option value="all">All products</option>
            <option value="category">Specific category</option>
            <option value="product">Specific product(s)</option>
          </select>
        </div>

        {form.scopeType === "category" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category name *
            </label>
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
              placeholder="Must match product category exactly"
            />
          </div>
        )}

        {form.scopeType === "product" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product IDs (comma-separated) *
            </label>
            <input
              type="text"
              name="productIdsStr"
              value={form.productIdsStr}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm font-mono"
              placeholder="id1, id2, id3"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Min order amount (৳)
            </label>
            <input
              type="number"
              name="minOrderAmount"
              min={0}
              value={form.minOrderAmount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max uses
            </label>
            <input
              type="number"
              name="maxUses"
              min={0}
              value={form.maxUses}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
              placeholder="Unlimited if empty"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valid from
            </label>
            <input
              type="datetime-local"
              name="validFrom"
              value={form.validFrom}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valid until
            </label>
            <input
              type="datetime-local"
              name="validUntil"
              value={form.validUntil}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Active (coupon can be used)
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Coupon"}
          </button>
          <Link
            href="/coupons"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
