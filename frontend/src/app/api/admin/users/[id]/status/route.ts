import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { status } = await request.json()
    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    const { error } = await auth.supabaseAdmin.from('user_profiles').update({ status }).eq('id', params.id)
    if (error) return NextResponse.json({ error: 'Failed to update user status.' }, { status: 500 })

    await auth.supabaseAdmin.from('audit_logs').insert([
      { action: 'user_status_change', entity_type: 'user_profile', entity_id: params.id, admin_email: auth.adminEmail, details: { status } },
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
