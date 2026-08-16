import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') || searchParams.get('phone') || '').trim()

    if (!query) {
      return NextResponse.json(
        { error: 'Please provide a phone number or booking ID' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = getSupabaseAdmin()

    // ── Strategy 1: treat as a booking ID / booking_number ──────────────────
    // bookings table has an auto-generated id (uuid) and a human-readable
    // booking_number like "BOOK-12345". Try both.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query)
    const isBookingNumber = /^BOOK-/i.test(query)

    if (isUuid || isBookingNumber) {
      const field = isUuid ? 'id' : 'booking_number'

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(id, name, phone, email, address),
          service:services(id, name, description, base_price)
        `)
        .eq(field, query)
        .maybeSingle()

      if (bookingError) {
        console.error('Booking lookup error:', bookingError)
        throw new Error('Failed to lookup booking')
      }

      if (booking) {
        return NextResponse.json(
          {
            lookup_type: 'booking_id',
            customer: booking.customer
              ? {
                  name: booking.customer.name,
                  phone: booking.customer.phone,
                  email: booking.customer.email,
                  address: booking.customer.address,
                }
              : null,
            bookings: [booking],
          },
          { headers: corsHeaders }
        )
      }
    }

    // ── Strategy 2: treat as a phone number ─────────────────────────────────
    // Normalise: strip spaces, dashes, and leading zeros for flexible matching
    const normalisedPhone = query.replace(/[\s\-]/g, '')

    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, phone, email, address')
      .or(`phone.eq.${normalisedPhone},phone.eq.${query}`)

    if (customerError) {
      console.error('Customer lookup error:', customerError)
      throw new Error('Failed to lookup customer')
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { lookup_type: 'phone', customer: null, bookings: [] },
        { headers: corsHeaders }
      )
    }

    const customer = customers[0]

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, description, base_price)
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError)
      throw new Error('Failed to fetch bookings')
    }

    return NextResponse.json(
      {
        lookup_type: 'phone',
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        },
        bookings: bookings || [],
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Track API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
