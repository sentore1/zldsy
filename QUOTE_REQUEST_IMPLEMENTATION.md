# Request Quote Implementation Guide

## Overview

This guide shows how to implement the "Request Quote" functionality in the booking form. When customers click "Request Quote" instead of "Book Now", they should have a slightly different experience that indicates they're requesting a quote rather than making a direct booking.

## Current State

- Landing page has both "Book Now" and "Request Quote" buttons
- Both currently redirect to: `/customer/booking?service={id}&requestQuote=true`
- The booking form needs to be updated to handle quote requests differently

## Implementation Options

### Option 1: Modify Existing Booking Form (Recommended)

Update the booking form to detect the `requestQuote` parameter and adjust the UI/behavior.

#### Changes to `app/customer/booking/page.tsx`:

```typescript
// Add this to detect quote request
const searchParams = useSearchParams();
const requestQuote = searchParams.get('requestQuote') === 'true';

// Update form heading
<h1 className="text-3xl font-bold text-gray-900">
  {requestQuote ? 'Request a Quote' : 'Book a Service'}
</h1>

// Update description
<p className="text-gray-600">
  {requestQuote 
    ? 'Fill in the details below and we\'ll send you a custom quote within 24 hours'
    : 'Fill in your details and preferred date to book your service'
  }
</p>

// Update submit button text
<button type="submit" className="...">
  {requestQuote ? 'Request Quote' : 'Book Now'}
</button>

// Update booking status when creating
const bookingData = {
  ...formData,
  status: requestQuote ? 'quote_requested' : 'pending',
  // ... other fields
};
```

#### Update Database Schema:

Add 'quote_requested' to booking status enum:

```sql
-- Update bookings table status check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'quote_requested', 'confirmed', 'cancelled', 'completed'));
```

### Option 2: Create Separate Quote Request Page

Create a dedicated quote request page with different fields.

