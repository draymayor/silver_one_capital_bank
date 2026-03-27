import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { note } = await request.json()
    if (!note || !String(note).trim()) {
      return NextResponse.json({ error: 'Note is required.' }, { status: 400 })
    }

    const { error } = await auth.supabaseAdmin
      .from('admin_notes')
      .insert([{ application_id: params.id, note: String(note).trim(), admin_email: auth.adminEmail }])

    if (error) return NextResponse.json({ error: 'Failed to add note.' }, { status: 500 })

    await auth.supabaseAdmin.from('audit_logs').insert([
      { action: 'admin_note_added', entity_type: 'application', entity_id: params.id, admin_email: auth.adminEmail, details: {} },
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
