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
      .from('jobs')
      .select(`
        *,
        booking:bookings(
          *,
          customer:customers(*),
          service:services(*)
        ),
        quotation:quotations(*),
        staff:job_staff(*, staff:staff(*)),
        materials:job_materials(*, inventory:inventory(*)),
        equipment:job_equipment(*, equipment:equipment(*))
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Job fetch error:', error)
      throw new Error('Failed to fetch job')
    }

    return NextResponse.json({ job: data })
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

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
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
      console.error('Job update error:', error)
      throw new Error('Failed to update job')
    }

    return NextResponse.json({ job: data })
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
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Job delete error:', error)
      throw new Error('Failed to delete job')
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
