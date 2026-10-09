/**
 * Enhanced Staff Form Modal with Role Management
 */

import { X, User, Mail, Phone, Briefcase, DollarSign, Calendar, Shield, Users } from 'lucide-react';
import { STAFF_ROLES, STAFF_ROLE_LABELS, STAFF_ROLE_DESCRIPTIONS, EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS } from '@/lib/constants/roles';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
  staff?: StaffFormData | null;
  mode: 'add' | 'edit';
}

export interface StaffFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Job role (technician, driver, etc.)
  system_role: 'admin' | 'supervisor' | 'staff';
  employment_type: 'permanent' | 'casual' | 'contract' | 'part_time';
  hourly_rate: string;
  date_hired: string;
  can_login: boolean;
  is_active: boolean;
  password?: string;
}

export function StaffFormModal({ isOpen, onClose, onSubmit, staff, mode }: StaffFormModalProps) {
  const [formData, setFormData] = React.useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    system_role: 'staff',
    employment_type: 'casual',
    hourly_rate: '',
    date_hired: new Date().toISOString().split('T')[0],
    can_login: false,
    is_active: true,
    password: '',
  });

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (staff) {
      setFormData({
        ...staff,
        password: '', // Never pre-fill password
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        system_role: 'staff',
        employment_type: 'casual',
        hourly_rate: '',
        date_hired: new Date().toISOString().split('T')[0],
        can_login: false,
        is_active: true,
        password: '',
      });
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-teal-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-6 h-6" />
            {mode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="+250 7XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="e.g., Technician, Driver, Cleaner"
                />
              </div>
            </div>
          </div>

          {/* System Access & Permissions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              System Access & Permissions
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Role *
                </label>
                <select
                  required
                  value={formData.system_role}
                  onChange={(e) => setFormData({ ...formData, system_role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                >
                  {Object.entries(STAFF_ROLES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {STAFF_ROLE_LABELS[value]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {STAFF_ROLE_DESCRIPTIONS[formData.system_role]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Can Login to System?
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.can_login}
                    onChange={(e) => setFormData({ ...formData, can_login: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm">Allow system access</span>
                </label>
                {mode === 'add' && formData.can_login && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Password *
                    </label>
                    <input
                      type="password"
                      required={formData.can_login}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                      minLength={8}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" />
              Employment Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  required
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                >
                  {Object.entries(EMPLOYMENT_TYPES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {EMPLOYMENT_TYPE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (RWF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Hired *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_hired}
                  onChange={(e) => setFormData({ ...formData, date_hired: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : mode === 'add' ? 'Add Staff Member' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
