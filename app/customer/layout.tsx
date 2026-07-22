import Link from "next/link";
import { Home, Calendar, FileText, Receipt, Star } from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Service Portal
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/customer"
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link
                href="/customer/booking"
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <Calendar size={20} />
                <span>Book Service</span>
              </Link>
              <Link
                href="/customer/track"
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <FileText size={20} />
                <span>Track Service</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Service Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
