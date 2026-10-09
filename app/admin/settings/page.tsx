"use client";

import { useState, useEffect } from "react";
import { Save, Building2, Mail, Phone, MapPin, DollarSign, Calendar, Link as LinkIcon, Plus, Trash2, ExternalLink } from "lucide-react";

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

  const [externalLinks, setExternalLinks] = useState<any[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "tips",
    icon: "lightbulb",
    show_in_footer: true,
    show_in_customer_portal: true,
  });

  useEffect(() => {
    loadExternalLinks();
  }, []);

  const loadExternalLinks = async () => {
    try {
      const response = await fetch('/api/external-links');
      if (response.ok) {
        const data = await response.json();
        setExternalLinks(data);
      }
    } catch (error) {
      console.error('Error loading external links:', error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

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

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      alert('Title and URL are required');
      return;
    }

    try {
      const response = await fetch('/api/external-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        await loadExternalLinks();
        setNewLink({
          title: "",
          url: "",
          description: "",
          category: "tips",
          icon: "lightbulb",
          show_in_footer: true,
          show_in_customer_portal: true,
        });
        setShowAddLink(false);
        alert('Link added successfully!');
      } else {
        alert('Failed to add link');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Error adding link');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/api/external-links/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadExternalLinks();
        alert('Link deleted successfully!');
      } else {
        alert('Failed to delete link');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Error deleting link');
    }
  };

  const toggleLinkStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/external-links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        await loadExternalLinks();
      } else {
        alert('Failed to update link status');
      }
    } catch (error) {
      console.error('Error updating link:', error);
      alert('Error updating link status');
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
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

      {/* External Links Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">External Links</h2>
          </div>
          <button
            onClick={() => setShowAddLink(!showAddLink)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Add links to your blog, tips pages, or resources. These will appear in the footer and customer portal.
        </p>

        {/* Add Link Form */}
        {showAddLink && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Add New Link</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  placeholder="e.g., Cleaning Tips"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  placeholder="https://yourblog.com/cleaning-tips"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                  placeholder="Brief description of the link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink({...newLink, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="tips">Tips & Guides</option>
                  <option value="blog">Blog</option>
                  <option value="resources">Resources</option>
                  <option value="help">Help & Support</option>
                  <option value="social">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={newLink.icon}
                  onChange={(e) => setNewLink({...newLink, icon: e.target.value})}
                  placeholder="e.g., lightbulb, article, help_outline"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLink.show_in_footer}
                    onChange={(e) => setNewLink({...newLink, show_in_footer: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show in Footer</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLink.show_in_customer_portal}
                    onChange={(e) => setNewLink({...newLink, show_in_customer_portal: e.target.checked})}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show in Customer Portal</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddLink}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Add Link
              </button>
              <button
                onClick={() => setShowAddLink(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Links List */}
        {isLoadingLinks ? (
          <div className="text-center py-8 text-gray-500">Loading links...</div>
        ) : externalLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No external links added yet. Click "Add Link" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {externalLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{link.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      link.category === 'tips' ? 'bg-blue-100 text-blue-700' :
                      link.category === 'blog' ? 'bg-purple-100 text-purple-700' :
                      link.category === 'social' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {link.category}
                    </span>
                    {!link.is_active && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  {link.description && (
                    <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-gray-400">•</span>
                    {link.show_in_footer && (
                      <span className="text-xs text-gray-500">Footer</span>
                    )}
                    {link.show_in_footer && link.show_in_customer_portal && (
                      <span className="text-gray-400">•</span>
                    )}
                    {link.show_in_customer_portal && (
                      <span className="text-xs text-gray-500">Customer Portal</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLinkStatus(link.id, link.is_active)}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      link.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {link.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
