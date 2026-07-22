import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('jobs')
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        ),
        quotation:quotations(*)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('scheduled_date', startDate)
    }

    if (endDate) {
      query = query.lte('scheduled_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Jobs fetch error:', error)
      throw new Error('Failed to fetch jobs')
    }

    return NextResponse.json({ jobs: data || [] })
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

    // Generate job number if not provided
    if (!body.job_number) {
      const timestamp = Date.now()
      body.job_number = `JOB-${timestamp}`
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert(body)
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        )
      `)
      .single()

    if (error) {
      console.error('Job creation error:', error)
      throw new Error('Failed to create job')
    }

    return NextResponse.json({ job: data }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
