import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, getSupabaseEnv, isAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

const allowedStatuses = new Set(['open', 'closed'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }
    const authorized = await isAuthorizedAdmin(request)
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status } = await request.json()
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid status update request.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('support_conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: 'Failed to update conversation status.' }, { status: 500 })

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: `support_conversation_${status}`,
        entity_type: 'support_conversation',
        entity_id: params.id,
        admin_email: ADMIN_EMAIL,
        details: {},
      },
    ])

    return NextResponse.json({ ok: true, status })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
