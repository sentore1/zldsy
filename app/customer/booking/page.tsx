"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Calendar, User, Phone, Mail, MapPin, Loader2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  unit: string;
  category: string;
  is_active: boolean;
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    service: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    notes: "",
    photos: [] as File[],
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    // Pre-select service if provided in URL
    if (serviceIdFromUrl && services.length > 0) {
      const serviceExists = services.find(s => s.id === serviceIdFromUrl);
      if (serviceExists) {
        setFormData(prev => ({ ...prev, service: serviceIdFromUrl }));
      }
    }
  }, [serviceIdFromUrl, services]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        const servicesArray = data.services || [];
        setServices(servicesArray.filter((s: Service) => s.is_active));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        photos: Array.from(e.target.files),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit booking
      try {
        setLoading(true);
        
        // Upload photos first if any
        let photoUrls: string[] = [];
        if (formData.photos.length > 0) {
          const uploadFormData = new FormData();
          formData.photos.forEach(photo => {
            uploadFormData.append('files', photo);
          });
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            photoUrls = uploadData.urls || [];
          }
        }
        
        // Create booking
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: formData.service,
            preferred_date: formData.preferredDate,
            notes: formData.notes,
            customer_info: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
            },
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create booking');
        }
        
        const data = await response.json();
        
        // Success - show message and redirect
        alert(
          "Booking submitted successfully! You will receive a quotation shortly via email/SMS."
        );
        
        // Redirect to tracking page
        window.location.href = `/customer/track?booking=${data.booking.id}`;
      } catch (error: any) {
        console.error('Booking error:', error);
        alert(`Failed to submit booking: ${error.message}. Please try again.`);
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Book a Service
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <StepIndicator
            number={1}
            title="Service & Details"
            active={step >= 1}
            completed={step > 1}
          />
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className={`h-full transition-all`}
              style={{ backgroundColor: step > 1 ? '#28A8AC' : '#E5E7EB' }}
            />
          </div>
          <StepIndicator
            number={2}
            title="Upload Photos"
            active={step >= 2}
            completed={step > 2}
          />
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className={`h-full transition-all`}
              style={{ backgroundColor: step > 2 ? '#28A8AC' : '#E5E7EB' }}
            />
          </div>
          <StepIndicator
            number={3}
            title="Review & Confirm"
            active={step >= 3}
            completed={false}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Service & Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service *
                </label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <select
                    required
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ outlineColor: '#28A8AC' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                  >
                    <option value="">Choose a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - RWF {service.base_price.toLocaleString()} / {service.unit}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ outlineColor: '#28A8AC' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ outlineColor: '#28A8AC' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: '#28A8AC' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Service Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: '#28A8AC' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  rows={3}
                  placeholder="Enter complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: '#28A8AC' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: '#28A8AC' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #28A8AC'}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                  rows={3}
                  placeholder="Any special requirements or instructions"
                />
              </div>
            </div>
          )}

          {/* Step 2: Upload Photos */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: '#28A8AC' }} />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Photos (Optional)
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload photos of the area/items that need service. This helps
                  us provide accurate quotations.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition hover:border-[#28A8AC]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG up to 10MB each
                  </p>
                </label>
              </div>

              {formData.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Uploaded Photos ({formData.photos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 rounded-lg p-4 text-center"
                      >
                        <p className="text-sm text-gray-700 truncate">
                          {photo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(photo.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                  style={{ backgroundColor: '#28A8AC' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#239095'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28A8AC'}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Review Your Booking
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-semibold">
                        {services.find((s) => s.id === formData.service)?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preferred Date</p>
                      <p className="font-semibold">{formData.preferredDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-semibold">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{formData.phone}</p>
                    </div>
                    {formData.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{formData.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold">{formData.address}</p>
                    </div>
                  </div>

                  {formData.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-semibold">{formData.notes}</p>
                    </div>
                  )}

                  {formData.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Photos Uploaded</p>
                      <p className="font-semibold">
                        {formData.photos.length} file(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✓ You'll receive an automatic quotation via email/SMS</li>
                  <li>✓ Review and accept the terms & conditions</li>
                  <li>✓ Track your service progress in real-time</li>
                  <li>✓ Receive invoice after service completion</li>
                  <li>✓ Make payment and leave feedback</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                  style={{ backgroundColor: '#28A8AC' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#239095'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28A8AC'}
                >
                  Submit Booking
                </button>
              </div>
            </div>
          )}

          {/* Navigation for Step 1 */}
          {step === 1 && (
            <div className="mt-8">
              <button
                type="submit"
                className="w-full px-6 py-3 text-white rounded-lg transition font-medium"
                style={{ backgroundColor: '#28A8AC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#239095'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28A8AC'}
              >
                Continue to Upload Photos
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  title,
  active,
  completed,
}: {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
          completed || active
            ? "text-white"
            : "bg-gray-200 text-gray-600"
        }`}
        style={completed || active ? { backgroundColor: '#28A8AC' } : {}}
      >
        {completed ? "✓" : number}
      </div>
      <span
        className={`text-sm mt-2 ${
          active ? "text-gray-900 font-medium" : "text-gray-500"
        }`}
      >
        {title}
      </span>
    </div>
  );
}
