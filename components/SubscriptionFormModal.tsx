/**
 * Subscription Form Modal
 * Create and manage service subscriptions and contracts
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import {
  SUBSCRIPTION_TYPES,
  CONTRACT_TYPES,
  BILLING_CYCLES,
  SUBSCRIPTION_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  BILLING_CYCLE_LABELS,
  SUBSCRIPTION_DISCOUNTS,
  SUBSCRIPTION_FEATURES,
  calculateSubscriptionPrice,
} from '@/lib/constants/subscriptions';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData) => Promise<void>;
  subscription?: Partial<SubscriptionFormData> | null;
  mode: 'add' | 'edit';
  customerId?: string;
  serviceId?: string;
}

export interface SubscriptionFormData {
  id?: string;
  customer_id: string;
  service_id: string;
  subscription_type: 'weekly' | 'monthly' | 'yearly' | 'custom';
  contract_type: 'permanent' | 'fixed_term' | 'one_time';
  start_date: string;
  end_date?: string;
  custom_frequency_days?: number;
  base_price: string;
  discount_percentage?: string;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'upfront';
  total_services?: string;
  payment_method?: string;
  auto_renewal: boolean;
  notes?: string;
}

export function SubscriptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  subscription,
  mode,
  customerId,
  serviceId,
}: SubscriptionFormModalProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    customer_id: customerId || '',
    service_id: serviceId || '',
    subscription_type: 'monthly',
    contract_type: 'one_time',
    start_date: new Date().toISOString().split('T')[0],
    base_price: '',
    billing_cycle: 'monthly',
    auto_renewal: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  useEffect(() => {
    if (subscription) {
      setFormData({
        ...subscription,
        customer_id: subscription.customer_id || customerId || '',
        service_id: subscription.service_id || serviceId || '',
        base_price: subscription.base_price?.toString() || '',
        discount_percentage: subscription.discount_percentage?.toString(),
        total_services: subscription.total_services?.toString(),
      } as SubscriptionFormData);
    } else {
      setFormData({
        customer_id: customerId || '',
        service_id: serviceId || '',
        subscription_type: 'monthly',
        contract_type: 'one_time',
        start_date: new Date().toISOString().split('T')[0],
        base_price: '',
        billing_cycle: 'monthly',
        auto_renewal: false,
      });
    }
  }, [subscription, isOpen, customerId, serviceId]);

  // Calculate discounted price whenever base price or subscription type changes
  useEffect(() => {
    if (formData.base_price) {
      const basePrice = parseFloat(formData.base_price);
      const discountPercentage = formData.discount_percentage 
        ? parseFloat(formData.discount_percentage)
        : SUBSCRIPTION_DISCOUNTS[formData.subscription_type];
      
      const discounted = calculateSubscriptionPrice(
        basePrice,
        formData.subscription_type,
        discountPercentage
      );
      setCalculatedPrice(discounted);
    } else {
      setCalculatedPrice(0);
    }
  }, [formData.base_price, formData.subscription_type, formData.discount_percentage]);

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

  const discount = formData.discount_percentage 
    ? parseFloat(formData.discount_percentage)
    : SUBSCRIPTION_DISCOUNTS[formData.subscription_type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-teal-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <RefreshCw className="w-6 h-6" />
            {mode === 'add' ? 'Create New Subscription' : 'Edit Subscription'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subscription Type Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Type</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(SUBSCRIPTION_TYPES).map(([key, value]) => {
                const isSelected = formData.subscription_type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, subscription_type: value })}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{SUBSCRIPTION_TYPE_LABELS[value]}</h4>
                      {SUBSCRIPTION_DISCOUNTS[value] > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                          -{SUBSCRIPTION_DISCOUNTS[value]}%
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {SUBSCRIPTION_FEATURES[value].map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-teal-600 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contract Type */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contract Type</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(CONTRACT_TYPES).map(([key, value]) => (
                <label
                  key={value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.contract_type === value
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="contract_type"
                    value={value}
                    checked={formData.contract_type === value}
                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="font-semibold text-gray-900 mb-1">{CONTRACT_TYPE_LABELS[value]}</div>
                  <div className="text-xs text-gray-600">
                    {value === 'permanent' && 'Ongoing service with no end date'}
                    {value === 'fixed_term' && 'Contract for specific number of services'}
                    {value === 'one_time' && 'Single service booking'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Service Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Service Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {formData.contract_type === 'fixed_term' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required={formData.contract_type === 'fixed_term'}
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                      min={formData.start_date}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Services *
                    </label>
                    <input
                      type="number"
                      required={formData.contract_type === 'fixed_term'}
                      min="1"
                      value={formData.total_services || ''}
                      onChange={(e) => setFormData({ ...formData, total_services: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                      placeholder="e.g., 12"
                    />
                  </div>
                </>
              )}

              {formData.subscription_type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Frequency (Days) *
                  </label>
                  <input
                    type="number"
                    required={formData.subscription_type === 'custom'}
                    min="1"
                    value={formData.custom_frequency_days || ''}
                    onChange={(e) => setFormData({ ...formData, custom_frequency_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g., 14 (every 2 weeks)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (RWF) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount_percentage || discount}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  placeholder={discount.toString()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: {discount}% for {SUBSCRIPTION_TYPE_LABELS[formData.subscription_type]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle *
                </label>
                <select
                  required
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                >
                  {Object.entries(BILLING_CYCLES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {BILLING_CYCLE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method || ''}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Price Summary */}
            {calculatedPrice > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Base Price:</span>
                  <span className="text-sm font-medium">RWF {parseFloat(formData.base_price).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-700">Discount ({discount}%):</span>
                    <span className="text-sm font-medium text-green-700">
                      -RWF {(parseFloat(formData.base_price) * discount / 100).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-green-300">
                  <span className="font-bold text-gray-900">Final Price:</span>
                  <span className="text-xl font-bold text-green-700">
                    RWF {calculatedPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Auto Renewal */}
          <div className="border-t pt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_renewal}
                onChange={(e) => setFormData({ ...formData, auto_renewal: e.target.checked })}
                className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-gray-900">Enable Auto-Renewal</div>
                <p className="text-sm text-gray-600">
                  Automatically renew this subscription when it expires. You'll be notified 7 days before renewal.
                </p>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600"
              rows={3}
              placeholder="Any special instructions or requirements"
            />
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
              className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium disabled:bg-gray-400"
            >
              {submitting ? 'Creating...' : mode === 'add' ? 'Create Subscription' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
