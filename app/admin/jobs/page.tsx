"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Calendar, Users, MapPin, Sun, Cloud, CloudRain, X } from "lucide-react";

interface Job {
  id: string;
  job_number: string;
  scheduled_date: string;
  start_time: string | null;
  status: string;
  weather_condition: string | null;
  booking: {
    id: string;
    customer: {
      name: string;
      phone: string;
    };
    service: {
      name: string;
    };
  };
}

interface Booking {
  id: string;
  customer: { name: string };
  service: { name: string };
  preferred_date: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    booking_id: "",
    scheduled_date: "",
    start_time: "09:00",
    weather_condition: "dry",
    notes: "",
  });

  useEffect(() => {
    fetchJobs();
    fetchBookings();
    fetchStaff();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (response.ok) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings?status=confirmed");
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      const data = await response.json();
      if (response.ok) {
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combine date and time into a proper timestamp
      const startTimestamp = formData.start_time 
        ? `${formData.scheduled_date}T${formData.start_time}:00`
        : null;

      const jobData = {
        booking_id: formData.booking_id,
        scheduled_date: formData.scheduled_date,
        start_time: startTimestamp,
        weather_condition: formData.weather_condition,
        notes: formData.notes,
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        await fetchJobs();
        setShowCreateModal(false);
        resetForm();
        alert("Job created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create job");
      }
    } catch (err) {
      console.error("Failed to create job:", err);
      alert("Failed to create job");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchJobs();
        alert("Status updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update job");
      }
    } catch (err) {
      console.error("Failed to update job:", err);
      alert("Failed to update job");
    }
  };

  const resetForm = () => {
    setFormData({
      booking_id: "",
      scheduled_date: "",
      start_time: "09:00",
      weather_condition: "dry",
      notes: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesSearch =
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.booking?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.booking?.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    return jobs.filter((job) => job.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {getStatusCount("pending")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Scheduled</h3>
          <p className="text-3xl font-bold text-blue-600">
            {getStatusCount("scheduled")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-purple-600">
            {getStatusCount("in_progress")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">
            {getStatusCount("completed")}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
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
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Job Number</p>
                  <h3 className="text-xl font-bold text-white">{job.job_number}</h3>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">
                  {job.booking?.customer?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold text-gray-900">
                  {job.booking?.service?.name || "N/A"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>
                    {job.scheduled_date
                      ? new Date(job.scheduled_date).toLocaleDateString()
                      : "Not scheduled"}
                  </span>
                </div>
                {job.start_time && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">
                      {new Date(job.start_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                )}
                {job.weather_condition && (
                  <div className="flex items-center gap-2">
                    <WeatherIcon condition={job.weather_condition} />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Update Status:
                </label>
                <select
                  value={job.status}
                  onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Create Job</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Booking *
                </label>
                <select
                  required
                  value={formData.booking_id}
                  onChange={(e) =>
                    setFormData({ ...formData, booking_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">Select Confirmed Booking</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.customer.name} - {booking.service.name} (
                      {new Date(booking.preferred_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Only confirmed bookings are shown
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduled_date}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weather Condition
                </label>
                <select
                  value={formData.weather_condition}
                  onChange={(e) =>
                    setFormData({ ...formData, weather_condition: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="dry">Dry</option>
                  <option value="wet">Wet</option>
                  <option value="rain">Rain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Job notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Create Job
                </button>
              </div>
            </form>
          </div>
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
