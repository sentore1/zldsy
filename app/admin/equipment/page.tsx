"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Edit, Trash2, Search, X } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: string;
  registration_number: string;
  status: string;
  fuel_capacity: number | null;
  notes: string | null;
  created_at?: string;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "vehicle",
    registration_number: "",
    status: "available",
    fuel_capacity: "",
    notes: "",
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/equipment");
      const data = await response.json();
      if (response.ok) {
        setEquipment(data.equipment || []);
      }
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fuel_capacity: formData.fuel_capacity ? parseFloat(formData.fuel_capacity) : null,
        }),
      });

      if (response.ok) {
        await fetchEquipment();
        setShowAddModal(false);
        resetForm();
        alert("Equipment added successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add equipment");
      }
    } catch (err) {
      console.error("Failed to add equipment:", err);
      alert("Failed to add equipment");
    }
  };

  const handleEditEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      const response = await fetch(`/api/equipment/${selectedEquipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fuel_capacity: formData.fuel_capacity ? parseFloat(formData.fuel_capacity) : null,
        }),
      });

      if (response.ok) {
        await fetchEquipment();
        setShowEditModal(false);
        setSelectedEquipment(null);
        resetForm();
        alert("Equipment updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update equipment");
      }
    } catch (err) {
      console.error("Failed to update equipment:", err);
      alert("Failed to update equipment");
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEquipment(equipment.filter((e) => e.id !== id));
        alert("Equipment deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete equipment");
      }
    } catch (err) {
      console.error("Failed to delete equipment:", err);
      alert("Failed to delete equipment");
    }
  };

  const openEditModal = (item: Equipment) => {
    setSelectedEquipment(item);
    setFormData({
      name: item.name,
      type: item.type,
      registration_number: item.registration_number,
      status: item.status,
      fuel_capacity: item.fuel_capacity?.toString() || "",
      notes: item.notes || "",
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "vehicle",
      registration_number: "",
      status: "available",
      fuel_capacity: "",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Equipment & Vehicles</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Equipment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Equipment</h3>
          <p className="text-3xl font-bold text-gray-900">{equipment.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Available</h3>
          <p className="text-3xl font-bold text-green-600">
            {equipment.filter(e => e.status === 'available').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">In Use</h3>
          <p className="text-3xl font-bold text-blue-600">
            {equipment.filter(e => e.status === 'in_use').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Maintenance</h3>
          <p className="text-3xl font-bold text-orange-600">
            {equipment.filter(e => e.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <Truck className="w-12 h-12 text-white" />
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{item.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Registration</span>
                  <span className="font-semibold text-gray-900">{item.registration_number}</span>
                </div>
                {item.fuel_capacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Fuel Capacity</span>
                    <span className="font-semibold text-gray-900">{item.fuel_capacity}L</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEquipment(item.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No equipment found. Add your first equipment or vehicle!</p>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <EquipmentModal
          title="Add Equipment"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddEquipment}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && (
        <EquipmentModal
          title="Edit Equipment"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditEquipment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEquipment(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
}

function EquipmentModal({
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
              Equipment Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="e.g., Service Van 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="vehicle">Vehicle</option>
                <option value="machine">Machine</option>
                <option value="tool">Tool</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Number *
              </label>
              <input
                type="text"
                required
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({ ...formData, registration_number: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="e.g., SVC-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fuel Capacity (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.fuel_capacity}
                onChange={(e) =>
                  setFormData({ ...formData, fuel_capacity: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="60"
              />
            </div>
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
              placeholder="Additional notes..."
            />
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
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              {title.includes("Add") ? "Add Equipment" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    available: { label: "Available", color: "bg-green-100 text-green-800" },
    in_use: { label: "In Use", color: "bg-blue-100 text-blue-800" },
    maintenance: { label: "Maintenance", color: "bg-orange-100 text-orange-800" },
  };

  const { label, color } = config[status] || config.available;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