#### Create `app/customer/quote/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RequestQuotePage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    serviceId: serviceId || "",
    description: "",
    preferredDate: "",
    // Additional fields specific to quotes
    areaSize: "",
    additionalRequirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create booking with quote_requested status
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        status: 'quote_requested',
        notes: `QUOTE REQUEST - Area: ${formData.areaSize} - Requirements: ${formData.additionalRequirements}`,
      }),
    });

    if (response.ok) {
      // Redirect to confirmation
      router.push('/customer/quote-confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request a Quote
          </h1>
          <p className="text-gray-600 mb-8">
            Tell us about your requirements and we'll send you a detailed quote within 24 hours
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Add email, phone, address fields similar to above */}
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Service Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Area / Size
                </label>
                <input
                  type="text"
                  value={formData.areaSize}
                  onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                  placeholder="e.g., 150 square meters, 3-bedroom house"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  rows={4}
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  placeholder="Tell us about any specific requirements, concerns, or questions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-lg"
            >
              Submit Quote Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

#### Update Landing Page Link:

```typescript
// In app/page.tsx, change Request Quote button to:
<Link
  href={`/customer/quote?service=${service.id}`}
  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border-2 text-sm rounded hover:bg-gray-50 transition"
  style={{ borderColor: '#28A8AC', color: '#28A8AC' }}
>
  Request Quote
</Link>
```

## Recommended Flow

### Customer Journey:

1. **Customer sees service** with price range on landing page
2. **Clicks "Request Quote"** instead of "Book Now"
3. **Fills quote request form** with:
   - Contact details
   - Service area/size
   - Specific requirements
   - Preferred date (optional)
4. **Submits request** → Creates booking with status `quote_requested`
5. **Receives confirmation** → Shows expected response time
6. **Admin reviews** in admin dashboard
7. **Admin generates quote** using the quotations system
8. **Customer receives quote** via email
9. **Customer accepts/rejects** quote

### Admin Dashboard Updates:

Update `app/admin/bookings/page.tsx` to:

1. **Show quote requests separately**:
```typescript
const quoteRequests = bookings.filter(b => b.status === 'quote_requested');
const regularBookings = bookings.filter(b => b.status !== 'quote_requested');
```

2. **Add "Generate Quote" button** for quote requests:
```typescript
<Link
  href={`/admin/quotations/new?booking=${booking.id}`}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Generate Quote
</Link>
```

3. **Different badge styling** for quote requests:
```typescript
{booking.status === 'quote_requested' && (
  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
    Quote Requested
  </span>
)}
```

## Database Schema Update

Run this SQL to support quote requests:

```sql
-- Update bookings status enum to include quote_requested
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'quote_requested', 'confirmed', 'cancelled', 'completed'));

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_bookings_quote_requests 
  ON bookings(status) 
  WHERE status = 'quote_requested';

-- Add comments for documentation
COMMENT ON COLUMN bookings.status IS 'Booking status: pending (direct booking), quote_requested (needs quote), confirmed, cancelled, completed';
```

## Email Notifications

### Quote Request Confirmation Email:

```typescript
// Add to your email service
const sendQuoteRequestConfirmation = async (booking: Booking) => {
  const emailContent = {
    to: booking.customer.email,
    subject: "Quote Request Received - Service Portal",
    html: `
      <h2>Thank you for your quote request!</h2>
      <p>We've received your request for ${booking.service.name}.</p>
      <p>Our team will review your requirements and send you a detailed quote within 24 hours.</p>
      
      <h3>Request Details:</h3>
      <ul>
        <li>Service: ${booking.service.name}</li>
        <li>Preferred Date: ${booking.preferred_date}</li>
        <li>Reference: ${booking.id}</li>
      </ul>
      
      <p>You'll receive your quote at this email address.</p>
    `,
  };
  
  // Send email using your email service
};
```

### Quote Generated Email:

```typescript
const sendQuoteEmail = async (quotation: Quotation) => {
  // Send quote PDF with acceptance link
};
```

## UI/UX Considerations

### Clear Differentiation:

1. **Different colors**:
   - Book Now: Solid teal button
   - Request Quote: Outlined teal button

2. **Different icons**:
   ```typescript
   import { ArrowRight, FileText } from "lucide-react";
   
   // Book Now button
   <ArrowRight className="w-4 h-4" />
   
   // Request Quote button
   <FileText className="w-4 h-4" />
   ```

3. **Tooltips**:
   ```typescript
   <button title="Get an instant booking confirmation">
     Book Now
   </button>
   
   <button title="Receive a custom quote based on your requirements">
     Request Quote
   </button>
   ```

### Price Range Context:

For services with price ranges, emphasize that quotes provide exact pricing:

```typescript
{service.display_price_type === 'range' && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
    <p className="text-sm text-blue-800">
      💡 <strong>Price varies:</strong> Request a quote for exact pricing based on your specific requirements
    </p>
  </div>
)}
```

## Testing Checklist

- [ ] Quote request creates booking with correct status
- [ ] Admin can see quote requests separately
- [ ] Admin can generate quotes from requests
- [ ] Customer receives confirmation email
- [ ] Customer receives quote email when generated
- [ ] Quote acceptance link works
- [ ] Quote rejection is handled
- [ ] Regular bookings still work normally
- [ ] Both buttons visible on all services
- [ ] Mobile responsive layout

## Next Steps

1. Choose between Option 1 (modify booking form) or Option 2 (separate page)
2. Update database schema to support `quote_requested` status
3. Implement chosen option
4. Update admin dashboard to highlight quote requests
5. Set up email notifications
6. Test complete flow from request to quote generation

## Summary

The "Request Quote" feature provides customers with an alternative to direct booking when:
- Service has variable pricing
- Customer needs custom assessment
- Project details need discussion
- Exact requirements unknown

This creates a smoother sales process for complex services while maintaining the quick-booking option for standard services.
