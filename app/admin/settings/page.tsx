"use client";

import { useState } from "react";
import { Save, Building2, Mail, Phone, MapPin, DollarSign, Calendar } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Premier Service Management",
    companyEmail: "info@premierservice.com",
    companyPhone: "+1-555-0100",
    companyAddress: "100 Business Park Drive, Suite 200, New York, NY 10001",
    taxRate: "10",
    currency: "USD",
    quotationValidityDays: "7",
    invoiceDueDays: "30",
    timezone: "America/New_York",
    momoCode: "",
  });

  const handleSave = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: settings.companyName,
          company_email: settings.companyEmail,
          company_phone: settings.companyPhone,
          company_address: settings.companyAddress,
          tax_rate: parseFloat(settings.taxRate),
          currency: settings.currency,
          quotation_validity_days: parseInt(settings.quotationValidityDays),
          invoice_due_days: parseInt(settings.invoiceDueDays),
          timezone: settings.timezone,
          momo_code: settings.momoCode,
        }),
      });
      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Error saving settings");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={settings.companyPhone}
                onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
              <textarea
                value={settings.companyAddress}
                onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                rows={3}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Financial Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              MoMo Payment Code
            </label>
            <input
              type="text"
              value={settings.momoCode}
              onChange={(e) => setSettings({...settings, momoCode: e.target.value})}
              placeholder="e.g. 0781234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">Used to generate USSD QR codes on invoices: *182*8*1*{'{momoCode}'}*{'{amount}'}#</p>
          </div>
        </div>
      </div>

      {/* Document Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">Document Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quotation Validity (days)
            </label>
            <input
              type="number"
              value={settings.quotationValidityDays}
              onChange={(e) => setSettings({...settings, quotationValidityDays: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">How long quotations remain valid</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Invoice Due Period (days)
            </label>
            <input
              type="number"
              value={settings.invoiceDueDays}
              onChange={(e) => setSettings({...settings, invoiceDueDays: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">Default payment due period</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-10 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Note</h3>
        <p className="text-blue-800 text-sm">
          Settings page UI is ready. To make these settings functional, connect to the <code className="bg-blue-100 px-2 py-1 rounded">/api/settings</code> endpoint.
          Add GET endpoint to fetch settings and POST/PATCH to update them in the database.
        </p>
      </div>
    </div>
  );
}
