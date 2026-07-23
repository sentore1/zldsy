import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'
import { generateQRCode } from '@/lib/utils/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { booking_id } = await request.json()

    if (!booking_id) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      )
    }

    // Get booking details with service and customer info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        service:services(*)
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if quotation already exists for this booking
    const { data: existingQuotation } = await supabase
      .from('quotations')
      .select('*')
      .eq('booking_id', booking_id)
      .single()

    if (existingQuotation) {
      return NextResponse.json(
        { 
          error: 'Quotation already exists for this booking',
          quotation: existingQuotation 
        },
        { status: 400 }
      )
    }

    // Calculate pricing
    const basePrice = Number(booking.service.base_price) || 0
    const totalAmount = basePrice
    
    // Get tax rate from settings (default 10%)
    const { data: taxSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tax_rate')
      .single()
    
    const taxRate = taxSetting ? Number(taxSetting.value) : 0.10
    const tax = Math.round(totalAmount * taxRate * 100) / 100
    
    const discount = 0 // Can be customized based on customer or promotion
    const finalAmount = totalAmount + tax - discount

    // Get quotation validity days from settings (default 7 days)
    const { data: validitySetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'quotation_validity_days')
      .single()
    
    const validityDays = validitySetting ? Number(validitySetting.value) : 7
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validityDays)

    // Generate quotation number
    const timestamp = Date.now()
    const quotationNumber = `QUO-${timestamp}`

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
      return NextResponse.json(
        { error: 'Failed to create quotation' },
        { status: 500 }
      )
    }

    // Create quotation items (breakdown of costs)
    const { error: itemError } = await supabase
      .from('quotation_items')
      .insert([
        {
          quotation_id: quotation.id,
          description: booking.service.name,
          quantity: 1,
          unit_price: basePrice,
          total_price: basePrice,
        },
      ])

    if (itemError) {
      console.error('Quotation items error:', itemError)
      // Don't fail the whole operation for this
    }

    // Generate QR code for quotation verification
    const quotationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quotations/${quotation.id}`
    const qrCodeDataUrl = await generateQRCode(quotationUrl)

    // Update quotation with QR code
    if (qrCodeDataUrl) {
      await supabase
        .from('quotations')
        .update({ qr_code: qrCodeDataUrl })
        .eq('id', quotation.id)
    }

    // Update booking status to confirmed
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking_id)

    console.log('✅ Quotation generated successfully:', quotationNumber)

    // TODO: Send quotation email/WhatsApp to customer
    // await sendQuotationEmail(quotation)
    // await sendQuotationWhatsApp(quotation)

    return NextResponse.json(
      {
        success: true,
        quotation: {
          ...quotation,
          qr_code: qrCodeDataUrl,
        },
        message: 'Quotation generated successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
