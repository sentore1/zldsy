"use client";

import { useState } from "react";
import {
  Search, CheckCircle, Clock, MapPin, Star, ExternalLink,
  MessageSquare, ThumbsUp, AlertCircle, Loader2, Phone, Hash,
} from "lucide-react";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=zld+hub+cleaning+services&sca_esv=77e44e7688afd311&sxsrf=APpeQnstBb5KmhV8SpB2moc3oKvqGp2uRw%3A1786893135224&ei=T9OBapyHDZz_7_UP2LLzuQQ&biw=1366&bih=607&oq=zld+hub+cleaning+servoce&gs_lp=Egxnd3Mtd2l6LXNlcnAiGHpsZCBodWIgY2xlYW5pbmcgc2Vydm9jZSoCCAAyBBAhGBUyBRAhGJIDMgUQIRiSAzIFECEYkgMyBRAhGJIDMgUQIRiSAzIFECEYkgNIo0hQ5gNY1DBwAXgAkAEAmAGKBKAB-zWqAQoyLTIuMTIuNC4xuAEByAEA-AEBmAISoAKkMcICCxAAGIAEGKIEGLADwgIIEAAYgAQYogTCAggQABiJBRiiBMICBRAhGKABwgIFEAAY7wXCAgcQIRgKGKABmAMAiAYBkAYEkgcKMS4wLjIuMTEuNKAHzyuyBwgyLTIuMTEuNLgHnDHCBwgwLjQuMTMuMcgHV4AIAQ&sclient=gws-wiz-serp#lrd=0x19dca589476ae027:0x50f61abdae096d0,3,,,,";

interface TrackingBooking {
  id: string;
  booking_number?: string;
  preferred_date: string;
  booking_date: string;
  status: string;
  notes?: string;
  service?: { id: string; name: string; description?: string; base_price?: number };
}

interface TrackingResult {
  lookup_type: "phone" | "booking_id";
  customer: { name: string; phone: string; email?: string; address?: string } | null;
  bookings: TrackingBooking[];
}

const STATUS_ORDER = ["pending","confirmed","scheduled","in_progress","completed","invoiced","paid"];

function buildTimeline(booking: TrackingBooking) {
  const steps = [
    { key: "pending",     label: "Booking Received",    date: booking.booking_date },
    { key: "confirmed",   label: "Booking Confirmed",   date: null },
    { key: "scheduled",   label: "Service Scheduled",   date: booking.preferred_date },
    { key: "in_progress", label: "Service In Progress", date: null },
    { key: "completed",   label: "Service Completed",   date: null },
    { key: "invoiced",    label: "Invoice Sent",        date: null },
    { key: "paid",        label: "Payment Received",    date: null },
  ];
  const currentIndex = STATUS_ORDER.indexOf(booking.status);
  return steps.map((step, i) => ({
    label: step.label,
    date: step.date ? new Date(step.date).toLocaleDateString() : i <= currentIndex ? "Done" : "Pending",
    completed: i <= currentIndex,
    current: i === currentIndex,
  }));
}

