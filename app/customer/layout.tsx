import Link from "next/link";
import { Home, Calendar, FileText } from "lucide-react";
import Image from "next/image";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-white p-1 rounded">
                <Image
                  src="/logo.png"
                  alt="Service Portal"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Service Portal
              </span>
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/customer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link
                href="/customer/booking"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                <Calendar size={18} />
                <span>Book Service</span>
              </Link>
              <Link
                href="/customer/track"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                <FileText size={18} />
                <span>Track Service</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Service Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
