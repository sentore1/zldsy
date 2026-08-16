import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id } = await params
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        job:jobs(
          *,
          booking:bookings(
            *,
            customer:customers(*),
            service:services(*)
          )
        ),
        payments:payments(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Invoice fetch error:', error)
      throw new Error('Failed to fetch invoice')
    }

    return NextResponse.json({ invoice: data })
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
    const supabase = supabaseAdmin
    const updates = await request.json()
    const { id } = await params

    const query = supabase.from('invoices') as any
    const { data, error } = await query
      .update(updates)
      .eq('id', id)
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
      console.error('Invoice update error:', error)
      throw new Error('Failed to update invoice')
    }

    return NextResponse.json({ invoice: data })
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
    const supabase = supabaseAdmin
    const { id } = await params
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Invoice delete error:', error)
      throw new Error('Failed to delete invoice')
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
