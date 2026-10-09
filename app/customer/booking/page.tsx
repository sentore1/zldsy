"use client";

import { useState, useEffect, Suspense } from "react";
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
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto"><div className="bg-white rounded-2xl shadow-xl p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></div>}>
      <BookingForm />
    </Suspense>
  );
}

function BookingForm() {
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    service: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    notes: "",
    photos: [] as File[],
    agreedToTerms: false,
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
      // Check terms agreement before submitting
      if (!formData.agreedToTerms) {
        alert('Please agree to the Terms and Conditions to continue');
        return;
      }

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
                    placeholder="+250 7XX XXX XXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use format: +250 7XX XXX XXX for tracking your booking
                  </p>
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

              {/* Terms and Conditions */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-teal-600 font-semibold underline hover:text-teal-700"
                    >
                      Terms and Conditions
                    </button>{" "}
                    *
                  </span>
                </label>
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

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              <TermSection
                title="1. Service Agreement"
                content="By booking our services, you agree to allow our professional staff to access the designated service area at the scheduled time. You are responsible for ensuring safe access to the property."
              />
              
              <TermSection
                title="2. Pricing and Quotations"
                content="All prices are quoted in Rwandan Francs (RWF). Initial quotations are estimates based on the information provided. Final pricing may vary based on actual service requirements, area size, and condition. Any changes will be communicated before service commencement."
              />
              
              <TermSection
                title="3. Payment Terms"
                content={`Payment is due upon service completion unless otherwise agreed. We accept cash and mobile money (MTN Mobile Money, Airtel Money).

Invoices will be provided electronically. Late payments beyond the agreed payment date will incur a penalty of 5% per day until full payment is received.`}
              />
              
              <TermSection
                title="4. Cancellation Policy"
                content={`Cancellation must be made in writing (email, SMS, or through our app):

• More than 48 hours before scheduled service: No charge
• 24-48 hours before scheduled service: 50% cancellation fee will apply
• Less than 24 hours before scheduled service: 100% cancellation fee (full service charge)

We reserve the right to cancel services due to unforeseen circumstances (severe weather, emergencies, etc.) with full refund. You will be notified immediately and offered alternative dates.`}
              />
              
              <TermSection
                title="5. Rescheduling"
                content="Services may be rescheduled up to 24 hours before the scheduled time without penalty. Please contact us as soon as possible to arrange a new time."
              />
              
              <TermSection
                title="6. Service Guarantee"
                content={`We stand behind the quality of our work. If you are not satisfied with any aspect of our service, or if something has been lost or damaged, you must notify us within 24 hours of service completion. We will return to address the issue at no additional charge.

IMPORTANT: Any claims for lost items, damages, or service quality issues NOT reported within 24 hours will not be considered. After 24 hours, the service will be deemed accepted and satisfactory.`}
              />
              
              <TermSection
                title="7. Liability and Insurance"
                content={`We maintain comprehensive liability insurance. However, we are not responsible for:
• Pre-existing damage not reported before service
• Damage to items not properly secured
• Items of unusual value unless specifically declared
• Loss of items valued over RWF 50,000 unless declared`}
              />
              
              <TermSection
                title="8. Customer Responsibilities"
                content={`You agree to:
• Provide accurate service location and contact information
• Secure valuable or fragile items before service
• Inform us of any special requirements or hazards
• Ensure pets are secured during service
• Provide access to water and electricity as needed

IMPORTANT - Property Security:
• The customer MUST provide a supervisor or responsible person to be present during service and to secure valuable properties
• If valuable items are lost or damaged WITHOUT the presence of your designated supervisor, ZLD Hub will NOT be held responsible for the loss
• Items of high value (jewelry, electronics, cash, important documents) must be secured by the customer before service begins
• Our staff will not be held liable for losses that occur due to inadequate supervision by the customer`}
              />
              
              <TermSection
                title="9. Privacy and Data Protection"
                content="We collect and process your personal information in accordance with Rwanda's data protection laws. Your data is used solely for service delivery, communication, and record keeping. We do not share your information with third parties without consent."
              />
              
              <TermSection
                title="10. Health and Safety"
                content="Our staff follow strict health and safety protocols. We use professional-grade, eco-friendly cleaning products. If you have allergies or sensitivities, please inform us in advance so we can accommodate your needs."
              />
              
              <TermSection
                title="11. Dispute Resolution"
                content="Any disputes arising from our services will be resolved through good faith negotiation. If unresolved, disputes shall be subject to the jurisdiction of Rwanda courts."
              />
              
              <p className="text-xs text-gray-500 italic">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Footer */}
            <div className="border-t p-6 flex gap-3">
              <button
                onClick={() => setShowTerms(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, agreedToTerms: true });
                  setShowTerms(false);
                }}
                className="flex-1 px-6 py-3 text-white rounded-lg transition font-medium"
                style={{ backgroundColor: '#28A8AC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#239095'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28A8AC'}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TermSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{content}</p>
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
