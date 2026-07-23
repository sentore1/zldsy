import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes each role can access
const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/admin'],
  manager: [
    '/admin/dashboard',
    '/admin/customers',
    '/admin/services',
    '/admin/bookings',
    '/admin/quotations',
    '/admin/jobs',
    '/admin/invoices',
    '/admin/payments',
    '/admin/staff',
    '/admin/inventory',
    '/admin/equipment',
    '/admin/reports',
  ],
  staff: [
    '/admin/dashboard',
    '/admin/jobs',
  ],
}

function canAccess(role: string, pathname: string): boolean {
  if (role === 'admin') return true
  const allowed = ROLE_ROUTES[role] ?? []
  return allowed.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fetch role from user_roles table
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = roleData?.role ?? 'staff'

  if (!canAccess(role, pathname)) {
    // Redirect to dashboard if they don't have access to the requested route
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Pass role via header so layout can read it without another DB call
  response.headers.set('x-user-role', role)
  response.headers.set('x-user-email', user.email ?? '')

  return response
}

export const config = {
  matcher: '/admin/:path*',
}
