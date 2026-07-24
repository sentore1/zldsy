"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight, X } from "lucide-react";

// Format currency for better readability
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return amount.toString();
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  min_price: number | null;
  max_price: number | null;
  display_price_type: 'single' | 'range';
  unit: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    display_price_type: "single" as 'single' | 'range',
    base_price: "",
    min_price: "",
    max_price: "",
    unit: "",
    image_url: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services");
      const data = await response.json();
      
      if (response.ok) {
        setServices(data.services || []);
      } else {
        setError(data.error || "Failed to fetch services");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleServiceStatus = async (id: string) => {
    try {
      const service = services.find((s) => s.id === id);
      if (!service) return;

      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active }),
      });

      if (response.ok) {
        setServices(
          services.map((s) =>
            s.id === id ? { ...s, is_active: !s.is_active } : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle service status:", err);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let uploadedImageUrl = formData.image_url;

      // Upload image if selected
      if (imageFile) {
        uploadedImageUrl = await uploadServiceImage(imageFile);
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        display_price_type: formData.display_price_type,
        image_url: uploadedImageUrl,
        is_active: formData.is_active,
      };

      if (formData.display_price_type === 'single') {
        payload.base_price = parseFloat(formData.base_price);
        payload.min_price = null;
        payload.max_price = null;
      } else {
        payload.min_price = parseFloat(formData.min_price);
        payload.max_price = parseFloat(formData.max_price);
        payload.base_price = parseFloat(formData.min_price); // Set base_price to min for backward compatibility
      }

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchServices();
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to add service:", err);
    }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      let uploadedImageUrl = formData.image_url;

      // Upload new image if selected
      if (imageFile) {
        uploadedImageUrl = await uploadServiceImage(imageFile);
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        display_price_type: formData.display_price_type,
        image_url: uploadedImageUrl,
        is_active: formData.is_active,
      };

      if (formData.display_price_type === 'single') {
        payload.base_price = parseFloat(formData.base_price);
        payload.min_price = null;
        payload.max_price = null;
      } else {
        payload.min_price = parseFloat(formData.min_price);
        payload.max_price = parseFloat(formData.max_price);
        payload.base_price = parseFloat(formData.min_price); // Set base_price to min for backward compatibility
      }

      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchServices();
        setShowEditModal(false);
        setSelectedService(null);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to update service:", err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setServices(services.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      display_price_type: service.display_price_type || 'single',
      base_price: service.base_price.toString(),
      min_price: service.min_price?.toString() || "",
      max_price: service.max_price?.toString() || "",
      unit: service.unit || "",
      image_url: service.image_url || "",
      is_active: service.is_active,
    });
    setImagePreview(service.image_url || "");
    setImageFile(null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      display_price_type: "single",
      base_price: "",
      min_price: "",
      max_price: "",
      unit: "",
      image_url: "",
      is_active: true,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const uploadServiceImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/services/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          onClick={fetchServices}
          className="mt-2 text-red-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2"
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
            {services.filter((s) => s.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Categories
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {new Set(services.map((s) => s.category).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Average Price
          </h3>
          <p className="text-3xl font-bold text-teal-600">
            {services.length > 0 
              ? `${formatCurrency(Math.round(services.reduce((sum, s) => sum + s.base_price, 0) / services.length))} Rwf` 
              : '0 Rwf'}
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
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
            {/* Service Image */}
            {service.image_url && (
              <div className="relative h-48 w-full bg-gray-100">
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 pb-0 flex items-center justify-between">
              <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                {service.category || "Uncategorized"}
              </div>
              <button
                onClick={() => toggleServiceStatus(service.id)}
                className="text-teal-600 hover:scale-110 transition"
              >
                {service.is_active ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {service.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {service.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description || "No description"}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Price</span>
                  <span className="font-bold text-teal-600 text-lg flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {service.display_price_type === 'range' && service.min_price && service.max_price
                      ? `${formatCurrency(service.min_price)} - ${formatCurrency(service.max_price)} Rwf`
                      : `${formatCurrency(service.base_price)} Rwf`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Unit</span>
                  <span className="font-semibold text-gray-900">
                    {service.unit || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(service)}
                  className="flex-1 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
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

      {/* Add Service Modal */}
      {showAddModal && (
        <ServiceModal
          title="Add New Service"
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onSubmit={handleAddService}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Service Modal */}
      {showEditModal && (
        <ServiceModal
          title="Edit Service"
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onSubmit={handleEditService}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({
  title,
  formData,
  setFormData,
  imagePreview,
  onImageChange,
  onSubmit,
  onClose,
}: {
  title: string;
  formData: any;
  setFormData: any;
  imagePreview: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
              Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              placeholder="e.g., Home Fumigation"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              placeholder="Brief description of the service"
            />
          </div>

          {/* Service Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="e.g., Fumigation"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="e.g., per sqm, per hour"
              />
            </div>
          </div>

          {/* Price Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price Display Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="display_price_type"
                  value="single"
                  checked={formData.display_price_type === 'single'}
                  onChange={(e) =>
                    setFormData({ ...formData, display_price_type: e.target.value })
                  }
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm text-gray-700">Fixed Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="display_price_type"
                  value="range"
                  checked={formData.display_price_type === 'range'}
                  onChange={(e) =>
                    setFormData({ ...formData, display_price_type: e.target.value })
                  }
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm text-gray-700">Price Range</span>
              </label>
            </div>
          </div>

          {/* Conditional Price Input */}
          {formData.display_price_type === 'single' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base Price * (RWF)
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({ ...formData, base_price: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Price * (RWF)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.min_price}
                  onChange={(e) =>
                    setFormData({ ...formData, min_price: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Price * (RWF)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.max_price}
                  onChange={(e) =>
                    setFormData({ ...formData, max_price: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="32000"
                />
              </div>
            </div>
          )}

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
              Active (visible to customers)
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
              {title.includes("Add") ? "Add Service" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
