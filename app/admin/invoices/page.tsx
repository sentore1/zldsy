"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Download, Eye, DollarSign, AlertCircle, X, Loader2, CreditCard } from "lucide-react";
import { generateInvoicePDF, downloadPDF } from "@/lib/utils/pdf-generator";

interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  total_amount: number;
  tax?: number;
  discount?: number;
  final_amount?: number;
  status: string;
  due_date: string;
  paid_date?: string | null;
  created_at: string;
  job?: {
    job_number: string;
    booking?: {
      customer?: {
        first_name: string;
        last_name: string;
      };
      service?: {
        name: string;
      };
    };
  };
}

interface Job {
  id: string;
  job_number: string;
  booking?: {
    customer?: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method: "cash",
    transaction_reference: "",
    notes: "",
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    job_id: "",
    total_amount: "",
    tax_amount: "",
    discount_amount: "",
    due_date: "",
  });

  useEffect(() => {
    fetchInvoices();
    fetchJobs();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invoices");
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalAmount = parseFloat(formData.total_amount);
      const taxAmount = formData.tax_amount ? parseFloat(formData.tax_amount) : 0;
      const discountAmount = formData.discount_amount ? parseFloat(formData.discount_amount) : 0;
      const finalAmount = totalAmount + taxAmount - discountAmount;

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: formData.job_id,
          total_amount: totalAmount,
          tax: taxAmount,
          discount: discountAmount,
          final_amount: finalAmount,
          due_date: formData.due_date,
          status: "pending",
        }),
      });

      if (response.ok) {
        alert("Invoice created successfully!");
        setShowCreateModal(false);
        setFormData({
          job_id: "",
          total_amount: "",
          tax_amount: "",
          discount_amount: "",
          due_date: "",
        });
        fetchInvoices();
      } else {
        alert("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice");
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const data = await response.json();
      setSelectedInvoice(data.invoice);
      setShowViewModal(true);
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
      alert("Failed to load invoice details");
    }
  };

  const handleRecordPayment = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: invoice.final_amount?.toString() || invoice.total_amount.toString(),
      payment_method: "cash",
      transaction_reference: "",
      notes: "",
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: selectedInvoice.id,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          transaction_reference: paymentData.transaction_reference || undefined,
          notes: paymentData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Payment recorded successfully!\n\nInvoice: ${data.invoice.invoice_number}\nAmount Paid: RWF ${data.payment.amount}\nRemaining: RWF ${data.invoice.remaining.toFixed(2)}\nStatus: ${data.invoice.fully_paid ? 'Fully Paid' : 'Partially Paid'}`);
        setShowPaymentModal(false);
        setPaymentData({
          amount: "",
          payment_method: "cash",
          transaction_reference: "",
          notes: "",
        });
        fetchInvoices(); // Refresh list
      } else {
        alert(data.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Failed to record payment:", error);
      alert("Failed to record payment");
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      setDownloadingId(invoice.id);

      // Fetch full invoice data (includes nested job → booking → customer/service)
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const data = await response.json();
      const invoiceData = data.invoice;

      const pdfBlob = await generateInvoicePDF(invoiceData);
      if (pdfBlob) {
        downloadPDF(pdfBlob, `${invoiceData.invoice_number}.pdf`);
      } else {
        alert("Failed to generate PDF. Please try again.");
      }
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShareInvoice = (invoice: Invoice) => {
    const invoiceUrl = `${window.location.origin}/invoice/${invoice.id}`;
    navigator.clipboard.writeText(invoiceUrl);
    alert(`Invoice link copied! Share this link with the customer:\n${invoiceUrl}`);
  };

  const handleMarkPaid = async (invoiceId: string) => {
    if (!confirm("Mark this invoice as paid?")) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paid_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Invoice marked as paid!");
        fetchInvoices();
      } else {
        alert("Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Error updating invoice");
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      filterStatus === "all" || invoice.status === filterStatus;
    const customerName = invoice.job?.booking?.customer 
      ? `${invoice.job.booking.customer.first_name} ${invoice.job.booking.customer.last_name}`
      : "";
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.job?.job_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    return invoices.filter((inv) => inv.status === status).length;
  };

  const getTotalAmount = (status: string) => {
    return invoices
      .filter((inv) => status === "all" || inv.status === status)
      .reduce((sum, inv) => sum + inv.total_amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#28A8AC' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 text-white rounded-lg transition font-medium flex items-center gap-2"
          style={{ backgroundColor: '#28A8AC' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor='#09ACAD')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor='#28A8AC')}
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold">
              Total Revenue
            </h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            RWF {getTotalAmount("all").toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {invoices.length} invoices
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold">Paid</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            RWF {getTotalAmount("paid").toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {getStatusCount("paid")} invoices
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            RWF {getTotalAmount("pending").toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {getStatusCount("pending")} invoices
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold">Overdue</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            RWF {getTotalAmount("overdue").toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {getStatusCount("overdue")} invoices
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by invoice number, customer, or job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "all"
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={filterStatus === "all" ? { backgroundColor: '#28A8AC' } : {}}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "paid"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("overdue")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "overdue"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overdue
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const customerName = invoice.job?.booking?.customer
                  ? `${invoice.job.booking.customer.first_name} ${invoice.job.booking.customer.last_name}`
                  : "N/A";
                const serviceName = invoice.job?.booking?.service?.name || "N/A";
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.job?.job_number || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {serviceName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        RWF {invoice.total_amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                      {invoice.paid_date && (
                        <div className="text-xs text-green-600">
                          Paid: {new Date(invoice.paid_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 rounded-lg transition"
                          style={{ color: '#28A8AC' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor='rgba(40, 168, 172, 0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor='transparent')}
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareInvoice(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Share Invoice Link"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          title="Download PDF"
                          disabled={downloadingId === invoice.id}
                        >
                          {downloadingId === invoice.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Download className="w-4 h-4" />}
                        </button>
                        {invoice.status !== "paid" && (
                          <button 
                            onClick={() => handleRecordPayment(invoice)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-semibold flex items-center gap-1"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            Record Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job *
                </label>
                <select
                  required
                  value={formData.job_id}
                  onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.job_number} - {job.booking?.customer 
                        ? `${job.booking.customer.first_name} ${job.booking.customer.last_name}`
                        : 'Unknown Customer'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                  style={{ backgroundColor: '#28A8AC' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor='#09ACAD')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor='#28A8AC')}
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Invoice Number</h3>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {selectedInvoice.invoice_number}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>
              </div>

              {/* Customer & Job Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedInvoice.job?.booking?.customer
                      ? `${selectedInvoice.job.booking.customer.first_name} ${selectedInvoice.job.booking.customer.last_name}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Job Number</h3>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedInvoice.job?.job_number || "N/A"}
                  </p>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Service</h3>
                <p className="text-base text-gray-900 mt-1">
                  {selectedInvoice.job?.booking?.service?.name || "N/A"}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedInvoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedInvoice.paid_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Paid Date</h3>
                  <p className="text-base text-green-600 font-semibold mt-1">
                    {new Date(selectedInvoice.paid_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Amount Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-gray-900">
                      RWF {selectedInvoice.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleShareInvoice(selectedInvoice)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Link
                </button>
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  disabled={downloadingId === selectedInvoice.id}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === selectedInvoice.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />}
                  {downloadingId === selectedInvoice.id ? "Generating..." : "Download PDF"}
                </button>
                {selectedInvoice.status !== "paid" && (
                  <button
                    onClick={() => {
                      handleMarkPaid(selectedInvoice.id);
                      setShowViewModal(false);
                    }}
                    className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                    style={{ backgroundColor: '#28A8AC' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor='#09ACAD')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor='#28A8AC')}
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600">Invoice</div>
                <div className="text-lg font-bold text-gray-900">{selectedInvoice.invoice_number}</div>
                <div className="text-sm text-gray-600 mt-2">Total Amount</div>
                <div className="text-2xl font-bold" style={{ color: '#28A8AC' }}>
                  RWF {(selectedInvoice.final_amount || selectedInvoice.total_amount).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  max={selectedInvoice.final_amount || selectedInvoice.total_amount}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter full amount or partial payment
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  required
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Reference
                  {(paymentData.payment_method === 'bank_transfer' || paymentData.payment_method === 'check') && ' *'}
                </label>
                <input
                  type="text"
                  required={paymentData.payment_method === 'bank_transfer' || paymentData.payment_method === 'check'}
                  value={paymentData.transaction_reference}
                  onChange={(e) => setPaymentData({ ...paymentData, transaction_reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="Transaction ID, Check #, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="Additional notes about this payment..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Paid", color: "bg-green-100 text-green-800" },
    overdue: { label: "Overdue", color: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}
