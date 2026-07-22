"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import QRCode from "qrcode";

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
  qr_code?: string | null;
  job?: {
    job_number: string;
    booking?: {
      customer?: {
        name: string;
        email: string;
        phone: string;
        address: string;
      };
      service?: {
        name: string;
        description: string;
      };
    };
  };
}

export default function PublicInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  useEffect(() => {
    if (invoice) {
      generateQRCode();
    }
  }, [invoice]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Invoice not found");
      }
      
      const data = await response.json();
      setInvoice(data.invoice);
    } catch (err: any) {
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const invoiceUrl = `${window.location.origin}/invoice/${params.id}`;
      const qrDataUrl = await QRCode.toDataURL(invoiceUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  const downloadPDF = async () => {
    if (!invoice) return;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 105, 20, { align: "center" });

      // Company Info (you can make this configurable)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Premier Service Management", 20, 35);
      doc.text("100 Business Park Drive, Suite 200", 20, 40);
      doc.text("New York, NY 10001", 20, 45);
      doc.text("Phone: +1-555-0100", 20, 50);

      // Invoice Details
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Number:", 140, 35);
      doc.text("Date:", 140, 40);
      doc.text("Due Date:", 140, 45);
      doc.text("Status:", 140, 50);

      doc.setFont("helvetica", "normal");
      doc.text(invoice.invoice_number, 175, 35);
      doc.text(new Date(invoice.created_at).toLocaleDateString(), 175, 40);
      doc.text(new Date(invoice.due_date).toLocaleDateString(), 175, 45);
      doc.text(invoice.status.toUpperCase(), 175, 50);

      // Customer Details
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 20, 65);
      doc.setFont("helvetica", "normal");
      const customerName = invoice.job?.booking?.customer?.name || "N/A";
      const customerAddress = invoice.job?.booking?.customer?.address || "";
      const customerPhone = invoice.job?.booking?.customer?.phone || "";
      const customerEmail = invoice.job?.booking?.customer?.email || "";

      doc.text(customerName, 20, 70);
      if (customerAddress) doc.text(customerAddress, 20, 75);
      if (customerPhone) doc.text(customerPhone, 20, 80);
      if (customerEmail) doc.text(customerEmail, 20, 85);

      // Service Details
      doc.setFont("helvetica", "bold");
      doc.text("Service Details:", 20, 100);
      doc.setFont("helvetica", "normal");
      const serviceName = invoice.job?.booking?.service?.name || "N/A";
      const jobNumber = invoice.job?.job_number || "N/A";
      doc.text(`Job Number: ${jobNumber}`, 20, 105);
      doc.text(`Service: ${serviceName}`, 20, 110);

      // Table Header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 125, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Description", 25, 130);
      doc.text("Amount", 170, 130);

      // Table Content
      doc.setFont("helvetica", "normal");
      let yPos = 140;

      doc.text("Service Fee", 25, yPos);
      doc.text(`$${invoice.total_amount.toFixed(2)}`, 170, yPos);
      yPos += 7;

      if (invoice.tax && invoice.tax > 0) {
        doc.text("Tax", 25, yPos);
        doc.text(`$${invoice.tax.toFixed(2)}`, 170, yPos);
        yPos += 7;
      }

      if (invoice.discount && invoice.discount > 0) {
        doc.text("Discount", 25, yPos);
        doc.text(`-$${invoice.discount.toFixed(2)}`, 170, yPos);
        yPos += 7;
      }

      // Total Line
      yPos += 5;
      doc.line(20, yPos, 190, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TOTAL:", 25, yPos);
      const finalAmount = invoice.final_amount || invoice.total_amount;
      doc.text(`$${finalAmount.toFixed(2)}`, 170, yPos);

      // Payment Status
      if (invoice.paid_date) {
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 128, 0);
        doc.text(`Paid on: ${new Date(invoice.paid_date).toLocaleDateString()}`, 25, yPos);
        doc.setTextColor(0, 0, 0);
      }

      // QR Code
      if (qrCodeUrl) {
        doc.addImage(qrCodeUrl, "PNG", 160, yPos + 10, 30, 30);
        doc.setFontSize(8);
        doc.text("Scan to view", 165, yPos + 45);
      }

      // Footer
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for your business!", 105, 280, { align: "center" });

      // Save PDF
      doc.save(`${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const copyInvoiceLink = () => {
    const invoiceUrl = `${window.location.origin}/invoice/${params.id}`;
    navigator.clipboard.writeText(invoiceUrl);
    alert("Invoice link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const customerName = invoice.job?.booking?.customer?.name || "N/A";
  const customerEmail = invoice.job?.booking?.customer?.email || "";
  const customerPhone = invoice.job?.booking?.customer?.phone || "";
  const customerAddress = invoice.job?.booking?.customer?.address || "";
  const serviceName = invoice.job?.booking?.service?.name || "N/A";
  const finalAmount = invoice.final_amount || invoice.total_amount;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Invoice Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-indigo-100">{invoice.invoice_number}</p>
              </div>
              <div className="text-right text-white">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Company & Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">From</h3>
                <p className="text-gray-900 font-semibold">Premier Service Management</p>
                <p className="text-gray-600 text-sm">100 Business Park Drive, Suite 200</p>
                <p className="text-gray-600 text-sm">New York, NY 10001</p>
                <p className="text-gray-600 text-sm">+1-555-0100</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                <p className="text-gray-900 font-semibold">{customerName}</p>
                {customerAddress && <p className="text-gray-600 text-sm">{customerAddress}</p>}
                {customerPhone && <p className="text-gray-600 text-sm">{customerPhone}</p>}
                {customerEmail && <p className="text-gray-600 text-sm">{customerEmail}</p>}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b">
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Date</p>
                <p className="text-gray-900 font-medium">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="text-gray-900 font-medium">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Job Number</p>
                <p className="text-gray-900 font-medium">{invoice.job?.job_number || "N/A"}</p>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{serviceName}</p>
                      <p className="text-sm text-gray-500">Service Fee</p>
                    </td>
                    <td className="text-right py-4 text-gray-900">${invoice.total_amount.toFixed(2)}</td>
                  </tr>
                  {invoice.tax && invoice.tax > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="py-4 text-gray-600">Tax</td>
                      <td className="text-right py-4 text-gray-900">${invoice.tax.toFixed(2)}</td>
                    </tr>
                  )}
                  {invoice.discount && invoice.discount > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="py-4 text-gray-600">Discount</td>
                      <td className="text-right py-4 text-green-600">-${invoice.discount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-4 text-lg font-bold text-gray-900">TOTAL</td>
                    <td className="text-right py-4 text-2xl font-bold text-indigo-600">
                      ${finalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Status */}
            {invoice.paid_date && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-900 font-semibold">Payment Received</p>
                  <p className="text-green-700 text-sm">
                    Paid on {new Date(invoice.paid_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <img src={qrCodeUrl} alt="Invoice QR Code" className="mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Scan to view invoice</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={copyInvoiceLink}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Copy Link
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Thank you for your business!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: "Paid", color: "bg-green-500" },
    pending: { label: "Pending", color: "bg-yellow-500" },
    overdue: { label: "Overdue", color: "bg-red-500" },
    cancelled: { label: "Cancelled", color: "bg-gray-500" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white ${config.color}`}>
      {config.label}
    </span>
  );
}
