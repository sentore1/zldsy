"use client";

import { useState, useEffect } from "react";
import { DollarSign, Search, CreditCard, Calendar, Plus, X, Eye, Download, Filter } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  transaction_reference: string;
  payment_date: string;
  notes?: string;
  invoice?: {
    invoice_number: string;
    final_amount: number;
    status?: string;
    job?: {
      job_number: string;
      booking?: {
        customer?: {
          name: string;
          email?: string;
          phone?: string;
        };
      };
    };
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  final_amount: number;
  status: string;
  job?: {
    job_number: string;
    booking?: {
      customer?: {
        name: string;
      };
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [formData, setFormData] = useState({
    invoice_id: "",
    amount: "",
    payment_method: "credit_card",
    transaction_reference: "",
    payment_date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments");
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices");
      const data = await response.json();
      if (response.ok) {
        // Only show unpaid or partially paid invoices
        const unpaidInvoices = (data.invoices || []).filter(
          (inv: Invoice) => inv.status !== "paid"
        );
        setInvoices(unpaidInvoices);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: formData.invoice_id,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          transaction_reference: formData.transaction_reference,
          payment_date: formData.payment_date,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        alert("Payment recorded successfully!");
        setShowRecordModal(false);
        setFormData({
          invoice_id: "",
          amount: "",
          payment_method: "credit_card",
          transaction_reference: "",
          payment_date: new Date().toISOString().split('T')[0],
          notes: "",
        });
        fetchPayments();
        fetchInvoices();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Error recording payment");
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });

      // Company Info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Premier Service Management", 20, 35);
      doc.text("100 Business Park Drive, Suite 200", 20, 40);
      doc.text("New York, NY 10001", 20, 45);
      doc.text("Phone: +1-555-0100", 20, 50);

      // Receipt Details
      doc.setFont("helvetica", "bold");
      doc.text("Receipt Date:", 140, 35);
      doc.text("Transaction Ref:", 140, 40);
      doc.text("Invoice Number:", 140, 45);

      doc.setFont("helvetica", "normal");
      doc.text(new Date(payment.payment_date).toLocaleDateString(), 175, 35);
      doc.text(payment.transaction_reference, 175, 40);
      doc.text(payment.invoice?.invoice_number || "N/A", 175, 45);

      // Customer Details
      doc.setFont("helvetica", "bold");
      doc.text("Received From:", 20, 65);
      doc.setFont("helvetica", "normal");
      const customerName = payment.invoice?.job?.booking?.customer?.name || "N/A";
      doc.text(customerName, 20, 70);

      // Payment Details
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details:", 20, 90);
      
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 100, 170, 8, "F");
      doc.text("Description", 25, 105);
      doc.text("Amount", 170, 105);

      doc.setFont("helvetica", "normal");
      doc.text(`Payment for Invoice ${payment.invoice?.invoice_number || "N/A"}`, 25, 115);
      doc.text(`RWF ${payment.amount.toFixed(2)}`, 170, 115);

      // Payment Method
      doc.text("Payment Method:", 25, 125);
      doc.text(payment.payment_method.replace('_', ' ').toUpperCase(), 70, 125);

      // Total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("AMOUNT PAID:", 25, 140);
      doc.text(`RWF ${payment.amount.toFixed(2)}`, 170, 140);

      // Notes
      if (payment.notes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Notes:", 20, 155);
        doc.text(payment.notes, 20, 160);
      }

      // Footer
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for your payment!", 105, 280, { align: "center" });

      // Save PDF
      doc.save(`receipt-${payment.transaction_reference}.pdf`);
      alert("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate receipt:", error);
      alert("Failed to generate receipt");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.invoice?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice?.job?.booking?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange =
      (!dateRange.from || new Date(payment.payment_date) >= new Date(dateRange.from)) &&
      (!dateRange.to || new Date(payment.payment_date) <= new Date(dateRange.to));

    const matchesMethod =
      paymentMethodFilter === "all" || payment.payment_method === paymentMethodFilter;

    return matchesSearch && matchesDateRange && matchesMethod;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthRevenue = payments.filter(p => {
    const date = new Date(p.payment_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + p.amount, 0);

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
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <button
          onClick={() => setShowRecordModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Payments</h3>
          <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">RWF {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">This Month</h3>
          <p className="text-3xl font-bold text-blue-600">
            RWF {thisMonthRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Average Payment</h3>
          <p className="text-3xl font-bold text-purple-600">
            RWF {payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by invoice, transaction, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="From"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="To"
              />
              {(dateRange.from || dateRange.to) && (
                <button
                  onClick={() => setDateRange({ from: "", to: "" })}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Ref</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.invoice?.invoice_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.invoice?.job?.booking?.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">RWF {payment.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentMethodBadge method={payment.payment_method} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {payment.transaction_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
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
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No payments recorded</p>
          <p className="text-gray-400 text-sm mt-2">Payments will appear here once invoices are paid</p>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Invoice *
                </label>
                <select
                  required
                  value={formData.invoice_id}
                  onChange={(e) => {
                    const invoice = invoices.find(inv => inv.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      invoice_id: e.target.value,
                      amount: invoice ? invoice.final_amount.toString() : ""
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">Select an invoice</option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - {invoice.job?.booking?.customer?.name || 'Unknown'} - RWF {invoice.final_amount.toFixed(2)} ({invoice.status})
                    </option>
                  ))}
                </select>
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Reference *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transaction_reference}
                  onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="e.g., CC-TX-20240101-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes about this payment..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transaction Reference</h3>
                  <p className="text-base font-mono text-gray-900 mt-1">{selectedPayment.transaction_reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedPayment.payment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount Paid</h3>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  RWF {selectedPayment.amount.toFixed(2)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <div className="mt-2">
                  <PaymentMethodBadge method={selectedPayment.payment_method} />
                </div>
              </div>

              {/* Invoice Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Invoice Number</h3>
                    <p className="text-base text-gray-900 mt-1">
                      {selectedPayment.invoice?.invoice_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Invoice Amount</h3>
                    <p className="text-base text-gray-900 mt-1">
                      RWF {selectedPayment.invoice?.final_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Job Number</h3>
                    <p className="text-base text-gray-900 mt-1">
                      {selectedPayment.invoice?.job?.job_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Invoice Status</h3>
                    <p className="text-base text-gray-900 mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedPayment.invoice?.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedPayment.invoice?.status?.toUpperCase() || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="text-base text-gray-900 mt-1">
                      {selectedPayment.invoice?.job?.booking?.customer?.name || 'N/A'}
                    </p>
                  </div>
                  {selectedPayment.invoice?.job?.booking?.customer?.email && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="text-base text-gray-900 mt-1">
                        {selectedPayment.invoice.job.booking.customer.email}
                      </p>
                    </div>
                  )}
                  {selectedPayment.invoice?.job?.booking?.customer?.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="text-base text-gray-900 mt-1">
                        {selectedPayment.invoice.job.booking.customer.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="text-base text-gray-900 mt-1">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentMethodBadge({ method }: { method: string }) {
  const config: Record<string, { color: string }> = {
    credit_card: { color: "bg-blue-100 text-blue-800" },
    cash: { color: "bg-green-100 text-green-800" },
    bank_transfer: { color: "bg-purple-100 text-purple-800" },
    check: { color: "bg-gray-100 text-gray-800" },
  };

  const { color } = config[method] || config.credit_card;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      <CreditCard className="w-3 h-3" />
      {method?.replace('_', ' ').toUpperCase() || 'N/A'}
    </span>
  );
}
