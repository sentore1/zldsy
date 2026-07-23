import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic query
    const { data: jobs, error: jobsError, count } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
    
    if (jobsError) {
      console.error('Jobs query error:', jobsError)
      return NextResponse.json({ 
        success: false, 
        error: jobsError.message,
        details: jobsError 
      }, { status: 500 })
    }
    
    console.log('Jobs count:', count)
    
    // Test customers
    const { count: customersCount, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true })
    
    if (customersError) {
      console.error('Customers query error:', customersError)
    }
    
    // Test services
    const { count: servicesCount, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    if (servicesError) {
      console.error('Services query error:', servicesError)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection working',
      counts: {
        jobs: count || 0,
        customers: customersCount || 0,
        services: servicesCount || 0
      }
    })
  } catch (error: any) {
    console.error('Test API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
