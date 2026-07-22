import Link from "next/link";
import { Calendar, Search, Star, TrendingUp } from "lucide-react";

export default function CustomerPage() {
  const services = [
    {
      id: "1",
      name: "Cleaning Service",
      description: "Professional cleaning for homes and offices",
      price: "From $50",
      image: "🧹",
    },
    {
      id: "2",
      name: "Fumigation",
      description: "Complete pest control and fumigation services",
      price: "From $80",
      image: "🐛",
    },
    {
      id: "3",
      name: "Security Services",
      description: "Professional security guard services",
      price: "From $100/day",
      image: "🛡️",
    },
    {
      id: "4",
      name: "Maintenance",
      description: "General maintenance and repairs",
      price: "From $60",
      image: "🔧",
    },
    {
      id: "5",
      name: "Landscaping",
      description: "Garden and landscape maintenance",
      price: "From $70",
      image: "🌿",
    },
    {
      id: "6",
      name: "Construction Support",
      description: "Construction site support services",
      price: "From $150",
      image: "🏗️",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-12 text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our Services</h1>
        <p className="text-xl mb-8 opacity-90">
          Book professional services with ease. Track your service progress in
          real-time.
        </p>
        <Link
          href="/customer/booking"
          className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
        >
          Book a Service Now
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/customer/booking"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition group"
        >
          <div className="bg-blue-500 text-white rounded-lg p-4 inline-block mb-4 group-hover:scale-110 transition">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Book a Service
          </h3>
          <p className="text-gray-600">
            Schedule a service at your preferred date and time
          </p>
        </Link>

        <Link
          href="/customer/track"
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition group"
        >
          <div className="bg-green-500 text-white rounded-lg p-4 inline-block mb-4 group-hover:scale-110 transition">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Track Service
          </h3>
          <p className="text-gray-600">
            Monitor the progress of your booked services
          </p>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="bg-purple-500 text-white rounded-lg p-4 inline-block mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-gray-600 font-semibold">4.9 / 5.0</span>
          </div>
          <p className="text-gray-600 mt-2">Based on 500+ reviews</p>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Our Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-center">
                <div className="text-6xl mb-4">{service.image}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">
                    {service.price}
                  </span>
                  <Link
                    href={`/customer/booking?service=${service.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Why Choose Us?
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Professional Team</h4>
            <p className="text-gray-600 text-sm">
              Highly trained and experienced staff
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Quality Service</h4>
            <p className="text-gray-600 text-sm">
              We guarantee satisfaction on every job
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Flexible Scheduling</h4>
            <p className="text-gray-600 text-sm">
              Book at your convenience, 7 days a week
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 text-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Real-time Tracking</h4>
            <p className="text-gray-600 text-sm">
              Monitor your service progress live
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
