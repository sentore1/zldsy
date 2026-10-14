'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  base_price: number;
  category?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  service_id?: string;
  billing_cycle: 'weekly' | 'monthly' | 'yearly' | 'permanent';
  price: number;
  setup_fee: number;
  included_visits?: number;
  visit_duration?: number;
  priority_level: string;
  discount_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_id: '',
    billing_cycle: 'monthly' as const,
    price: '',
    setup_fee: '0',
    included_visits: '',
    visit_duration: '120',
    priority_level: 'standard',
    discount_percentage: '0',
    is_active: true,
    is_featured: false,
    display_order: '0',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, servicesRes] = await Promise.all([
        fetch('/api/subscriptions/plans'),
        fetch('/api/services?active=true'),
      ]);

      const plansData = await plansRes.json();
      const servicesData = await servicesRes.json();

      setPlans(plansData || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        service_id: formData.service_id || null,
        billing_cycle: formData.billing_cycle,
        price: parseFloat(formData.price),
        setup_fee: parseFloat(formData.setup_fee),
        included_visits: formData.included_visits ? parseInt(formData.included_visits) : null,
        visit_duration: formData.visit_duration ? parseInt(formData.visit_duration) : null,
        priority_level: formData.priority_level,
        discount_percentage: parseFloat(formData.discount_percentage),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        display_order: parseInt(formData.display_order),
      };

      const url = editingPlan
        ? `/api/subscriptions/plans/${editingPlan.id}`
        : '/api/subscriptions/plans';

      const method = editingPlan ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal();
        alert(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      service_id: plan.service_id || '',
      billing_cycle: plan.billing_cycle,
      price: plan.price.toString(),
      setup_fee: plan.setup_fee.toString(),
      included_visits: plan.included_visits?.toString() || '',
      visit_duration: plan.visit_duration?.toString() || '120',
      priority_level: plan.priority_level,
      discount_percentage: plan.discount_percentage.toString(),
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      display_order: plan.display_order.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`/api/subscriptions/plans/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
        alert('Plan deleted successfully!');
      } else {
        alert('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      service_id: '',
      billing_cycle: 'monthly',
      price: '',
      setup_fee: '0',
      included_visits: '',
      visit_duration: '120',
      priority_level: 'standard',
      discount_percentage: '0',
      is_active: true,
      is_featured: false,
      display_order: '0',
    });
  };

  const getServiceName = (serviceId?: string) => {
    if (!serviceId) return 'All Services';
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="mt-1 text-gray-500">
            Manage recurring service plans
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{plan.billing_cycle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold text-gray-900">
                    {getServiceName(plan.service_id)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-green-600">
                    ${plan.price.toFixed(2)}
                  </span>
                </div>
                {plan.included_visits && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Visits:</span>
                    <span className="font-semibold">{plan.included_visits}</span>
                  </div>
                )}
                {plan.discount_percentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-orange-600">
                      {plan.discount_percentage}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {plan.is_featured && (
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                    Featured
                  </span>
                )}
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    plan.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? 'Edit Plan' : 'New Subscription Plan'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Weekly Premium Cleaning"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the plan..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service
                    </label>
                    <select
                      value={formData.service_id}
                      onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Services</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.base_price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select a specific service this plan applies to
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Billing Cycle *
                    </label>
                    <select
                      required
                      value={formData.billing_cycle}
                      onChange={(e) =>
                        setFormData({ ...formData, billing_cycle: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Setup Fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.setup_fee}
                      onChange={(e) => setFormData({ ...formData, setup_fee: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Included Visits
                    </label>
                    <input
                      type="number"
                      value={formData.included_visits}
                      onChange={(e) =>
                        setFormData({ ...formData, included_visits: e.target.value })
                      }
                      placeholder="Leave empty for unlimited"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visit Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.visit_duration}
                      onChange={(e) =>
                        setFormData({ ...formData, visit_duration: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority_level}
                      onChange={(e) =>
                        setFormData({ ...formData, priority_level: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="priority">Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_percentage: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({ ...formData, display_order: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          setFormData({ ...formData, is_featured: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
