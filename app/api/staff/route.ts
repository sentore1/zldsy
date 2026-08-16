import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('staff')
      .select('*')
      .order('name', { ascending: true })

    if (role) {
      query = query.eq('role', role)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Staff fetch error:', error)
      throw new Error('Failed to fetch staff')
    }

    return NextResponse.json({ staff: data || [] })
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
    
    // Extract password if provided
    const { password, ...staffData } = body
    let userId = null

    // If password is provided, create auth user first
    if (password && password.trim() !== '') {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: staffData.email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: staffData.name,
            role: staffData.role,
          }
        })

        if (authError) {
          console.error('Auth user creation error:', authError)
          throw new Error(`Failed to create user account: ${authError.message}`)
        }

        userId = authData.user.id
        console.log('✅ Created auth user:', userId)
      } catch (authErr: any) {
        console.error('Auth creation failed:', authErr)
        throw new Error(`Failed to create user account: ${authErr.message}`)
      }
    }

    // Create staff record (with or without user_id)
    const staffRecord = {
      ...staffData,
      user_id: userId, // Link to auth user if created
    }

    const query = supabase.from('staff') as any
    const { data, error } = await query
      .insert(staffRecord)
      .select()
      .single()

    if (error) {
      console.error('Staff creation error:', error)
      
      // If staff creation fails but auth user was created, we should clean up
      if (userId) {
        try {
          await supabase.auth.admin.deleteUser(userId)
          console.log('🧹 Cleaned up auth user after staff creation failure')
        } catch (cleanupErr) {
          console.error('Failed to cleanup auth user:', cleanupErr)
        }
      }
      
      throw new Error('Failed to create staff member')
    }

    console.log('✅ Created staff member:', data.id)
    return NextResponse.json({ staff: data }, { status: 201 })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
