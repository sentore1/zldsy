"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

// ── Update this URL to your actual Google Maps business listing ──────────────
const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=ZldHub+Service";
// ─────────────────────────────────────────────────────────────────────────────

export default function TrackServicePage() {
  const [bookingId, setBookingId] = useState("");
  const [tracking, setTracking] = useState<any>(null);

  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock tracking data — replace with real API call when ready
    setTracking({
      bookingNumber: "BOOK-12345",
      service: "Cleaning Service",
      status: "in_progress",
      customer: "John Doe",
      scheduledDate: "2024-01-15",
      address: "123 Main St, City",
      quotation: {
        number: "QUO-12345",
        amount: 150,
        status: "accepted",
      },
      timeline: [
        { status: "Booking Received", date: "2024-01-10", completed: true },
        { status: "Quotation Sent", date: "2024-01-10", completed: true },
        { status: "Terms Accepted", date: "2024-01-11", completed: true },
        { status: "Service Scheduled", date: "2024-01-12", completed: true },
        {
          status: "Service In Progress",
          date: "2024-01-15",
          completed: true,
          current: true,
        },
        { status: "Service Completed", date: "Pending", completed: false },
        { status: "Invoice Sent", date: "Pending", completed: false },
        { status: "Payment Received", date: "Pending", completed: false },
      ],
      assignedStaff: [
        { name: "Mike Johnson", role: "Lead Technician" },
        { name: "Sarah Williams", role: "Assistant" },
      ],
    });

    // Reset feedback when a new search is done
    setRating(0);
    setHoverRating(0);
    setFeedbackText("");
    setFeedbackSubmitted(false);
    setFeedbackError("");
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setFeedbackError("Please select a star rating before submitting.");
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_number: tracking.bookingNumber,
          service: tracking.service,
          customer_name: tracking.customer,
          rating,
          feedback: feedbackText.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit feedback");
      }

      setFeedbackSubmitted(true);
    } catch (err: any) {
      setFeedbackError(err.message || "Something went wrong. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Track Your Service
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter your booking number or phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 text-white rounded-lg transition font-medium flex items-center gap-2"
              style={{ backgroundColor: "#28A8AC" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#09ACAD")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#28A8AC")
              }
            >
              <Search className="w-5 h-5" />
              Track
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enter your booking number (e.g., BOOK-12345) or the phone number
            you used for booking
          </p>
        </form>

        {/* Tracking Results */}
        {tracking && (
          <div className="space-y-8">
            {/* Service Info Card */}
            <div
              className="rounded-xl shadow-lg p-6 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #28A8AC, #09ACAD)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Booking Number</p>
                  <h2 className="text-2xl font-bold">
                    {tracking.bookingNumber}
                  </h2>
                </div>
                <StatusBadge status={tracking.status} />
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-white/80 text-sm">Service</p>
                  <p className="font-semibold">{tracking.service}</p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Scheduled Date</p>
                  <p className="font-semibold">{tracking.scheduledDate}</p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Customer</p>
                  <p className="font-semibold">{tracking.customer}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Service Progress
              </h3>
              <div className="relative">
                {tracking.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-8 relative">
                    {/* Timeline Line */}
                    {index < tracking.timeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200">
                        {item.completed && (
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: "#28A8AC" }}
                          />
                        )}
                      </div>
                    )}

                    {/* Timeline Icon */}
                    <div className="relative z-10">
                      {item.completed ? (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: "#28A8AC",
                            ...(item.current && {
                              boxShadow:
                                "0 0 0 4px rgba(40, 168, 172, 0.2)",
                            }),
                          }}
                        >
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div className="flex-1 pt-2">
                      <h4
                        className={`font-semibold ${
                          item.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {item.status}
                      </h4>
                      <p className="text-sm text-gray-600">{item.date}</p>
                      {item.current && (
                        <p
                          className="text-sm font-medium mt-1"
                          style={{ color: "#28A8AC" }}
                        >
                          Current Status
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quotation Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Quotation Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quotation Number</span>
                    <span className="font-semibold">
                      {tracking.quotation.number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-green-600">
                      RWF {tracking.quotation.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {tracking.quotation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Staff */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Assigned Team
                </h4>
                <div className="space-y-3">
                  {tracking.assignedStaff.map((staff: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: "#28A8AC" }}
                      >
                        {staff.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {staff.name}
                        </p>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Location */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: "#28A8AC" }} />
                Service Location
              </h4>
              <p className="text-gray-700">{tracking.address}</p>
            </div>

            {/* ── Review & Feedback Section ─────────────────────────────────── */}
            <div className="rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white p-8">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#28A8AC" }}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Your Feedback Matters
                </h3>
              </div>
              <p className="text-gray-500 text-sm mb-8 ml-13">
                Let us know how your experience was. Your review helps us serve
                you better.
              </p>

              {feedbackSubmitted ? (
                /* ── Thank-you state ── */
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "#e6f7f7" }}
                  >
                    <ThumbsUp
                      className="w-8 h-8"
                      style={{ color: "#28A8AC" }}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Thank you for your feedback!
                  </h4>
                  <p className="text-gray-500 text-sm mb-6">
                    We really appreciate you taking the time to share your
                    experience.
                  </p>

                  {/* Google Review CTA — always visible after submit */}
                  <a
                    href={GOOGLE_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transition hover:scale-105"
                    style={{ backgroundColor: "#28A8AC" }}
                  >
                    <Star className="w-5 h-5 fill-white" />
                    Leave a Google Review
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                /* ── Feedback form ── */
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Rate Your Experience
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Rate ${star} out of 5 stars`}
                          className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                        >
                          <Star
                            className="w-9 h-9"
                            style={{
                              color:
                                star <= (hoverRating || rating)
                                  ? "#FBBF24"
                                  : "#D1D5DB",
                              fill:
                                star <= (hoverRating || rating)
                                  ? "#FBBF24"
                                  : "transparent",
                              transition: "color 0.15s, fill 0.15s",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {
                          [
                            "",
                            "Poor",
                            "Fair",
                            "Good",
                            "Very Good",
                            "Excellent",
                          ][rating]
                        }
                      </p>
                    )}
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <label
                      htmlFor="feedback-text"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Share Your Experience{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="feedback-text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what you liked, what we could improve, or anything else about your service experience…"
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {feedbackText.length}/1000
                    </p>
                  </div>

                  {/* Error */}
                  {feedbackError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                      {feedbackError}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {/* Submit Feedback */}
                    <button
                      type="submit"
                      disabled={feedbackSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#28A8AC" }}
                      onMouseEnter={(e) => {
                        if (!feedbackSubmitting)
                          e.currentTarget.style.backgroundColor = "#09ACAD";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#28A8AC";
                      }}
                    >
                      {feedbackSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Submit Feedback
                        </>
                      )}
                    </button>

                    {/* Google Review */}
                    <a
                      href={GOOGLE_REVIEW_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition hover:bg-yellow-50"
                      style={{
                        borderColor: "#FBBF24",
                        color: "#92400E",
                      }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Add a Google Review
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-xs text-center text-gray-400">
                    Satisfied with our service? A Google review takes less than
                    a minute and helps others find us.
                  </p>
                </form>
              )}
            </div>
            {/* ─────────────────────────────────────────────────────────────── */}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                style={{ backgroundColor: "#28A8AC" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#09ACAD")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#28A8AC")
                }
              >
                Contact Support
              </button>
              <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Download Quotation
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!tracking && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Track Your Service
            </h3>
            <p className="text-gray-500">
              Enter your booking number above to track your service status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-500" },
    scheduled: { label: "Scheduled", color: "bg-blue-500" },
    in_progress: { label: "In Progress", color: "bg-teal-500" },
    completed: { label: "Completed", color: "bg-green-500" },
    cancelled: { label: "Cancelled", color: "bg-red-500" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${config.color}`}
    >
      {config.label}
    </span>
  );
}
