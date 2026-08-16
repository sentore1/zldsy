"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, CheckCircle, XCircle, Calendar, User, X, FileText,
  ChevronLeft, ChevronRight, List, CalendarDays,
} from "lucide-react";

interface Booking {
  id: string;
  booking_date: string;
  preferred_date: string;
  status: string;
  notes: string | null;
  customer: { id: string; name: string; phone: string; email: string };
  service: { id: string; name: string };
}

interface Service { id: string; name: string; base_price: number }
interface Customer { id: string; name: string; email: string; phone: string }

// Calendar types
interface CalendarDay {
  date: string;
  count: number;
  fully_booked: boolean;
  bookings: {
    id: string;
    preferred_date: string;
    status: string;
    customer?: { id: string; name: string; phone: string };
    service?: { id: string; name: string };
  }[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // View toggle
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1); // 1-based
  const [calData, setCalData] = useState<CalendarDay[]>([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calCapacity, setCalCapacity] = useState(5);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [formData, setFormData] = useState({
    customer_id: "", service_id: "", preferred_date: "", notes: "",
  });
  const [newCustomerData, setNewCustomerData] = useState({
    name: "", email: "", phone: "", address: "",
  });

  useEffect(() => { fetchBookings(); fetchServices(); fetchCustomers(); }, []);

  const fetchCalendar = useCallback(async (year: number, month: number) => {
    setCalLoading(true);
    try {
      const res = await fetch(`/api/bookings/calendar?year=${year}&month=${month}&capacity=${calCapacity}`);
      const data = await res.json();
      if (res.ok) setCalData(data.days || []);
    } catch (err) {
      console.error("Failed to fetch calendar:", err);
    } finally {
      setCalLoading(false);
    }
  }, [calCapacity]);

  useEffect(() => {
    if (viewMode === "calendar") fetchCalendar(calYear, calMonth);
  }, [viewMode, calYear, calMonth, fetchCalendar]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (err) { console.error("Failed to fetch bookings:", err); }
    finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?active=true");
      const data = await res.json();
      if (res.ok) setServices(data.services || []);
    } catch (err) { console.error("Failed to fetch services:", err); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || []);
    } catch (err) { console.error("Failed to fetch customers:", err); }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchBookings();
        if (viewMode === "calendar") fetchCalendar(calYear, calMonth);
        setShowCreateModal(false);
        resetForm();
        alert("Booking created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create booking");
      }
    } catch (err) { alert("Failed to create booking"); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchBookings();
        if (viewMode === "calendar") fetchCalendar(calYear, calMonth);
        alert("Status updated successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update booking");
      }
    } catch (err) { alert("Failed to update booking"); }
  };

  const handleGenerateQuotation = async (bookingId: string) => {
    if (!confirm("Generate quotation for this booking?")) return;
    try {
      const res = await fetch("/api/quotations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Quotation generated!\nQuotation #${data.quotation.quotation_number}\nAmount: RWF ${data.quotation.final_amount.toFixed(2)}`);
        await fetchBookings();
      } else {
        alert(data.error || "Failed to generate quotation");
      }
    } catch (err) { alert("Failed to generate quotation"); }
  };

  const resetForm = () => setFormData({ customer_id: "", service_id: "", preferred_date: "", notes: "" });
  const resetCustomerForm = () => setNewCustomerData({ name: "", email: "", phone: "", address: "" });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomerData),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchCustomers();
        setFormData({ ...formData, customer_id: data.customer.id });
        setShowAddCustomerModal(false);
        resetCustomerForm();
        alert("Customer added successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add customer");
      }
    } catch (err) { alert("Failed to add customer"); }
  };

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(calYear - 1); setCalMonth(12); }
    else setCalMonth(calMonth - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(calYear + 1); setCalMonth(1); }
    else setCalMonth(calMonth + 1);
    setSelectedDay(null);
  };

  // Build the grid: 6 rows × 7 columns for the calendar
  const buildCalendarGrid = () => {
    const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();

    // Map date strings to CalendarDay data
    const dayMap: Record<string, CalendarDay> = {};
    for (const d of calData) dayMap[d.date] = d;

    const cells: (null | { day: number; date: string; data?: CalendarDay })[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date: dateStr, data: dayMap[dateStr] });
    }

    return cells;
  };

  const calCells = buildCalendarGrid();
  const todayStr = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch =
      b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.service.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusCount = (status: string) => bookings.filter((b) => b.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === "list" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === "calendar" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </button>
          </div>

          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={bookings.length} color="text-gray-900" />
        <StatCard label="Pending" value={getStatusCount("pending")} color="text-yellow-600" />
        <StatCard label="Confirmed" value={getStatusCount("confirmed")} color="text-green-600" />
        <StatCard label="Cancelled" value={getStatusCount("cancelled")} color="text-red-600" />
      </div>

      {/* ── CALENDAR VIEW ── */}
      {viewMode === "calendar" && (
        <div className="space-y-4">
          {/* Calendar controls */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 min-w-[180px] text-center">
                {MONTHS[calMonth - 1]} {calYear}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Daily capacity setting */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Daily capacity:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={calCapacity}
                  onChange={(e) => setCalCapacity(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                />
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-teal-100 border border-teal-300 inline-block" />
                  Has bookings
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-400 inline-block" />
                  Fully booked
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-indigo-100 border border-indigo-400 inline-block" />
                  Today
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Calendar grid */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              {calLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : (
                <>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {DAYS.map((d) => (
                      <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Grid cells */}
                  <div className="grid grid-cols-7">
                    {calCells.map((cell, idx) => {
                      if (!cell) {
                        return <div key={`empty-${idx}`} className="h-16 sm:h-20 border-b border-r border-gray-100 bg-gray-50/50" />;
                      }

                      const isToday = cell.date === todayStr;
                      const isSelected = selectedDay?.date === cell.date;
                      const hasBookings = cell.data && cell.data.count > 0;
                      const isFullyBooked = cell.data?.fully_booked;

                      return (
                        <button
                          key={cell.date}
                          onClick={() => setSelectedDay(isSelected ? null : (cell.data ?? { date: cell.date, count: 0, fully_booked: false, bookings: [] }))}
                          className={`h-16 sm:h-20 border-b border-r border-gray-100 p-1.5 text-left flex flex-col transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                            isSelected ? "ring-2 ring-indigo-500 ring-inset z-10 relative" : ""
                          } ${
                            isFullyBooked ? "bg-red-50" : hasBookings ? "bg-teal-50" : ""
                          }`}
                        >
                          <span
                            className={`text-sm font-semibold w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              isToday
                                ? "bg-indigo-600 text-white"
                                : isFullyBooked
                                ? "text-red-700"
                                : hasBookings
                                ? "text-teal-800"
                                : "text-gray-700"
                            }`}
                          >
                            {cell.day}
                          </span>
                          {cell.data && cell.data.count > 0 && (
                            <span
                              className={`mt-auto text-xs font-semibold px-1.5 py-0.5 rounded-full self-start ${
                                isFullyBooked
                                  ? "bg-red-100 text-red-700"
                                  : "bg-teal-100 text-teal-800"
                              }`}
                            >
                              {cell.data.count} {cell.data.count === 1 ? "booking" : "bookings"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Day detail panel */}
            <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
              {selectedDay ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {new Date(selectedDay.date + "T00:00:00").toLocaleDateString(undefined, {
                          weekday: "long", month: "long", day: "numeric",
                        })}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedDay.count} booking{selectedDay.count !== 1 ? "s" : ""}
                        {selectedDay.fully_booked && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Fully Booked
                          </span>
                        )}
                      </p>
                    </div>
                    <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedDay.bookings.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-400 text-sm text-center">No bookings on this day.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                      {selectedDay.bookings.map((b) => (
                        <div key={b.id} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{b.customer?.name || "—"}</p>
                              <p className="text-xs text-gray-500">{b.customer?.phone || ""}</p>
                            </div>
                            <BookingStatusPill status={b.status} />
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5">
                            <span className="font-medium">Service:</span> {b.service?.name || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <CalendarDays className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-400 text-sm">Click a day on the calendar to see its bookings.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "confirmed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition capitalize ${
                      filterStatus === s
                        ? s === "all" ? "bg-indigo-600 text-white"
                          : s === "pending" ? "bg-yellow-600 text-white"
                          : s === "confirmed" ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Customer", "Service", "Booking Date", "Preferred Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.customer.name}</div>
                            <div className="text-xs text-gray-500">{booking.customer.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.service.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{new Date(booking.preferred_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleGenerateQuotation(booking.id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Generate Quotation"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => handleGenerateQuotation(booking.id)}
                              className="px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Generate Quote
                            </button>
                          )}
                          {booking.status === "cancelled" && (
                            <span className="text-xs text-gray-500">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No bookings found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Create Booking</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
                <div className="flex gap-2">
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    title="Add New Customer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - RWF {s.base_price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Any special requirements..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Add New Customer</h2>
              <button onClick={() => { setShowAddCustomerModal(false); resetCustomerForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Customer address (optional)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddCustomerModal(false); resetCustomerForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small helper components ─────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-gray-500 text-sm font-semibold mb-1">{label}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  };
  const c = config[status] ?? config.pending;
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.color}`}>{c.label}</span>;
}

function BookingStatusPill({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending:     { label: "Pending",     color: "bg-yellow-100 text-yellow-700" },
    confirmed:   { label: "Confirmed",   color: "bg-green-100 text-green-700" },
    cancelled:   { label: "Cancelled",   color: "bg-red-100 text-red-700" },
    scheduled:   { label: "Scheduled",   color: "bg-blue-100 text-blue-700" },
    in_progress: { label: "In Progress", color: "bg-teal-100 text-teal-700" },
    completed:   { label: "Completed",   color: "bg-emerald-100 text-emerald-700" },
  };
  const c = config[status] ?? config.pending;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${c.color}`}>{c.label}</span>;
}
