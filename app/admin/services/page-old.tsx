"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState([
    {
      id: "1",
      name: "Cleaning Service",
      description: "Professional cleaning for homes and offices",
      category: "Cleaning",
      basePrice: 50,
      unit: "per sqm",
      isActive: true,
      totalBookings: 45,
    },
    {
      id: "2",
      name: "Fumigation",
      description: "Complete pest control and fumigation services",
      category: "Pest Control",
      basePrice: 80,
      unit: "per property",
      isActive: true,
      totalBookings: 32,
    },
    {
      id: "3",
      name: "Security Services",
      description: "Professional security guard services",
      category: "Security",
      basePrice: 100,
      unit: "per day",
      isActive: true,
      totalBookings: 28,
    },
    {
      id: "4",
      name: "Maintenance",
      description: "General maintenance and repairs",
      category: "Maintenance",
      basePrice: 60,
      unit: "per hour",
      isActive: true,
      totalBookings: 56,
    },
    {
      id: "5",
      name: "Landscaping",
      description: "Garden and landscape maintenance",
      category: "Landscaping",
      basePrice: 70,
      unit: "per sqm",
      isActive: true,
      totalBookings: 38,
    },
    {
      id: "6",
      name: "Construction Support",
      description: "Construction site support services",
      category: "Construction",
      basePrice: 150,
      unit: "per day",
      isActive: false,
      totalBookings: 12,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleServiceStatus = (id: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, isActive: !service.isActive } : service
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Services
          </h3>
          <p className="text-3xl font-bold text-gray-900">{services.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Active Services
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {services.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Bookings
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {services.reduce((sum, s) => sum + s.totalBookings, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Average Price
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            RWF {Math.round(services.reduce((sum, s) => sum + s.basePrice, 0) / services.length)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
              <div className="flex items-start justify-between">
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm font-semibold">
                  {service.category}
                </div>
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className="text-white hover:scale-110 transition"
                >
                  {service.isActive ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {service.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {service.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Base Price</span>
                  <span className="font-bold text-indigo-600 text-lg flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {service.basePrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Unit</span>
                  <span className="font-semibold text-gray-900">
                    {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Total Bookings</span>
                  <span className="font-semibold text-gray-900">
                    {service.totalBookings}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No services found</p>
        </div>
      )}
    </div>
  );
}
