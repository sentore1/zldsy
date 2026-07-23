"use client";

import { useState } from "react";
import { Search, CheckCircle, Clock, Calendar, MapPin } from "lucide-react";

export default function TrackServicePage() {
  const [bookingId, setBookingId] = useState("");
  const [tracking, setTracking] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock tracking data
    setTracking({
      bookingNumber: "BOOK-12345",
      service: "Cleaning Service",
      status: "in_progress",
      customer: "John Doe",
      scheduledDate: "2024-01-15",
      address: "123 Main St, City",
      quotation: {
        number: "QUO-12345",
        amount: 150,
        status: "accepted",
      },
      timeline: [
        {
          status: "Booking Received",
          date: "2024-01-10",
          completed: true,
        },
        {
          status: "Quotation Sent",
          date: "2024-01-10",
          completed: true,
        },
        {
          status: "Terms Accepted",
          date: "2024-01-11",
          completed: true,
        },
        {
          status: "Service Scheduled",
          date: "2024-01-12",
          completed: true,
        },
        {
          status: "Service In Progress",
          date: "2024-01-15",
          completed: true,
          current: true,
        },
        {
          status: "Service Completed",
          date: "Pending",
          completed: false,
        },
        {
          status: "Invoice Sent",
          date: "Pending",
          completed: false,
        },
        {
          status: "Payment Received",
          date: "Pending",
          completed: false,
        },
      ],
      assignedStaff: [
        { name: "Mike Johnson", role: "Lead Technician" },
        { name: "Sarah Williams", role: "Assistant" },
      ],
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Track Your Service
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter your booking number or phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Track
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enter your booking number (e.g., BOOK-12345) or the phone number
            you used for booking
          </p>
        </form>

        {/* Tracking Results */}
        {tracking && (
          <div className="space-y-8">
            {/* Service Info Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-indigo-100 text-sm mb-1">Booking Number</p>
                  <h2 className="text-2xl font-bold">
                    {tracking.bookingNumber}
                  </h2>
                </div>
                <StatusBadge status={tracking.status} />
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-indigo-100 text-sm">Service</p>
                  <p className="font-semibold">{tracking.service}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-sm">Scheduled Date</p>
                  <p className="font-semibold">{tracking.scheduledDate}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-sm">Customer</p>
                  <p className="font-semibold">{tracking.customer}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Service Progress
              </h3>
              <div className="relative">
                {tracking.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-8 relative">
                    {/* Timeline Line */}
                    {index < tracking.timeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200">
                        {item.completed && (
                          <div className="w-full bg-indigo-600 h-full" />
                        )}
                      </div>
                    )}

                    {/* Timeline Icon */}
                    <div className="relative z-10">
                      {item.completed ? (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            item.current
                              ? "bg-indigo-600 ring-4 ring-indigo-100"
                              : "bg-indigo-600"
                          }`}
                        >
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div className="flex-1 pt-2">
                      <h4
                        className={`font-semibold ${
                          item.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {item.status}
                      </h4>
                      <p className="text-sm text-gray-600">{item.date}</p>
                      {item.current && (
                        <p className="text-sm text-indigo-600 font-medium mt-1">
                          Current Status
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quotation Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Quotation Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quotation Number</span>
                    <span className="font-semibold">
                      {tracking.quotation.number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-green-600">
                      RWF {tracking.quotation.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {tracking.quotation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Staff */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Assigned Team
                </h4>
                <div className="space-y-3">
                  {tracking.assignedStaff.map((staff: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                        {staff.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {staff.name}
                        </p>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Location */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Service Location
              </h4>
              <p className="text-gray-700">{tracking.address}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                Contact Support
              </button>
              <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Download Quotation
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!tracking && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Track Your Service
            </h3>
            <p className="text-gray-500">
              Enter your booking number above to track your service status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-500" },
    scheduled: { label: "Scheduled", color: "bg-blue-500" },
    in_progress: { label: "In Progress", color: "bg-purple-500" },
    completed: { label: "Completed", color: "bg-green-500" },
    cancelled: { label: "Cancelled", color: "bg-red-500" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${config.color}`}
    >
      {config.label}
    </span>
  );
}
