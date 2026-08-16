import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

/**
 * GET /api/bookings/calendar?year=YYYY&month=MM&capacity=N
 *
 * Returns bookings grouped by preferred_date for a given month.
 * Also flags days as "fully_booked" when booking count >= capacity.
 *
 * Query params:
 *   year      – 4-digit year  (default: current year)
 *   month     – 1-12          (default: current month)
 *   capacity  – max bookings per day before day is "fully booked" (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const now = new Date()
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10)
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10)
    const capacity = parseInt(searchParams.get('capacity') || '5', 10)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 })
    }

    // Build date range: first day → last day of the requested month
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0) // day 0 of next month = last day of this month

    const startDate = firstDay.toISOString().split('T')[0]
    const endDate = lastDay.toISOString().split('T')[0]

    const supabase = getSupabaseAdmin()

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        preferred_date,
        status,
        customer:customers(id, name, phone),
        service:services(id, name)
      `)
      .gte('preferred_date', startDate)
      .lte('preferred_date', endDate)
      .order('preferred_date', { ascending: true })

    if (error) {
      console.error('Calendar fetch error:', error)
      throw new Error('Failed to fetch bookings for calendar')
    }

    // Group bookings by date
    const byDate: Record<string, {
      date: string
      count: number
      fully_booked: boolean
      bookings: typeof bookings
    }> = {}

    for (const booking of bookings || []) {
      const date = booking.preferred_date?.split('T')[0] ?? ''
      if (!date) continue
      if (!byDate[date]) {
        byDate[date] = { date, count: 0, fully_booked: false, bookings: [] }
      }
      byDate[date].count++
      byDate[date].bookings.push(booking)
      byDate[date].fully_booked = byDate[date].count >= capacity
    }

    return NextResponse.json({
      year,
      month,
      capacity,
      start_date: startDate,
      end_date: endDate,
      days: Object.values(byDate),
      total_bookings: bookings?.length ?? 0,
    })
  } catch (error: any) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
