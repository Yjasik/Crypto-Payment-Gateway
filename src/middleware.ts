import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all dashboard routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/admin') ||
      pathname.startsWith('/products') ||
      pathname.startsWith('/transactions') ||
      pathname.startsWith('/payouts') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/kyc') ||
      pathname.startsWith('/analytics') ||
      pathname.startsWith('/users')) {
    
    // Check for auth cookie or session token
    const isAuthenticated = request.cookies.get('auth_token')?.value

    // TEMPORARY: Allow all access during development
    // TODO: Replace with real auth check when ready
    if (!isAuthenticated) {
      // Allow access for now — skip redirect
      // return NextResponse.redirect(new URL('/', request.url))
      return NextResponse.next()
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

// Apply middleware to these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/products/:path*',
    '/transactions/:path*',
    '/payouts/:path*',
    '/settings/:path*',
    '/kyc/:path*',
    '/analytics/:path*',
    '/users/:path*',
  ],
}