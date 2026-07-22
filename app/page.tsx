import Link from "next/link";
import {
  Calendar,
  FileText,
  Users,
  DollarSign,
  BarChart,
  Settings,
  CheckSquare,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-600">
              Service Management System
            </h1>
            <div className="flex gap-4">
              <Link
                href="/customer"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Customer Portal
              </Link>
              <Link
                href="/admin"
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Manage Your Service Business End-to-End
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            One platform to manage customers, bookings, quotations, field
            operations, invoices, payments, staff, inventory, and business
            performance from start to finish.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Calendar className="w-12 h-12" />}
            title="Customer & Booking"
            description="Easy service booking with photo uploads and customer management"
            color="bg-blue-500"
          />
          <FeatureCard
            icon={<FileText className="w-12 h-12" />}
            title="Smart Quotation"
            description="Automatic pricing with QR codes and digital acceptance"
            color="bg-green-500"
          />
          <FeatureCard
            icon={<CheckSquare className="w-12 h-12" />}
            title="Service Management"
            description="Track jobs from pending to completion with team assignment"
            color="bg-purple-500"
          />
          <FeatureCard
            icon={<DollarSign className="w-12 h-12" />}
            title="Invoice & Payment"
            description="Automated invoicing with payment tracking"
            color="bg-yellow-500"
          />
          <FeatureCard
            icon={<Star className="w-12 h-12" />}
            title="Customer Feedback"
            description="Collect ratings and redirect to Google Reviews"
            color="bg-pink-500"
          />
          <FeatureCard
            icon={<Users className="w-12 h-12" />}
            title="Staff Management"
            description="Track attendance, assignments, and labor costs"
            color="bg-indigo-500"
          />
          <FeatureCard
            icon={<BarChart className="w-12 h-12" />}
            title="Business Dashboard"
            description="Real-time insights on revenue, profit, and operations"
            color="bg-red-500"
          />
          <FeatureCard
            icon={<Settings className="w-12 h-12" />}
            title="Full Control"
            description="Manage inventory, equipment, and all business settings"
            color="bg-gray-700"
          />
        </div>

        {/* Customer Workflow */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Customer Workflow
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Browse Services",
              "Book Service",
              "Upload Photos",
              "Receive Quotation",
              "Accept Terms",
              "Track Progress",
              "Receive Invoice",
              "Make Payment",
              "Leave Feedback",
              "Google Review",
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-center bg-indigo-50 px-6 py-3 rounded-full"
              >
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-800">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-indigo-600 rounded-2xl shadow-xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Perfect for cleaning, fumigation, security, maintenance,
            landscaping, and construction support businesses.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/customer/booking"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Book a Service
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-8 py-4 bg-indigo-800 text-white rounded-lg font-semibold hover:bg-indigo-900 transition text-lg"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Service Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
      <div className={`${color} text-white rounded-lg p-4 inline-block mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
