import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        service:services(*),
        photos:booking_photos(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Booking fetch error:', error)
      throw new Error('Failed to fetch booking')
    }

    return NextResponse.json({ booking: data })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    const body = await request.json()
    
    // Workaround for Supabase type inference issue
    const query = supabase.from('bookings') as any
    const { data, error } = await query
      .update(body)
      .eq('id', id)
      .select('*, customer:customers(*), service:services(*)')
      .single()

    if (error) {
      console.error('Booking update error:', error)
      throw new Error('Failed to update booking')
    }

    return NextResponse.json({ booking: data })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Booking delete error:', error)
      throw new Error('Failed to delete booking')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
