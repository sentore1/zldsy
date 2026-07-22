import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('booking_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('quotations')
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        ),
        items:quotation_items(*)
      `)
      .order('created_at', { ascending: false })

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Quotations fetch error:', error)
      throw new Error('Failed to fetch quotations')
    }

    return NextResponse.json({ quotations: data || [] })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()

    // Generate quotation number if not provided
    if (!body.quotation_number) {
      const timestamp = Date.now()
      body.quotation_number = `QUO-${timestamp}`
    }

    const { data, error } = await supabase
      .from('quotations')
      .insert(body)
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*)
        )
      `)
      .single()

    if (error) {
      console.error('Quotation creation error:', error)
      throw new Error('Failed to create quotation')
    }

    return NextResponse.json({ quotation: data }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
