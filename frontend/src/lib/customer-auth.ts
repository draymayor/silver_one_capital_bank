import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

function getSupabaseAnonEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return null
  }

  return { supabaseUrl, anonKey }
}

export function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

export async function requireCustomerAuth(request: NextRequest) {
  const env = getSupabaseAnonEnv()
  const response = NextResponse.next()

  if (!env) {
    const unauthorized = NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    return { authorized: false as const, response: unauthorized }
  }

  const supabase = createServerClient(env.supabaseUrl, env.anonKey, {
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

  let { data } = await supabase.auth.getUser()

  if (!data.user) {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (accessToken) {
      const tokenClient = createClient(env.supabaseUrl, env.anonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const tokenUser = await tokenClient.auth.getUser()
      data = tokenUser.data
    }
  }

  const authUserId = data.user?.id
  if (!authUserId) {
    const unauthorized = NextResponse.json({ error: 'No active customer session found. Please sign in again.' }, { status: 401 })
    copyCookies(response, unauthorized)
    return { authorized: false as const, response: unauthorized }
  }

  return { authorized: true as const, response, authUserId }
}
