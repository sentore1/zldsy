"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, FileText, DollarSign, Calendar, User, MapPin, Phone, Mail, Loader2, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: string;
  job_id: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  due_date: string;
  notes: string;
  qr_code: string;
  created_at: string;
  job: {
    id: string;
    booking_id: string;
    scheduled_date: string;
    completion_date: string;
    status: string;
    service_cost: number;
    materials_cost: number;
    labor_cost: number;
    equipment_cost: number;
    booking: {
      customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
      };
      service: {
        name: string;
        description: string;
        category: string;
      };
    };
  };
}

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }
      const data = await response.json();
      setInvoice(data.invoice);
      setPaymentAmount(data.invoice.balance_due.toString());
    } catch (err: any) {
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (amount > (invoice?.balance_due || 0)) {
      alert("Payment amount cannot exceed balance due");
      return;
    }

    try {
      setPaying(true);
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoiceId,
          amount: amount,
          payment_method: paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      alert("Payment recorded successfully!");
      
      // Refresh invoice data
      fetchInvoice();
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invoice Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The invoice you're looking for doesn't exist."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== "paid";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
              <p className="text-gray-600">
                Invoice ID: <span className="font-mono">{invoice.id.slice(0, 8)}</span>
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isPaid
                    ? "bg-green-100 text-green-800"
                    : isOverdue
                    ? "bg-red-100 text-red-800"
                    : invoice.amount_paid > 0
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isPaid ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Paid
                  </>
                ) : isOverdue ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Overdue
                  </>
                ) : invoice.amount_paid > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Partially Paid
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Pending
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Issue Date:</p>
              <p className="font-semibold">
                {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Due Date:</p>
              <p className={`font-semibold ${isOverdue ? "text-red-600" : ""}`}>
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Job Completed:</p>
              <p className="font-semibold">
                {invoice.job.completion_date 
                  ? new Date(invoice.job.completion_date).toLocaleDateString()
                  : "In Progress"}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Service Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Service</p>
              <p className="text-lg font-semibold">{invoice.job.booking.service.name}</p>
              <p className="text-sm text-gray-600">{invoice.job.booking.service.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold">{invoice.job.booking.service.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Date</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  {new Date(invoice.job.scheduled_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            Bill To
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{invoice.job.booking.customer.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{invoice.job.booking.customer.phone}</p>
              </div>
            </div>
            {invoice.job.booking.customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{invoice.job.booking.customer.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{invoice.job.booking.customer.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            Cost Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Service Cost</span>
              <span className="font-semibold">RWF {invoice.job.service_cost.toLocaleString()}</span>
            </div>
            {invoice.job.materials_cost > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Materials</span>
                <span className="font-semibold">RWF {invoice.job.materials_cost.toLocaleString()}</span>
              </div>
            )}
            {invoice.job.labor_cost > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Labor</span>
                <span className="font-semibold">RWF {invoice.job.labor_cost.toLocaleString()}</span>
              </div>
            )}
            {invoice.job.equipment_cost > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Equipment</span>
                <span className="font-semibold">RWF {invoice.job.equipment_cost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">RWF {invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-semibold">RWF {invoice.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-50 px-4 rounded-lg">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                RWF {invoice.total_amount.toLocaleString()}
              </span>
            </div>
            {invoice.amount_paid > 0 && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    -RWF {invoice.amount_paid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-teal-50 px-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-900">Balance Due</span>
                  <span className="text-2xl font-bold text-teal-600">
                    RWF {invoice.balance_due.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {invoice.notes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">Notes:</p>
              <p className="text-sm text-blue-800">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* QR Code */}
        {invoice.qr_code && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invoice QR Code
            </h3>
            <img
              src={invoice.qr_code}
              alt="Invoice QR Code"
              className="mx-auto w-48 h-48"
            />
            <p className="text-sm text-gray-600 mt-2">
              Scan this code for payment or to view invoice
            </p>
          </div>
        )}

        {/* Payment Section */}
        {!isPaid && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Make Payment
            </h2>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "cash", label: "Cash", icon: Banknote },
                    { value: "card", label: "Card", icon: CreditCard },
                    { value: "bank_transfer", label: "Bank Transfer", icon: DollarSign },
                    { value: "mobile_money", label: "Mobile Money", icon: Phone },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition ${
                        paymentMethod === method.value
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <method.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (RWF)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={invoice.balance_due}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Balance due: RWF {invoice.balance_due.toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full px-6 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Payment
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is for recording manual payments. For online payment integration,
                please contact our team or use the payment gateway options when available.
              </p>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Invoice Paid in Full
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for your payment! A receipt has been sent to your email.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
