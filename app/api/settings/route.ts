import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Settings fetch error:', error)
      throw new Error('Failed to fetch settings')
    }

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        settings: {
          company_name: '',
          company_email: '',
          company_phone: '',
          company_address: '',
          tax_rate: 0,
          currency: 'USD',
          timezone: 'UTC',
          quotation_validity_days: 30,
          invoice_due_days: 30,
        }
      })
    }

    return NextResponse.json({ settings })
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

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .single()

    let result;
    if (existing) {
      // Update existing settings
      result = await supabase
        .from('system_settings')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Insert new settings
      result = await supabase
        .from('system_settings')
        .insert(body)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Settings save error:', result.error)
      throw new Error('Failed to save settings')
    }

    return NextResponse.json({ settings: result.data })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
