import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'
import { generateQRCode } from '@/lib/utils/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { job_id } = await request.json()

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      )
    }

    // Get job details with all related data
    const query = supabase.from('jobs') as any
    const { data: job, error: jobError } = await query
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        ),
        quotation:quotations(*),
        materials:job_materials(
          *,
          inventory:inventory(name, unit)
        ),
        staff:job_staff(
          *,
          staff:staff(name, role, hourly_rate)
        ),
        equipment:job_equipment(
          *,
          equipment:equipment(name, type)
        )
      `)
      .eq('id', job_id)
      .single()

    if (jobError || !job) {
      console.error('Job fetch error:', jobError)
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      return NextResponse.json(
        { error: 'Job must be completed before generating invoice' },
        { status: 400 }
      )
    }

    // Check if invoice already exists for this job
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('job_id', job_id)
      .single()

    if (existingInvoice) {
      return NextResponse.json(
        {
          error: 'Invoice already exists for this job',
          invoice: existingInvoice,
        },
        { status: 400 }
      )
    }

    // Calculate total costs
    
    // 1. Base service cost (from quotation if exists, else from service price)
    let baseServiceCost = 0
    if (job.quotation) {
      baseServiceCost = Number(job.quotation.total_amount) || 0
    } else if (job.booking?.service) {
      baseServiceCost = Number(job.booking.service.base_price) || 0
    }

    // 2. Materials cost
    const materialsCost = job.materials?.reduce((sum: number, material: any) => {
      return sum + (Number(material.cost) || 0)
    }, 0) || 0

    // 3. Labor cost
    const laborCost = job.staff?.reduce((sum: number, staff: any) => {
      return sum + (Number(staff.labor_cost) || 0)
    }, 0) || 0

    // 4. Equipment/fuel cost
    const equipmentCost = job.equipment?.reduce((sum: number, eq: any) => {
      return sum + (Number(eq.fuel_cost) || 0)
    }, 0) || 0

    // Calculate totals
    const subtotal = baseServiceCost + materialsCost + laborCost + equipmentCost
    
    // Get tax rate from settings (default 10%)
    const taxQuery = supabase.from('settings') as any
    const { data: taxSetting } = await taxQuery
      .select('value')
      .eq('key', 'tax_rate')
      .single()
    
    const taxRate = taxSetting ? Number(taxSetting.value) : 0.10
    const tax = Math.round(subtotal * taxRate * 100) / 100
    
    const discount = 0 // Can be customized
    const finalAmount = subtotal + tax - discount

    // Get invoice due days from settings (default 30 days)
    const dueDaysQuery = supabase.from('settings') as any
    const { data: dueDaysSetting } = await dueDaysQuery
      .select('value')
      .eq('key', 'invoice_due_days')
      .single()
    
    const dueDays = dueDaysSetting ? Number(dueDaysSetting.value) : 30
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    // Generate invoice number
    const timestamp = Date.now()
    const invoiceNumber = `INV-${timestamp}`

    // Create invoice
    const invoiceQuery = supabase.from('invoices') as any
    const { data: invoice, error: invoiceError } = await invoiceQuery
      .insert({
        job_id,
        invoice_number: invoiceNumber,
        total_amount: subtotal,
        tax,
        discount,
        final_amount: finalAmount,
        status: 'pending',
        due_date: dueDate.toISOString(),
      })
      .select(`
        *,
        job:jobs(
          *,
          booking:bookings(
            *,
            customer:customers(*),
            service:services(*)
          )
        )
      `)
      .single()

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError)
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    // Generate QR code for payment
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}/pay`
    const qrCodeDataUrl = await generateQRCode(paymentUrl)

    // Update invoice with QR code
    if (qrCodeDataUrl) {
      const qrQuery = supabase.from('invoices') as any
      await qrQuery
        .update({ qr_code: qrCodeDataUrl })
        .eq('id', invoice.id)
    }

    console.log('✅ Invoice generated successfully:', invoiceNumber)
    console.log('   Base Service:', baseServiceCost)
    console.log('   Materials:', materialsCost)
    console.log('   Labor:', laborCost)
    console.log('   Equipment:', equipmentCost)
    console.log('   Tax:', tax)
    console.log('   Final Amount:', finalAmount)

    // TODO: Send invoice email/WhatsApp to customer
    // await sendInvoiceEmail(invoice)
    // await sendInvoiceWhatsApp(invoice)

    return NextResponse.json(
      {
        success: true,
        invoice: {
          ...invoice,
          qr_code: qrCodeDataUrl,
        },
        breakdown: {
          baseServiceCost,
          materialsCost,
          laborCost,
          equipmentCost,
          subtotal,
          tax,
          discount,
          finalAmount,
        },
        message: 'Invoice generated successfully',
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