export default function TrackServicePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const resetFeedback = () => {
    setRating(0); setHoverRating(0); setFeedbackText("");
    setFeedbackSubmitted(false); setFeedbackError("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true); setError(""); setResult(null); setSelectedIndex(0); resetFeedback();
    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch tracking info");
      if (!data.customer && (!data.bookings || data.bookings.length === 0)) {
        setError("No records found. Please check your booking ID or phone number and try again.");
        return;
      }
      setResult(data as TrackingResult);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setFeedbackError("Please select a star rating before submitting."); return; }
    if (!result || !activeBooking) return;
    setFeedbackSubmitting(true); setFeedbackError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_number: activeBooking.booking_number || activeBooking.id,
          service: activeBooking.service?.name || "",
          customer_name: result.customer?.name || "",
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

  const activeBooking = result?.bookings[selectedIndex] ?? null;
  const timeline = activeBooking ? buildTimeline(activeBooking) : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Track Your Service</h1>
        <p className="text-gray-500 mb-8 text-sm">Enter your phone number or booking ID to see your service status.</p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 pointer-events-none">
                <Phone className="w-4 h-4" />
                <span className="text-gray-300 text-xs mx-0.5">|</span>
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Phone number or booking ID (e.g. BOOK-12345)"
                className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#28A8AC" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#09ACAD"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#28A8AC"; }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span className="hidden sm:inline">Track</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Enter the phone number you used when booking, or your booking ID (e.g. BOOK-12345).
          </p>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && activeBooking && (
          <div className="space-y-6">

            {/* Customer banner */}
            {result.customer && (
              <div className="flex items-center gap-4 bg-teal-50 border border-teal-100 rounded-xl p-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: "#28A8AC" }}
                >
                  {result.customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{result.customer.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {result.customer.phone}
                    {result.customer.email && <> &middot; {result.customer.email}</>}
                  </p>
                </div>
                <div className="ml-auto shrink-0 text-right">
                  <p className="text-xs text-gray-400">
                    {result.bookings.length} booking{result.bookings.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Booking selector (multiple bookings) */}
            {result.bookings.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Select a booking:</p>
                <div className="flex flex-wrap gap-2">
                  {result.bookings.map((b, i) => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedIndex(i); resetFeedback(); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                        i === selectedIndex ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      style={i === selectedIndex ? { backgroundColor: "#28A8AC", borderColor: "#28A8AC" } : undefined}
                    >
                      {b.booking_number || `Booking ${i + 1}`} &middot; {new Date(b.preferred_date).toLocaleDateString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking header card */}
            <div
              className="rounded-xl shadow-lg p-6 text-white"
              style={{ backgroundImage: "linear-gradient(to right, #28A8AC, #09ACAD)" }}
            >
              <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Booking ID</p>
                  <h2 className="text-xl font-bold">{activeBooking.booking_number || activeBooking.id}</h2>
                </div>
                <StatusBadge status={activeBooking.status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wide">Service</p>
                  <p className="font-semibold mt-0.5">{activeBooking.service?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wide">Preferred Date</p>
                  <p className="font-semibold mt-0.5">{new Date(activeBooking.preferred_date).toLocaleDateString()}</p>
                </div>
                {result.customer && (
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wide">Customer</p>
                    <p className="font-semibold mt-0.5">{result.customer.name}</p>
                  </div>
                )}
              </div>
              {activeBooking.notes && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-white/90">{activeBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Service Progress</h3>
              <div className="relative">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-6 relative">
                    {index < timeline.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200">
                        {item.completed && <div className="w-full h-full" style={{ backgroundColor: "#28A8AC" }} />}
                      </div>
                    )}
                    <div className="relative z-10 shrink-0">
                      {item.completed ? (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#28A8AC", ...(item.current && { boxShadow: "0 0 0 4px rgba(40,168,172,0.2)" }) }}
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-semibold text-sm ${item.completed ? "text-gray-900" : "text-gray-400"}`}>{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                      {item.current && <p className="text-xs font-semibold mt-1" style={{ color: "#28A8AC" }}>Current Status</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {result.customer?.address && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: "#28A8AC" }} />
                  Service Address
                </h4>
                <p className="text-gray-700 text-sm">{result.customer.address}</p>
              </div>
            )}

            {/* Feedback */}
            <div className="rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 md:p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#28A8AC" }}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Feedback Matters</h3>
              </div>
              <p className="text-gray-500 text-sm mb-6">Let us know how your experience was. Your review helps us serve you better.</p>

              {feedbackSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e6f7f7" }}>
                    <ThumbsUp className="w-8 h-8" style={{ color: "#28A8AC" }} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Thank you for your feedback!</h4>
                  <p className="text-gray-500 text-sm mb-6">We appreciate you taking the time to share your experience.</p>
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
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rate Your Experience</label>
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
                              color: star <= (hoverRating || rating) ? "#FBBF24" : "#D1D5DB",
                              fill: star <= (hoverRating || rating) ? "#FBBF24" : "transparent",
                              transition: "color 0.15s, fill 0.15s",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-gray-500 mt-1">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback-text" className="block text-sm font-semibold text-gray-700 mb-2">
                      Share Your Experience <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="feedback-text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what you liked or what we could improve…"
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{feedbackText.length}/1000</p>
                  </div>

                  {feedbackError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{feedbackError}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={feedbackSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#28A8AC" }}
                      onMouseEnter={(e) => { if (!feedbackSubmitting) e.currentTarget.style.backgroundColor = "#09ACAD"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#28A8AC"; }}
                    >
                      {feedbackSubmitting
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</>
                        : <><MessageSquare className="w-4 h-4" />Submit Feedback</>
                      }
                    </button>
                    <a
                      href={GOOGLE_REVIEW_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition hover:bg-yellow-50"
                      style={{ borderColor: "#FBBF24", color: "#92400E" }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Add a Google Review
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    Satisfied with our service? A Google review takes less than a minute and helps others find us.
                  </p>
                </form>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                style={{ backgroundColor: "#28A8AC" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#09ACAD")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28A8AC")}
              >
                Contact Support
              </button>
              <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Download Quotation
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">Track Your Service</h3>
            <p className="text-gray-400 text-sm">Enter your booking ID or phone number above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending:     { label: "Pending",     color: "bg-yellow-500" },
    confirmed:   { label: "Confirmed",   color: "bg-blue-500" },
    scheduled:   { label: "Scheduled",   color: "bg-indigo-500" },
    in_progress: { label: "In Progress", color: "bg-teal-500" },
    completed:   { label: "Completed",   color: "bg-green-500" },
    invoiced:    { label: "Invoiced",    color: "bg-purple-500" },
    paid:        { label: "Paid",        color: "bg-emerald-600" },
    cancelled:   { label: "Cancelled",   color: "bg-red-500" },
  };
  const c = config[status] ?? config.pending;
  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white shrink-0 ${c.color}`}>{c.label}</span>
  );
}
