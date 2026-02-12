import type { Metadata } from "next";
import "../styles/globals.css";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

export const metadata: Metadata = {
  title: "Gearonic Admin",
  description: "Gearonic admin panel",
};

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSansBengali.className}>
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Gearonic
                    </h1>
                  </div>
                  <div className="hidden md:flex md:space-x-1">
                    {[
                      { href: "/", label: "Dashboard" },
                      { href: "/orders", label: "Orders" },
                      { href: "/products", label: "Products" },
                      { href: "/questions", label: "Questions" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <Link
                    href="/products/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 shadow-sm"
                  >
                    + Add Product
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
