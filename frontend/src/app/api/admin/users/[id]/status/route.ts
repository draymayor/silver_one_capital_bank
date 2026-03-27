import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, getSupabaseEnv, requireAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

const allowedStatuses = new Set(['active', 'suspended', 'deactivated'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }
    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { status } = await request.json()
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid status update request.' }, { status: 400 })
    }

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id,user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !profile) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: 'Failed to update user status.' }, { status: 500 })

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: `user_${status}`,
        entity_type: 'user_profile',
        entity_id: params.id,
        admin_email: ADMIN_EMAIL,
        details: { user_id: profile.user_id },
      },
    ])

    return NextResponse.json({ ok: true, status })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
