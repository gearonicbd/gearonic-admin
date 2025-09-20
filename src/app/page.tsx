import Link from "next/link";
import { getProducts } from "@/lib/dummy";

export default function AdminDashboard() {
  const products = getProducts();
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, product) => sum + product.totalStock,
    0
  );
  const totalSold = products.reduce((sum, product) => sum + product.sold, 0);
  const flashSaleProducts = products.filter((p) => p.isFlashSale).length;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total Products
            </h3>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Sold</h3>
            <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Flash Sale Items
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {flashSaleProducts}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Product
            </Link>
            <Link
              href="/products"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
