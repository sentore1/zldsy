import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id: quotationId } = await params

    // Get quotation details
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        )
      `)
      .eq('id', quotationId)
      .single()

    if (quotationError || !quotation) {
      console.error('Quotation fetch error:', quotationError)
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Check if quotation is already accepted
    if (quotation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Quotation already accepted' },
        { status: 400 }
      )
    }

    // Check if quotation has expired
    if (quotation.valid_until) {
      const validUntil = new Date(quotation.valid_until)
      const now = new Date()
      if (now > validUntil) {
        // Update status to expired
        await supabase
          .from('quotations')
          .update({ status: 'expired' })
          .eq('id', quotationId)

        return NextResponse.json(
          { error: 'Quotation has expired' },
          { status: 400 }
        )
      }
    }

    // Check if quotation is rejected
    if (quotation.status === 'rejected') {
      return NextResponse.json(
        { error: 'Quotation has been rejected' },
        { status: 400 }
      )
    }

    // Update quotation status to accepted
    const { error: updateError } = await supabase
      .from('quotations')
      .update({
        status: 'accepted',
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq('id', quotationId)

    if (updateError) {
      console.error('Quotation update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to accept quotation' },
        { status: 500 }
      )
    }

    // Check if job already exists for this booking
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('booking_id', quotation.booking_id)
      .single()

    if (existingJob) {
      return NextResponse.json(
        {
          success: true,
          quotation: { ...quotation, status: 'accepted' },
          job: existingJob,
          message: 'Quotation accepted. Job already exists.',
        },
        { status: 200 }
      )
    }

    // Auto-create job from accepted quotation
    const timestamp = Date.now()
    const jobNumber = `JOB-${timestamp}`

    // Use preferred_date from booking as scheduled_date
    const scheduledDate = quotation.booking.preferred_date || null

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        booking_id: quotation.booking_id,
        quotation_id: quotationId,
        job_number: jobNumber,
        scheduled_date: scheduledDate,
        status: 'pending', // Admin will assign staff and change to 'scheduled'
        notes: `Auto-generated from quotation ${quotation.quotation_number}`,
      })
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        ),
        quotation:quotations(*)
      `)
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }

    console.log('✅ Quotation accepted and job created:', jobNumber)

    // TODO: Send confirmation email/WhatsApp to customer
    // await sendJobConfirmationEmail(job)
    // await sendJobConfirmationWhatsApp(job)

    // TODO: Notify admin/staff about new job
    // await notifyAdminNewJob(job)

    return NextResponse.json(
      {
        success: true,
        quotation: { ...quotation, status: 'accepted' },
        job,
        message: 'Quotation accepted and job created successfully',
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

// Reject quotation endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id: quotationId } = await params

    const { error } = await supabase
      .from('quotations')
      .update({ status: 'rejected' })
      .eq('id', quotationId)

    if (error) {
      console.error('Quotation rejection error:', error)
      return NextResponse.json(
        { error: 'Failed to reject quotation' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Quotation rejected' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
