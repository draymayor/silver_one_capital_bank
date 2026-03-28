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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if ((pathname.startsWith('/dashboard')) || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login'))) {
    if (!supabaseUrl || !anonKey) {
      const redirectTarget = pathname.startsWith('/admin') ? '/admin/login?error=server_config_missing' : '/sign-in?error=session_expired'
      return NextResponse.redirect(new URL(redirectTarget, request.url))
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
      const redirectTarget = pathname.startsWith('/admin') ? '/admin/login?error=session_expired' : '/sign-in?error=session_expired'
      const redirect = NextResponse.redirect(new URL(redirectTarget, request.url))
      clearStaleAdminCookies(request, redirect)
      return redirect
    }

    if (pathname.startsWith('/dashboard')) {
      if (user.email === ADMIN_EMAIL) {
        await supabase.auth.signOut()
        const redirect = NextResponse.redirect(new URL('/sign-in?error=customer_required', request.url))
        clearStaleAdminCookies(request, redirect)
        return redirect
      }

      return response
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
