import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = getSupabaseAdmin()

    // Find customer by phone
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, phone, email, address')
      .eq('phone', phone.trim())

    if (customerError) {
      console.error('Customer lookup error:', customerError)
      throw new Error('Failed to lookup customer')
    }

    // If no customer found, return empty bookings
    if (!customers || customers.length === 0) {
      return NextResponse.json(
        {
          customer: null,
          bookings: [],
        },
        { headers: corsHeaders }
      )
    }

    const customer = customers[0]

    // Get customer's bookings with service details
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*)
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError)
      throw new Error('Failed to fetch bookings')
    }

    return NextResponse.json(
      {
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
