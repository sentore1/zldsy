"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, UserCheck, UserX, DollarSign, X } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  hourly_rate: number;
  is_active: boolean;
  created_at?: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    hourly_rate: "",
    is_active: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff");
      const data = await response.json();
      
      if (response.ok) {
        setStaff(data.staff || []);
      } else {
        setError(data.error || "Failed to fetch staff");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hourly_rate: parseFloat(formData.hourly_rate),
        }),
      });

      if (response.ok) {
        await fetchStaff();
        setShowAddModal(false);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add staff");
      }
    } catch (err) {
      console.error("Failed to add staff:", err);
      alert("Failed to add staff");
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hourly_rate: parseFloat(formData.hourly_rate),
        }),
      });

      if (response.ok) {
        await fetchStaff();
        setShowEditModal(false);
        setSelectedStaff(null);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update staff");
      }
    } catch (err) {
      console.error("Failed to update staff:", err);
      alert("Failed to update staff");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStaff(staff.filter((s) => s.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete staff");
      }
    } catch (err) {
      console.error("Failed to delete staff:", err);
      alert("Failed to delete staff");
    }
  };

  const openEditModal = (member: Staff) => {
    setSelectedStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      hourly_rate: member.hourly_rate.toString(),
      is_active: member.is_active,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      hourly_rate: "",
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchStaff}
          className="mt-2 text-red-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && member.is_active) ||
      (filterStatus === "inactive" && !member.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Staff
          </h3>
          <p className="text-3xl font-bold text-gray-900">{totalStaff}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Active Staff
          </h3>
          <p className="text-3xl font-bold text-green-600">{activeStaff}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Inactive Staff
          </h3>
          <p className="text-3xl font-bold text-red-600">{totalStaff - activeStaff}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Avg Rate
          </h3>
          <p className="text-3xl font-bold text-teal-600">
            RWF {staff.length > 0 ? (staff.reduce((sum, s) => sum + s.hourly_rate, 0) / staff.length).toFixed(0) : 0}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            {/* Header */}
            <div className="bg-teal-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-teal-600 text-2xl font-bold shadow-lg">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    member.is_active
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {member.is_active ? (
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <UserX className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{member.name}</h3>
              <p className="text-teal-100 text-sm">{member.role}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="text-sm font-semibold text-gray-900">
                  {member.email}
                </p>
                <p className="text-sm text-gray-700">{member.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="text-lg font-bold text-teal-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {member.hourly_rate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {member.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openEditModal(member)}
                  className="flex-1 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No staff members found</p>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <StaffModal
          title="Add Staff Member"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddStaff}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <StaffModal
          title="Edit Staff Member"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditStaff}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStaff(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
}

function StaffModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
}: {
  title: string;
  formData: any;
  setFormData: any;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="staff@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                System Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
              >
                <option value="">Select a role</option>
                <option value="admin">Admin - Full system access</option>
                <option value="manager">Manager - Manage customers, services, bookings, staff</option>
                <option value="staff">Staff - View dashboard and manage assigned jobs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hourly Rate ($) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) =>
                  setFormData({ ...formData, hourly_rate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="25.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
              Active (available for job assignments)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
            >
              {title.includes("Add") ? "Add Staff" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
