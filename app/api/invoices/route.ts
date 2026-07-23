import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('invoices')
      .select(`
        *,
        job:jobs(
          *,
          booking:bookings(
            *,
            customer:customers(*)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Invoices fetch error:', error)
      throw new Error('Failed to fetch invoices')
    }

    return NextResponse.json({ invoices: data || [] })
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
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    // Generate invoice number if not provided
    if (!body.invoice_number) {
      const timestamp = Date.now()
      body.invoice_number = `INV-${timestamp}`
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(body)
      .select(`
        *,
        job:jobs(
          *,
          booking:bookings(
            *,
            customer:customers(*)
          )
        )
      `)
      .single()

    if (error) {
      console.error('Invoice creation error:', error)
      throw new Error('Failed to create invoice')
    }

    return NextResponse.json({ invoice: data }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
