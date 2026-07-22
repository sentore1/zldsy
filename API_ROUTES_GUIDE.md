# API Routes Implementation Guide

This guide outlines all API routes needed for the Service Management System.

## Overview

All API routes should be created in the `app/api/` directory using Next.js 14 App Router conventions.

## Route Structure

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── logout/route.ts
│   └── reset-password/route.ts
├── bookings/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/photos/route.ts
├── quotations/
│   ├── route.ts
│   ├── [id]/route.ts
│   ├── generate/route.ts
│   └── [id]/accept/route.ts
├── jobs/
│   ├── route.ts
│   ├── [id]/route.ts
│   ├── [id]/assign-staff/route.ts
│   └── [id]/complete/route.ts
├── invoices/
│   ├── route.ts
│   ├── [id]/route.ts
│   ├── generate/route.ts
│   └── [id]/pdf/route.ts
├── payments/
│   ├── route.ts
│   ├── process/route.ts
│   └── webhook/route.ts
├── customers/
│   ├── route.ts
│   └── [id]/route.ts
├── services/
│   ├── route.ts
│   └── [id]/route.ts
├── staff/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/attendance/route.ts
├── inventory/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── restock/route.ts
├── equipment/
│   ├── route.ts
│   └── [id]/route.ts
├── feedback/
│   ├── route.ts
│   └── [id]/route.ts
└── reports/
    ├── financial/route.ts
    ├── operational/route.ts
    └── custom/route.ts
```

## Authentication Routes

### POST /api/auth/login
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
```

### POST /api/auth/register
```typescript
// app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  const { email, password, name, phone } = await request.json();
  const supabase = createClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Create customer record
  const { error: customerError } = await supabase
    .from('customers')
    .insert({ id: authData.user!.id, name, email, phone });

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 400 });
  }

  return NextResponse.json({ user: authData.user });
}
```

## Booking Routes

### POST /api/bookings
**Create a new booking**

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateQuotationNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      service_id,
      preferred_date,
      notes,
      customer_info, // For new customers
      photos,
    } = body;

    // Create or get customer
    let customerId = customer_id;
    if (!customerId && customer_info) {
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          name: customer_info.name,
          email: customer_info.email,
          phone: customer_info.phone,
          address: customer_info.address,
        })
        .select()
        .single();

      if (customerError) throw customerError;
      customerId = customer.id;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id: customerId,
        service_id,
        preferred_date,
        notes,
        status: 'pending',
        booking_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Upload photos if provided
    if (photos && photos.length > 0) {
      // Handle photo uploads
      // Implementation depends on your storage solution
    }

    // Auto-generate quotation
    // This could be done here or via a separate endpoint
    // await generateQuotation(booking.id);

    // Send confirmation email
    // await sendBookingConfirmationEmail(booking);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        service:services(*)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ bookings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### GET /api/bookings/[id]
