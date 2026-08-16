import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PATCH /api/services/reorder
// Body: { orderedIds: string[] }
// Updates sort_order for each service based on its position in the array
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { orderedIds } = await request.json()

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: 'orderedIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Update each service's sort_order based on its index in the array
    const updates = orderedIds.map((id: string, index: number) =>
      (supabase.from('services') as any)
        .update({ sort_order: index })
        .eq('id', id)
    )

    const results = await Promise.all(updates)

    // Check if any update failed due to missing column
    for (const result of results) {
      if (result.error && result.error.code === '42703') {
        return NextResponse.json(
          { error: 'sort_order column not yet added. Run the migration in Supabase SQL editor.' },
          { status: 422 }
        )
      }
      if (result.error) {
        throw new Error(result.error.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reorder API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
