import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const lowStock = searchParams.get('low_stock')

    let query = supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (lowStock === 'true') {
      // Filter for items where quantity is below reorder level
      query = query.lt('quantity', 'reorder_level')
    }

    const { data, error } = await query

    if (error) {
      console.error('Inventory fetch error:', error)
      throw new Error('Failed to fetch inventory')
    }

    return NextResponse.json({ inventory: data || [] })
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
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('inventory')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Inventory creation error:', error)
      throw new Error('Failed to create inventory item')
    }

    return NextResponse.json({ inventory: data }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
