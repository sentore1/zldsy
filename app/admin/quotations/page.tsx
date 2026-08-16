"use client";

import { useState, useEffect } from "react";
import { FileText, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, Plus, X, Download, Loader2 } from "lucide-react";
import { generateQuotationPDF, downloadPDF } from "@/lib/utils/pdf-generator";

interface Quotation {
  id: string;
  quotation_number: string;
  total_amount: number;
  tax: number;
  discount: number;
  final_amount: number;
  status: string;
  valid_until: string;
  created_at: string;
  booking?: {
    customer?: {
      name: string;
      email: string;
    };
    service?: {
      name: string;
    };
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customer_id: "",
    service_id: "",
    description: "",
    total_amount: 0,
    tax_rate: 10,
    tax: 0,
    discount: 0,
    final_amount: 0,
    valid_until: "",
    notes: "",
  });

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchServices();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/quotations");
      const data = await response.json();
      
      if (response.ok) {
        setQuotations(data.quotations || []);
      }
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?is_active=true");
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const handleDownloadPDF = async (quotation: Quotation) => {
    try {
      setDownloadingId(quotation.id);
      const pdfBlob = await generateQuotationPDF(quotation);
      
      if (pdfBlob) {
        downloadPDF(pdfBlob, `${quotation.quotation_number}.pdf`);
      } else {
        alert("Failed to generate PDF. Please try again.");
      }
    } catch (error) {
      console.error("Failed to download quotation PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const calculateAmounts = (amount: number, taxRate: number, discount: number) => {
    const tax = (amount * taxRate) / 100;
    const finalAmount = amount + tax - discount;
    return { tax, finalAmount };
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const { tax, finalAmount } = calculateAmounts(service.price, formData.tax_rate, formData.discount);
      setFormData({
        ...formData,
        service_id: serviceId,
        total_amount: service.price,
        tax,
        final_amount: finalAmount,
        description: service.description || "",
      });
    }
  };

  const handleAmountChange = (field: string, value: number) => {
    const updatedFormData = { ...formData, [field]: value };
    const { tax, finalAmount } = calculateAmounts(
      field === 'total_amount' ? value : updatedFormData.total_amount,
      field === 'tax_rate' ? value : updatedFormData.tax_rate,
      field === 'discount' ? value : updatedFormData.discount
    );
    setFormData({
      ...updatedFormData,
      tax,
      final_amount: finalAmount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: "sent",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Quotation created successfully!");
        setShowCreateModal(false);
        setFormData({
          customer_id: "",
          service_id: "",
          description: "",
          total_amount: 0,
          tax_rate: 10,
          tax: 0,
          discount: 0,
          final_amount: 0,
          valid_until: "",
          notes: "",
        });
        fetchQuotations();
      } else {
        alert(data.error || "Failed to create quotation");
      }
    } catch (err) {
      console.error("Failed to create quotation:", err);
      alert("Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter((quot) => {
    const matchesSearch = 
      quot.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quot.booking?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Quotation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Quotations</h3>
          <p className="text-3xl font-bold text-gray-900">{quotations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Sent</h3>
          <p className="text-3xl font-bold text-blue-600">
            {quotations.filter(q => q.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Accepted</h3>
          <p className="text-3xl font-bold text-green-600">
            {quotations.filter(q => q.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            RWF {quotations.filter(q => q.status === 'sent')
              .reduce((sum, q) => sum + q.final_amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by quotation number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Quotations List */}
      {filteredQuotations.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quotation #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuotations.map((quot) => (
                  <tr key={quot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quot.quotation_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quot.booking?.customer?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quot.booking?.customer?.email || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quot.booking?.service?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">RWF {quot.final_amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Tax: RWF {quot.tax.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={quot.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quot.valid_until).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedQuotation(quot);
                            setShowViewModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Quotation Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(quot)}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Download PDF"
                          disabled={downloadingId === quot.id}
                        >
                          {downloadingId === quot.id
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Download className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No quotations found</p>
          <p className="text-gray-400 text-sm mt-2">Quotations will appear here once created from bookings</p>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Manual Quotation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  required
                  value={formData.service_id}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - RWF {service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Additional details about this quotation..."
                />
              </div>

              {/* Amount Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) => handleAmountChange('total_amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_rate}
                    onChange={(e) => handleAmountChange('tax_rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    value={formData.tax.toFixed(2)}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => handleAmountChange('discount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Final Amount */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Final Amount:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    RWF {formData.final_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="date"
                  required
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Internal notes (not visible to customer)..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Quotation Modal */}
      {showViewModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Quotation Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedQuotation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Quotation Number</h3>
                    <p className="text-2xl font-bold text-gray-900">{selectedQuotation.quotation_number}</p>
                  </div>
                  <StatusBadge status={selectedQuotation.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {new Date(selectedQuotation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {new Date(selectedQuotation.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedQuotation.booking?.customer?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedQuotation.booking?.customer?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedQuotation.booking?.service?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Breakdown</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">
                      RWF {selectedQuotation.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold text-gray-900">
                      RWF {selectedQuotation.tax.toFixed(2)}
                    </span>
                  </div>
                  {selectedQuotation.discount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">
                        -RWF {selectedQuotation.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Final Amount:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        RWF {selectedQuotation.final_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedQuotation(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedQuotation) {
                      handleDownloadPDF(selectedQuotation);
                    }
                  }}
                  disabled={downloadingId === selectedQuotation?.id}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === selectedQuotation?.id
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Download className="w-5 h-5" />}
                  {downloadingId === selectedQuotation?.id ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: any }> = {
    sent: { label: "Sent", color: "bg-blue-100 text-blue-800", icon: Clock },
    accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
    expired: { label: "Expired", color: "bg-gray-100 text-gray-800", icon: XCircle },
  };

  const { label, color, icon: Icon } = config[status] || config.sent;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
