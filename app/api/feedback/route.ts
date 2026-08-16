import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { booking_number, service, customer_name, rating, feedback } = body

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'A rating between 1 and 5 is required.' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = getSupabaseAdmin()

    // Attempt to persist to a `feedback` table.
    // If the table doesn't exist yet the error is caught and we still return
    // 200 so the client UI never shows a broken state.
    const { error } = await (supabase.from('feedback') as any).insert({
      booking_number: booking_number ?? null,
      service: service ?? null,
      customer_name: customer_name ?? null,
      rating,
      feedback: feedback ?? null,
      submitted_at: new Date().toISOString(),
    })

    if (error) {
      // Log but don't expose internals to the client
      console.error('Feedback insert error:', error)
      // Still return success if it's just a missing-table issue so the UX
      // isn't broken before the migration is applied.
      if (
        error.code === '42P01' || // undefined_table
        error.message?.includes('does not exist')
      ) {
        console.warn(
          'feedback table does not exist yet — skipping persist, returning success.'
        )
        return NextResponse.json(
          { success: true, persisted: false },
          { headers: corsHeaders }
        )
      }

      return NextResponse.json(
        { error: 'Failed to save feedback. Please try again.' },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true, persisted: true },
      { headers: corsHeaders }
    )
  } catch (err: any) {
    console.error('Feedback API error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await (supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false }) as any)

    if (error) {
      console.error('Feedback fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch feedback.' },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json({ feedback: data ?? [] }, { headers: corsHeaders })
  } catch (err: any) {
    console.error('Feedback GET error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
