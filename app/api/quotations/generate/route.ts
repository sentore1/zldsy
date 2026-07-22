import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { booking_id } = await request.json()

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(*), customer:customers(*)')
      .eq('id', booking_id)
      .single()

    if (bookingError) {
      console.error('Booking fetch error:', bookingError)
      throw new Error('Failed to fetch booking')
    }

    // Calculate pricing (basic implementation - customize as needed)
    const basePrice = Number(booking.service.base_price) || 0
    const totalAmount = basePrice
    const tax = totalAmount * 0.1 // 10% tax
    const discount = 0
    const finalAmount = totalAmount + tax - discount

    // Generate quotation number
    const timestamp = Date.now()
    const quotationNumber = `QUO-${timestamp}`

    // Set valid until date (7 days from now)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7)

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        booking_id,
        quotation_number: quotationNumber,
        total_amount: totalAmount,
        tax,
        discount,
        final_amount: finalAmount,
        status: 'sent',
        valid_until: validUntil.toISOString(),
      })
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        )
      `)
      .single()

    if (quotationError) {
      console.error('Quotation creation error:', quotationError)
      throw new Error('Failed to create quotation')
    }

    // Create quotation items
    const { error: itemError } = await supabase
      .from('quotation_items')
      .insert({
        quotation_id: quotation.id,
        description: booking.service.name,
        quantity: 1,
        unit_price: basePrice,
        total_price: basePrice,
      })

    if (itemError) {
      console.error('Quotation item creation error:', itemError)
    }

    return NextResponse.json({ quotation }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
