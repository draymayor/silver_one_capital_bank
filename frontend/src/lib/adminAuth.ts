import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const ADMIN_EMAIL = 'admin@silverunioncapital.com'

export async function requireAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { ok: false as const, status: 500, error: 'Server environment is missing Supabase configuration.' }
  }

  const adminToken = request.cookies.get('suc-admin-session')?.value
  if (!adminToken) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${adminToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await authClient.auth.getUser()
  if (error || data.user?.email !== ADMIN_EMAIL) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return { ok: true as const, supabaseAdmin, adminEmail: data.user.email }
}