```typescript
// app/api/bookings/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        service:services(*),
        photos:booking_photos(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ booking: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Quotation Routes

### POST /api/quotations/generate
**Auto-generate quotation from booking**

```typescript
// app/api/quotations/generate/route.ts
import { generateQuotationNumber, generateQRCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { booking_id } = await request.json();

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, service:services(*)')
      .eq('id', booking_id)
      .single();

    if (bookingError) throw bookingError;

    // Calculate pricing (implement your pricing logic)
    const totalAmount = calculatePrice(booking);
    const tax = totalAmount * 0.1; // 10% tax
    const discount = 0;
    const finalAmount = totalAmount + tax - discount;

    // Generate quotation number
    const quotationNumber = generateQuotationNumber();

    // Create quotation
    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .insert({
        booking_id,
        quotation_number: quotationNumber,
        total_amount: totalAmount,
        tax,
        discount,
        final_amount: finalAmount,
        status: 'sent',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .select()
      .single();

    if (quotationError) throw quotationError;

    // Generate QR code
    const qrCode = await generateQRCode(
      `${process.env.NEXT_PUBLIC_APP_URL}/quotations/${quotation.id}`
    );

    // Update with QR code
    await supabaseAdmin
      .from('quotations')
      .update({ qr_code: qrCode })
      .eq('id', quotation.id);

    // Send quotation email
    // await sendQuotationEmail(quotation);

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculatePrice(booking: any): number {
  // Implement your pricing logic here
  // This is a simple example
  return booking.service.base_price;
}
```

### POST /api/quotations/[id]/accept
```typescript
// app/api/quotations/[id]/accept/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Update quotation status
    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .update({
        status: 'accepted',
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (quotationError) throw quotationError;

    // Auto-create job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        booking_id: quotation.booking_id,
        quotation_id: quotation.id,
        job_number: generateJobNumber(),
        status: 'pending',
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Send confirmation email
    // await sendAcceptanceEmail(quotation, job);

    return NextResponse.json({ quotation, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Invoice Routes

### POST /api/invoices/generate
```typescript
// app/api/invoices/generate/route.ts
import { generateInvoiceNumber, generateQRCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { job_id } = await request.json();

    // Get job details with all costs
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        quotation:quotations(*),
        materials:job_materials(*),
        staff:job_staff(*),
        equipment:job_equipment(*)
      `)
      .eq('id', job_id)
      .single();

    if (jobError) throw jobError;

    // Calculate total amount
    const materialsCost = job.materials.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);
    const laborCost = job.staff.reduce((sum: number, s: any) => sum + (s.labor_cost || 0), 0);
    const equipmentCost = job.equipment.reduce((sum: number, e: any) => sum + (e.fuel_cost || 0), 0);

    const totalAmount = (job.quotation?.final_amount || 0) + materialsCost + laborCost + equipmentCost;
    const tax = totalAmount * 0.1;
    const finalAmount = totalAmount + tax;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        job_id,
        invoice_number: generateInvoiceNumber(),
        total_amount: totalAmount,
        tax,
        final_amount: finalAmount,
        status: 'pending',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Generate QR code for payment
    const qrCode = await generateQRCode(
      `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`
    );

    await supabaseAdmin
      .from('invoices')
      .update({ qr_code: qrCode })
      .eq('id', invoice.id);

    // Send invoice email
    // await sendInvoiceEmail(invoice);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Payment Routes

### POST /api/payments/process
```typescript
// app/api/payments/process/route.ts
// Example with Stripe

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { invoice_id, payment_method_id, amount } = await request.json();

    // Get invoice details
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true,
    });

    // Record payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        invoice_id,
        amount,
        payment_method: 'credit_card',
        transaction_reference: paymentIntent.id,
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update invoice status
    await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
      })
      .eq('id', invoice_id);

    // Send receipt email
    // await sendReceiptEmail(invoice, payment);

    return NextResponse.json({ payment, paymentIntent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## File Upload Route

### POST /api/upload
```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const bookingId = formData.get('booking_id') as string;

    const uploadedPhotos = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabaseAdmin.storage
        .from('service-photos')
        .upload(`bookings/${bookingId}/${fileName}`, buffer, {
          contentType: file.type,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('service-photos')
        .getPublicUrl(data.path);

      // Save photo record
      const { data: photo } = await supabaseAdmin
        .from('booking_photos')
        .insert({
          booking_id: bookingId,
          photo_url: urlData.publicUrl,
          description: file.name,
        })
        .select()
        .single();

      uploadedPhotos.push(photo);
    }

    return NextResponse.json({ photos: uploadedPhotos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Report Routes

### GET /api/reports/financial
```typescript
// app/api/reports/financial/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get revenue
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select('final_amount, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get expenses
    const { data: expenses } = await supabaseAdmin
      .from('expenses')
      .select('amount, category, expense_date')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);

    const totalRevenue = invoices
      ?.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.final_amount, 0) || 0;

    const totalExpenses = expenses
      ?.reduce((sum, e) => sum + e.amount, 0) || 0;

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0
      ? (netProfit / totalRevenue) * 100
      : 0;

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      invoices,
      expenses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Middleware for Authentication

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/auth')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

## Testing Your API Routes

```bash
# Test booking creation
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_info": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+1234567890",
      "address": "123 Test St"
    },
    "service_id": "service-uuid",
    "preferred_date": "2024-02-01",
    "notes": "Test booking"
  }'

# Test get bookings
curl http://localhost:3000/api/bookings

# Test generate quotation
curl -X POST http://localhost:3000/api/quotations/generate \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "booking-uuid"}'
```

## Next Steps

1. Create each route file
2. Test with Postman or curl
3. Add error handling
4. Implement validation (use Zod)
5. Add rate limiting
6. Document each endpoint
7. Write unit tests

---

**This is a comprehensive starting point. Customize based on your specific business logic!**
