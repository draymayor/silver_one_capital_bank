import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getSupabaseEnv, requireAuthorizedAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) {
      return adminAuth.response
    }

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch audit logs.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, logs: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
