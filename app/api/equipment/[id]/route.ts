import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()
    const { id } = await params

    const query = supabase.from('equipment') as any
    const { data: equipment, error } = await query
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Equipment update error:', error)
      throw new Error('Failed to update equipment')
    }

    return NextResponse.json({ equipment })
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
      .from('equipment')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Equipment deletion error:', error)
      throw new Error('Failed to delete equipment')
    }

    return NextResponse.json({ message: 'Equipment deleted successfully' })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id } = await params

    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Equipment fetch error:', error)
      throw new Error('Failed to fetch equipment')
    }

    return NextResponse.json({ equipment })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
