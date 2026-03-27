import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAIL = 'admin@silverunioncapital.com'

function getSupabaseAnonEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return null
  }

  return { supabaseUrl, anonKey }
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

function clearStaleAdminCookies(request: NextRequest, response: NextResponse) {
  const cookieNames = request.cookies
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name === 'suc-admin-session' || (name.startsWith('sb-') && name.includes('-auth-token')))

  cookieNames.forEach((name) => {
    response.cookies.set(name, '', { maxAge: 0, path: '/' })
  })
}

async function resolveAdminUser(request: NextRequest) {
  const supabaseEnv = getSupabaseAnonEnv()
  const response = NextResponse.next()

  if (!supabaseEnv) {
    return { response, user: null, error: 'Server environment is missing Supabase configuration.' }
  }

  const supabase = createServerClient(supabaseEnv.supabaseUrl, supabaseEnv.anonKey, {
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
  if (error || !data.user) {
    clearStaleAdminCookies(request, response)
    return {
      response,
      user: null,
      error: error?.message || 'No active admin session found. Please sign in again.',
    }
  }

  if (data.user.email !== ADMIN_EMAIL) {
    await supabase.auth.signOut()
    clearStaleAdminCookies(request, response)
    return { response, user: null, error: 'This account does not have admin privileges.' }
  }

  return { response, user: data.user, error: null }
}

export async function isAuthorizedAdmin(request: NextRequest) {
  const { user } = await resolveAdminUser(request)
  return Boolean(user)
}

export async function requireAuthorizedAdmin(request: NextRequest) {
  const { response, user, error } = await resolveAdminUser(request)

  if (!user) {
    const unauthorizedResponse = NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    copyCookies(response, unauthorizedResponse)
    return { authorized: false as const, response: unauthorizedResponse }
  }

  return { authorized: true as const, response, user }
}

export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return { supabaseUrl, serviceRoleKey }
}

export { ADMIN_EMAIL }
