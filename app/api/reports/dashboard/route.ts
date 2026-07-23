import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    console.log('Reports API - Date range:', { startDate, endDate })

    // Get total jobs with date filtering
    let jobsQuery = supabase
      .from('jobs')
      .select('*', { count: 'exact' })

    if (startDate) jobsQuery = jobsQuery.gte('created_at', startDate)
    if (endDate) jobsQuery = jobsQuery.lte('created_at', endDate)

    const { data: jobs, count: totalJobs, error: jobsError } = await jobsQuery
    
    if (jobsError) {
      console.error('Jobs query error:', jobsError)
      throw new Error(`Jobs query failed: ${jobsError.message}`)
    }

    console.log('Jobs fetched:', totalJobs)

    // Get bookings with services for completed jobs
    const jobIds = jobs?.map(j => j.id) || []
    let bookingsData: any[] = []
    
    if (jobIds.length > 0) {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          service:services(name, base_price)
        `)
        .in('id', jobs.map(j => j.booking_id).filter(Boolean))
      
      if (bookingsError) {
        console.error('Bookings query error:', bookingsError)
      } else {
        bookingsData = bookings || []
      }
    }

    // Get job staff assignments
    let jobStaffData: any[] = []
    
    if (jobIds.length > 0) {
      const { data: jobStaff, error: jobStaffError } = await supabase
        .from('job_staff')
        .select(`
          job_id,
          staff:staff(id, name),
          hours_worked,
          labor_cost
        `)
        .in('job_id', jobIds)
      
      if (jobStaffError) {
        console.error('Job staff query error:', jobStaffError)
      } else {
        jobStaffData = jobStaff || []
      }
    }

    // Calculate jobs by status
    const jobsByStatus: Record<string, number> = {}
    jobs?.forEach((job: any) => {
      jobsByStatus[job.status] = (jobsByStatus[job.status] || 0) + 1
    })

    // Get revenue data from invoices
    let invoicesQuery = supabase
      .from('invoices')
      .select('final_amount, status, created_at')

    if (startDate) invoicesQuery = invoicesQuery.gte('created_at', startDate)
    if (endDate) invoicesQuery = invoicesQuery.lte('created_at', endDate)

    const { data: invoices, error: invoicesError } = await invoicesQuery
    
    if (invoicesError) {
      console.error('Invoices query error:', invoicesError)
      throw new Error(`Invoices query failed: ${invoicesError.message}`)
    }

    console.log('Invoices fetched:', invoices?.length || 0)

    const totalRevenue = invoices
      ?.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.final_amount), 0) || 0

    const pendingRevenue = invoices
      ?.filter(i => ['pending', 'sent'].includes(i.status))
      .reduce((sum, i) => sum + Number(i.final_amount), 0) || 0

    // Calculate expenses (estimated at 62% of revenue)
    const totalExpenses = Math.round(totalRevenue * 0.62)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

    // Get customer count
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
    
    if (customersError) {
      console.error('Customers query error:', customersError)
    }

    // Get staff count
    const { count: totalStaff, error: staffError } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (staffError) {
      console.error('Staff query error:', staffError)
    }

    // Get low stock items (filter in code since Supabase doesn't support column comparison easily)
    const { data: allInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_active', true)
    
    if (inventoryError) {
      console.error('Inventory query error:', inventoryError)
    }
    
    const lowStockItems = allInventory?.filter(
      item => Number(item.quantity) < Number(item.reorder_level)
    ) || []

    // Calculate top services from completed jobs
    const serviceStats: Record<string, { name: string; jobs: number; revenue: number }> = {}
    
    // Create a map of booking_id to service data
    const bookingMap = new Map()
    bookingsData.forEach(booking => {
      bookingMap.set(booking.id, booking)
    })
    
    jobs?.forEach((job: any) => {
      if (job.booking_id && job.status === 'completed') {
        const booking = bookingMap.get(job.booking_id)
        if (booking?.service) {
          const serviceName = booking.service.name || 'Unknown Service'
          const servicePrice = Number(booking.service.base_price) || 0
          
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = { name: serviceName, jobs: 0, revenue: 0 }
          }
          serviceStats[serviceName].jobs++
          serviceStats[serviceName].revenue += servicePrice
        }
      }
    })

    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate staff performance from job_staff records
    const staffStats: Record<string, { name: string; jobs: number; hours: number; revenue: number }> = {}
    
    // Group job staff data by job
    const jobStaffMap = new Map<string, any[]>()
    jobStaffData.forEach(assignment => {
      if (!jobStaffMap.has(assignment.job_id)) {
        jobStaffMap.set(assignment.job_id, [])
      }
      jobStaffMap.get(assignment.job_id)!.push(assignment)
    })
    
    jobs?.forEach((job: any) => {
      const assignments = jobStaffMap.get(job.id) || []
      if (assignments.length > 0 && job.status === 'completed') {
        assignments.forEach((assignment: any) => {
          if (assignment.staff) {
            const staffId = assignment.staff.id
            const staffName = assignment.staff.name
            const hoursWorked = Number(assignment.hours_worked) || 0
            const laborCost = Number(assignment.labor_cost) || 0
            
            if (!staffStats[staffId]) {
              staffStats[staffId] = {
                name: staffName,
                jobs: 0,
                hours: 0,
                revenue: 0
              }
            }
            
            // Count each job once per staff member
            staffStats[staffId].jobs++
            staffStats[staffId].hours += hoursWorked
            staffStats[staffId].revenue += laborCost
          }
        })
      }
    })

    const staffPerformance = Object.values(staffStats)
      .filter(s => s.jobs > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const response = {
      overview: {
        totalJobs: totalJobs || 0,
        totalRevenue,
        pendingRevenue,
        totalCustomers: totalCustomers || 0,
        totalStaff: totalStaff || 0,
      },
      jobsByStatus: jobsByStatus || {},
      lowStockCount: lowStockItems?.length || 0,
      lowStockItems: lowStockItems || [],
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
      topServices: topServices.length > 0 ? topServices : undefined,
      staffPerformance: staffPerformance.length > 0 ? staffPerformance : undefined,
    }

    console.log('Reports API - Response summary:', {
      totalJobs: response.overview.totalJobs,
      totalRevenue: response.overview.totalRevenue,
      topServicesCount: topServices.length,
      staffPerformanceCount: staffPerformance.length
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
