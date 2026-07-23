"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Clock, FileText, DollarSign, Calendar, User, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

interface Quotation {
  id: string;
  booking_id: string;
  total_amount: number;
  tax_amount: number;
  subtotal: number;
  valid_until: string;
  status: string;
  notes: string;
  qr_code: string;
  created_at: string;
  booking: {
    id: string;
    preferred_date: string;
    notes: string;
    status: string;
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
}

export default function QuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quotation");
      }
      const data = await response.json();
      setQuotation(data.quotation);
    } catch (err: any) {
      setError(err.message || "Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm("Are you sure you want to accept this quotation? This will create a service job.")) {
      return;
    }

    try {
      setAccepting(true);
      const response = await fetch(`/api/quotations/${quotationId}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept quotation");
      }

      const data = await response.json();
      
      alert("Quotation accepted successfully! A job has been created and our team will contact you shortly.");
      
      // Redirect to job tracking
      router.push(`/customer/track?booking=${quotation?.booking_id}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quotation Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The quotation you're looking for doesn't exist or has been removed."}
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

  const isExpired = new Date(quotation.valid_until) < new Date();
  const isAccepted = quotation.status === "accepted";
  const canAccept = quotation.status === "pending" && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Service Quotation
              </h1>
              <p className="text-gray-600">
                Quotation ID: <span className="font-mono">{quotation.id.slice(0, 8)}</span>
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isAccepted
                    ? "bg-green-100 text-green-800"
                    : isExpired
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isAccepted ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Accepted
                  </>
                ) : isExpired ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Expired
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

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created:</p>
              <p className="font-semibold">
                {new Date(quotation.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Valid Until:</p>
              <p className={`font-semibold ${isExpired ? "text-red-600" : ""}`}>
                {new Date(quotation.valid_until).toLocaleDateString()}
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
              <p className="text-lg font-semibold">{quotation.booking.service.name}</p>
              <p className="text-sm text-gray-600">{quotation.booking.service.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold">{quotation.booking.service.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Date</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  {new Date(quotation.booking.preferred_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            {quotation.booking.notes && (
              <div>
                <p className="text-sm text-gray-600">Special Instructions</p>
                <p className="text-gray-900">{quotation.booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            Customer Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{quotation.booking.customer.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{quotation.booking.customer.phone}</p>
              </div>
            </div>
            {quotation.booking.customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{quotation.booking.customer.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold">{quotation.booking.customer.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            Pricing Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">RWF {quotation.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-semibold">RWF {quotation.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 bg-teal-50 px-4 rounded-lg">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-teal-600">
                RWF {quotation.total_amount.toLocaleString()}
              </span>
            </div>
          </div>

          {quotation.notes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">Additional Notes:</p>
              <p className="text-sm text-blue-800">{quotation.notes}</p>
            </div>
          )}
        </div>

        {/* QR Code */}
        {quotation.qr_code && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quotation QR Code
            </h3>
            <img
              src={quotation.qr_code}
              alt="Quotation QR Code"
              className="mx-auto w-48 h-48"
            />
            <p className="text-sm text-gray-600 mt-2">
              Scan this code to view quotation details
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {canAccept ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-900 mb-2">Ready to Accept?</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>✓ Job will be created and assigned to our team</li>
                  <li>✓ You'll receive updates via SMS/Email</li>
                  <li>✓ Our team will contact you to confirm the schedule</li>
                  <li>✓ Invoice will be generated after job completion</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex-1 px-6 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Accept Quotation
                    </>
                  )}
                </button>
                <Link
                  href="/"
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Decline
                </Link>
              </div>
            </div>
          ) : isAccepted ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Quotation Accepted!
              </h3>
              <p className="text-gray-600 mb-6">
                A job has been created and our team will contact you shortly to confirm the schedule.
              </p>
              <Link
                href={`/customer/track?booking=${quotation.booking_id}`}
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
              >
                Track Your Job
              </Link>
            </div>
          ) : isExpired ? (
            <div className="text-center">
              <Clock className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Quotation Expired
              </h3>
              <p className="text-gray-600 mb-6">
                This quotation has expired. Please contact us for a new quotation.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
              >
                Book New Service
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
