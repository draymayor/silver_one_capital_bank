import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data: messages, error } = await auth.supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to load messages.' }, { status: 500 })

    await auth.supabaseAdmin
      .from('support_messages')
      .update({ is_read: true })
      .eq('conversation_id', params.id)
      .eq('sender_type', 'customer')
      .eq('is_read', false)

    return NextResponse.json({ ok: true, messages: messages ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { message } = await request.json()
    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const { data, error } = await auth.supabaseAdmin
      .from('support_messages')
      .insert([{ conversation_id: params.id, sender_type: 'admin', message: String(message).trim(), is_read: false }])
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })

    await auth.supabaseAdmin
      .from('support_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id)

    await auth.supabaseAdmin.from('audit_logs').insert([
      {
        action: 'support_reply',
        entity_type: 'support_conversation',
        entity_id: params.id,
        admin_email: auth.adminEmail,
        details: { message_length: String(message).trim().length },
      },
    ])

    return NextResponse.json({ ok: true, message: data })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
