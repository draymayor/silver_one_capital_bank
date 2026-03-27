import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, getSupabaseEnv, isAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

function generateTemporaryPassword() {
  return `SUC!${Math.random().toString(36).slice(2, 10)}A1`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }
    const authorized = await isAuthorizedAdmin(request)
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id,user_id,auth_user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !profile) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    if (!profile.auth_user_id) return NextResponse.json({ error: 'No auth account linked for this user.' }, { status: 400 })

    const temporaryPassword = generateTemporaryPassword()
    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.auth_user_id, {
      password: temporaryPassword,
    })

    if (error) return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 })

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: 'user_password_reset',
        entity_type: 'user_profile',
        entity_id: params.id,
        admin_email: ADMIN_EMAIL,
        details: { user_id: profile.user_id },
      },
    ])

    return NextResponse.json({ ok: true, temporaryPassword })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
