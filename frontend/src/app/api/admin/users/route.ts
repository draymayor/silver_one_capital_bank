import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseEnv, isAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }
    const authorized = await isAuthorizedAdmin(request)
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*, accounts(*)')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 })

    return NextResponse.json({ ok: true, users: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
