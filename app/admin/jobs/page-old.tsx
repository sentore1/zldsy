"use client";

import { useState } from "react";
import { Plus, Search, Calendar, Users, MapPin, Sun, Cloud, CloudRain } from "lucide-react";

export default function JobsPage() {
  const [jobs] = useState([
    {
      id: "1",
      jobNumber: "JOB-001",
      customer: "John Doe",
      service: "Cleaning Service",
      scheduledDate: "2024-01-15",
      startTime: "09:00 AM",
      status: "in_progress",
      weather: "dry",
      address: "123 Main St, City",
      assignedStaff: ["Mike Johnson", "Sarah Williams"],
      estimatedDuration: "4 hours",
    },
    {
      id: "2",
      jobNumber: "JOB-002",
      customer: "Jane Smith",
      service: "Fumigation",
      scheduledDate: "2024-01-15",
      startTime: "11:00 AM",
      status: "scheduled",
      weather: "wet",
      address: "456 Oak Ave, Town",
      assignedStaff: ["Tom Brown"],
      estimatedDuration: "3 hours",
    },
    {
      id: "3",
      jobNumber: "JOB-003",
      customer: "Bob Johnson",
      service: "Maintenance",
      scheduledDate: "2024-01-16",
      startTime: "08:00 AM",
      status: "pending",
      weather: "rain",
      address: "789 Pine Rd, Village",
      assignedStaff: [],
      estimatedDuration: "2 hours",
    },
    {
      id: "4",
      jobNumber: "JOB-004",
      customer: "Alice Cooper",
      service: "Landscaping",
      scheduledDate: "2024-01-14",
      startTime: "10:00 AM",
      status: "completed",
      weather: "dry",
      address: "321 Elm St, County",
      assignedStaff: ["Mike Johnson", "John Davis"],
      estimatedDuration: "5 hours",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    return jobs.filter((job) => job.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Jobs
          </h3>
          <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {getStatusCount("pending")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Scheduled
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {getStatusCount("scheduled")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            In Progress
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {getStatusCount("in_progress")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Completed
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {getStatusCount("completed")}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job number, customer, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("scheduled")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "scheduled"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "in_progress"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Job Number</p>
                  <h3 className="text-xl font-bold text-white">
                    {job.jobNumber}
                  </h3>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Customer & Service */}
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{job.customer}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold text-gray-900">{job.service}</p>
              </div>

              {/* Schedule Info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{job.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">{job.startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <WeatherIcon condition={job.weather} />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <span className="text-gray-700">{job.address}</span>
              </div>

              {/* Assigned Staff */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Assigned Staff</span>
                </div>
                {job.assignedStaff.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.assignedStaff.map((staff, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold"
                      >
                        {staff}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-600">No staff assigned</p>
                )}
              </div>

              {/* Duration */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Estimated Duration
                  </span>
                  <span className="font-semibold text-gray-900">
                    {job.estimatedDuration}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No jobs found</p>
        </div>
      )}
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
      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function WeatherIcon({ condition }: { condition: string }) {
  const icons: Record<string, { icon: React.ReactNode; label: string }> = {
    dry: { icon: <Sun className="w-5 h-5 text-yellow-500" />, label: "Dry" },
    wet: { icon: <Cloud className="w-5 h-5 text-gray-500" />, label: "Wet" },
    rain: {
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
      label: "Rain",
    },
  };

  const { icon, label } = icons[condition] || icons.dry;

  return (
    <div className="flex items-center gap-1" title={label}>
      {icon}
    </div>
  );
}
