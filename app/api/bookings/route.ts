import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    
    const {
      customer_id,
      service_id,
      preferred_date,
      notes,
      customer_info,
    } = body

    // Create or get customer
    let customerId = customer_id
    if (!customerId && customer_info) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer_info.name,
          email: customer_info.email,
          phone: customer_info.phone,
          address: customer_info.address,
        })
        .select()
        .single()

      if (customerError) {
        console.error('Customer creation error:', customerError)
        throw new Error('Failed to create customer')
      }
      customerId = customer.id
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        service_id,
        preferred_date,
        notes,
        status: 'pending',
        booking_date: new Date().toISOString(),
      })
      .select('*, customer:customers(*), service:services(*)')
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      throw new Error('Failed to create booking')
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customer_id')

    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        service:services(*)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Bookings fetch error:', error)
      throw new Error('Failed to fetch bookings')
    }

    return NextResponse.json({ bookings: data || [] })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
