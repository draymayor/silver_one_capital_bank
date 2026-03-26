import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check dashboard routes — require customer session cookie
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('suc-session')
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Check admin routes — require admin session cookie
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminCookie = request.cookies.get('suc-admin-session')
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
