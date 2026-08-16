import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    
    const {
      name,
      type,
      registration_number,
      status,
      fuel_capacity,
      notes,
    } = body

    const query = supabase.from('equipment') as any
    const { data: equipment, error } = await query
      .insert({
        name,
        type,
        registration_number,
        status: status || 'available',
        fuel_capacity,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Equipment creation error:', error)
      throw new Error('Failed to create equipment')
    }

    return NextResponse.json({ equipment }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let query = supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Equipment fetch error:', error)
      throw new Error('Failed to fetch equipment')
    }

    return NextResponse.json({ equipment: data || [] })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
