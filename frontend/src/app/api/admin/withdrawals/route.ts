import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, getSupabaseEnv, requireAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { data, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*, user_profiles:user_profile_id(id,user_id,full_name,email), accounts:account_id(id,account_number,account_type,balance)')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch withdrawal requests.' }, { status: 500 })

    return NextResponse.json({ ok: true, requests: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { requestId, status } = await request.json()
    if (!requestId || !['rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request update.' }, { status: 400 })
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('id,amount,status,account_id,user_profile_id')
      .eq('id', requestId)
      .single()

    if (existingError || !existing) return NextResponse.json({ error: 'Withdrawal request not found.' }, { status: 404 })
    if (!['pending', 'verification_required'].includes(existing.status)) {
      return NextResponse.json({ error: 'This request has already been processed.' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('withdrawal_requests')
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: ADMIN_EMAIL })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (updateError || !updated) return NextResponse.json({ error: 'Failed to update withdrawal request.' }, { status: 500 })

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: `withdrawal_${status}`,
        entity_type: 'withdrawal_request',
        entity_id: existing.id,
        admin_email: ADMIN_EMAIL,
        details: { amount: existing.amount, user_profile_id: existing.user_profile_id },
      },
    ])

    return NextResponse.json({ ok: true, request: updated })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
