/**
 * Tax Configuration Component
 * Manage tax settings for the business
 */

import React, { useState } from 'react';
import { Receipt, Save, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import {
  TaxConfiguration as TaxConfig,
  TAX_TYPES,
  TAX_RATES,
  DEFAULT_TAX_CONFIG,
  isValidTIN,
  formatTaxRate,
  TAX_COMPLIANCE,
} from '@/lib/constants/taxes';

interface TaxConfigurationProps {
  initialConfig?: Partial<TaxConfig>;
  onSave?: (config: TaxConfig) => void;
}

export function TaxConfiguration({ initialConfig, onSave }: TaxConfigurationProps) {
  const [config, setConfig] = useState<TaxConfig>({
    ...DEFAULT_TAX_CONFIG,
    ...initialConfig,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [tinError, setTinError] = useState<string>('');

  const handleSave = async () => {
    // Validate TIN if provided
    if (config.tax_id && !isValidTIN(config.tax_id)) {
      setTinError('Invalid TIN format. Must be 9 digits.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save to database or API
      if (onSave) {
        await onSave(config);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTINChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 9);
    setConfig({ ...config, tax_id: cleanedValue });
    if (cleanedValue && !isValidTIN(cleanedValue)) {
      setTinError('TIN must be 9 digits');
    } else {
      setTinError('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-teal-600" />
            Tax Configuration
          </h2>
          <p className="text-gray-600 mt-1">
            Configure tax settings for invoices and quotations
          </p>
        </div>
      </div>

      {/* Rwanda Tax Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Rwanda Tax Compliance</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Standard VAT Rate: {formatTaxRate(TAX_RATES.VAT)}</li>
              <li>• VAT Registration Threshold: {TAX_COMPLIANCE.vat_registration_threshold.toLocaleString()} RWF annual turnover</li>
              <li>• Filing Frequency: {TAX_COMPLIANCE.vat_filing_frequency}</li>
              <li>• Payment Deadline: {TAX_COMPLIANCE.payment_deadline_days}th of following month</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Tax Status */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-600"
            />
            <div>
              <span className="font-semibold text-gray-900">Enable Tax Calculations</span>
              <p className="text-sm text-gray-600">
                Apply tax to invoices and quotations
              </p>
            </div>
          </label>
        </div>

        {config.enabled && (
          <>
            {/* Tax Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax Type
              </label>
              <select
                value={config.tax_type}
                onChange={(e) =>
                  setConfig({ ...config, tax_type: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              >
                <option value={TAX_TYPES.VAT}>Value Added Tax (VAT)</option>
                <option value={TAX_TYPES.WITHHOLDING}>Withholding Tax</option>
                <option value={TAX_TYPES.EXCISE}>Excise Duty</option>
              </select>
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={config.rate}
                onChange={(e) =>
                  setConfig({ ...config, rate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
              {config.tax_type === TAX_TYPES.VAT && (
                <p className="text-sm text-gray-600 mt-1">
                  Standard VAT rate in Rwanda is {formatTaxRate(TAX_RATES.VAT)}
                </p>
              )}
            </div>

            {/* Business Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Business Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={config.company_name || ''}
                    onChange={(e) =>
                      setConfig({ ...config, company_name: e.target.value })
                    }
                    placeholder="Enter company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax Identification Number (TIN)
                  </label>
                  <input
                    type="text"
                    value={config.tax_id || ''}
                    onChange={(e) => handleTINChange(e.target.value)}
                    placeholder="9-digit TIN"
                    maxLength={9}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                      tinError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {tinError && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {tinError}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Required for VAT-registered businesses
                  </p>
                </div>
              </div>
            </div>

            {/* Apply Tax To */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Apply Tax To
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.apply_to_services}
                    onChange={(e) =>
                      setConfig({ ...config, apply_to_services: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="text-gray-700">Service Charges</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.apply_to_materials}
                    onChange={(e) =>
                      setConfig({ ...config, apply_to_materials: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="text-gray-700">Materials & Supplies</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.apply_to_labor}
                    onChange={(e) =>
                      setConfig({ ...config, apply_to_labor: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="text-gray-700">Labor Costs</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.apply_to_equipment}
                    onChange={(e) =>
                      setConfig({ ...config, apply_to_equipment: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="text-gray-700">Equipment Rental</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="border-t pt-6 flex items-center justify-between">
          <div>
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Settings saved successfully</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Failed to save settings</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !!tinError}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tax Preview */}
      {config.enabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal (example)</span>
              <span className="font-medium">100,000 RWF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {config.tax_type === TAX_TYPES.VAT && `VAT (${config.rate}%)`}
                {config.tax_type === TAX_TYPES.WITHHOLDING && `Withholding Tax (${config.rate}%)`}
                {config.tax_type === TAX_TYPES.EXCISE && `Excise Duty (${config.rate}%)`}
              </span>
              <span className="font-medium">
                {((100000 * config.rate) / 100).toLocaleString()} RWF
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-teal-600">
                {(100000 + (100000 * config.rate) / 100).toLocaleString()} RWF
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
