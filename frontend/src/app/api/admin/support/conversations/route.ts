import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseEnv, requireAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { data, error } = await supabaseAdmin
      .from('support_conversations')
      .select('*, user_profiles:user_profile_id(id,user_id,full_name,email)')
      .order('updated_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch support conversations.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, conversations: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
