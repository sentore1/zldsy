import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoice_id')

    let query = supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(
          *,
          job:jobs(
            *,
            booking:bookings(
              *,
              customer:customers(*)
            )
          )
        )
      `)
      .order('payment_date', { ascending: false })

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Payments fetch error:', error)
      throw new Error('Failed to fetch payments')
    }

    return NextResponse.json({ payments: data || [] })
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

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(body)
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      throw new Error('Failed to create payment')
    }

    // Update invoice status to paid if full amount
    if (body.invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('final_amount')
        .eq('id', body.invoice_id)
        .single()

      if (invoice && Number(body.amount) >= Number(invoice.final_amount)) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
            payment_method: body.payment_method,
          })
          .eq('id', body.invoice_id)
      }
    }

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
