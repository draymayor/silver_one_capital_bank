import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAIL = 'admin@silverunioncapital.com'

function clearStaleAdminCookies(request: NextRequest, response: NextResponse) {
  const cookieNames = request.cookies
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name === 'suc-admin-session' || (name.startsWith('sb-') && name.includes('-auth-token')))

  cookieNames.forEach((name) => {
    response.cookies.set(name, '', { maxAge: 0, path: '/' })
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check dashboard routes — require customer session cookie
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('suc-session')
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.redirect(new URL('/admin/login?error=server_config_missing', request.url))
    }

    const response = NextResponse.next()
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data, error } = await supabase.auth.getUser()
    const user = data.user

    if (error || !user) {
      const redirect = NextResponse.redirect(new URL('/admin/login?error=session_expired', request.url))
      clearStaleAdminCookies(request, redirect)
      return redirect
    }

    if (user.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut()
      const redirect = NextResponse.redirect(new URL('/admin/login?error=admin_required', request.url))
      clearStaleAdminCookies(request, redirect)
      return redirect
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
