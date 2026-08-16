import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    let { data, error } = await query

    // If sort_order column doesn't exist yet, fall back to creation order (not name)
    if (error && error.code === '42703' && error.message.includes('sort_order')) {
      const fallback = supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true })

      const fallbackQuery = category ? fallback.eq('category', category) : fallback
      const result = isActive !== null
        ? await fallbackQuery.eq('is_active', isActive === 'true')
        : await fallbackQuery

      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Services fetch error:', error)
      throw new Error('Failed to fetch services')
    }

    return NextResponse.json({ services: data || [] })
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

    const query = supabase.from('services') as any
    const { data, error } = await query
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Service creation error:', error)
      throw new Error('Failed to create service')
    }

    return NextResponse.json({ service: data }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
