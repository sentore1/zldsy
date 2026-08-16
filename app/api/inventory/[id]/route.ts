import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json({ inventory: data })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    // Strip id from body if accidentally included
    const { id: _id, ...updateData } = body

    const updateQuery = supabase.from('inventory') as any
    const { data, error } = await updateQuery
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Inventory update error:', error)
      return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
    }

    return NextResponse.json({ inventory: data })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Inventory delete error:', error)
      return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Inventory item deleted successfully' })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
