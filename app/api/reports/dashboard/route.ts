import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const includeRecent = searchParams.get('include_recent') === 'true'

    // Execute all queries in parallel for faster loading
    const promises = [
      // Get jobs with only needed fields
      (async () => {
        let jobsQuery = supabase
          .from('jobs')
          .select('id, status, booking_id, created_at', { count: 'exact' })

        if (startDate) jobsQuery = jobsQuery.gte('created_at', startDate)
        if (endDate) jobsQuery = jobsQuery.lte('created_at', endDate)

        return jobsQuery
      })(),
      
      // Get invoices
      (async () => {
        let invoicesQuery = supabase
          .from('invoices')
          .select('final_amount, status')

        if (startDate) invoicesQuery = invoicesQuery.gte('created_at', startDate)
        if (endDate) invoicesQuery = invoicesQuery.lte('created_at', endDate)

        return invoicesQuery
      })(),
      
      // Get customer count only
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true }),
      
      // Get staff count only
      supabase
        .from('staff')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Get low stock items with database filtering
      supabase
        .rpc('get_low_stock_items')
        .limit(10)
    ]

    // Add recent jobs query if requested
    if (includeRecent) {
      promises.push(
        supabase
          .from('jobs')
          .select(`
            id,
            job_number,
            status,
            scheduled_date,
            booking:bookings(
              customer:customers(name),
              service:services(name)
            )
          `)
          .gte('created_at', startDate || new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })
          .limit(10)
      )
    }

    const results = await Promise.all(promises)
    
    const [
      jobsResult,
      invoicesResult,
      customersResult,
      staffResult,
      inventoryResult,
      recentJobsResult
    ] = results

    const { data: jobs, count: totalJobs, error: jobsError } = jobsResult
    if (jobsError) {
      console.error('Jobs query error:', jobsError)
      throw new Error(`Jobs query failed: ${jobsError.message}`)
    }

    const { data: invoices, error: invoicesError } = invoicesResult
    if (invoicesError) {
      console.error('Invoices query error:', invoicesError)
      throw new Error(`Invoices query failed: ${invoicesError.message}`)
    }

    const { count: totalCustomers } = customersResult
    const { count: totalStaff } = staffResult
    
    // Fallback to client-side filtering if RPC doesn't exist
    let lowStockItems: any[] = []
    let lowStockCount = 0
    
    if (inventoryResult.error?.code === '42883') {
      // RPC doesn't exist, fall back to client-side filtering
      const { data: allInventory } = await supabase
        .from('inventory')
        .select('id, name, quantity, reorder_level, category, unit')
        .eq('is_active', true)
        .limit(100) // Limit fetch size
      
      lowStockItems = allInventory?.filter(
        item => Number(item.quantity) < Number(item.reorder_level)
      ).slice(0, 10) || []
      lowStockCount = lowStockItems.length
    } else {
      lowStockItems = inventoryResult.data || []
      lowStockCount = lowStockItems.length
    }

    // Calculate jobs by status
    const jobsByStatus: Record<string, number> = {}
    jobs?.forEach((job: any) => {
      jobsByStatus[job.status] = (jobsByStatus[job.status] || 0) + 1
    })

    // Calculate revenue from invoices
    const totalRevenue = invoices?.filter((inv: any) => inv.status === 'paid')
      .reduce((sum: number, inv: any) => sum + (Number(inv.final_amount) || 0), 0) || 0
    const pendingRevenue = invoices?.filter((inv: any) => inv.status !== 'paid')
      .reduce((sum: number, inv: any) => sum + (Number(inv.final_amount) || 0), 0) || 0
    const totalExpenses = totalRevenue * 0.6
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

    const response = {
      overview: {
        totalJobs: totalJobs || 0,
        totalRevenue,
        pendingRevenue,
        totalCustomers: totalCustomers || 0,
        totalStaff: totalStaff || 0,
      },
      jobsByStatus: jobsByStatus || {},
      lowStockCount,
      lowStockItems,
      recentJobs: recentJobsResult?.data || undefined,
      financialData: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        laborCosts: Math.round(totalExpenses * 0.54),
        materialCosts: Math.round(totalExpenses * 0.29),
        equipmentCosts: Math.round(totalExpenses * 0.11),
        overheadCosts: Math.round(totalExpenses * 0.06),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
