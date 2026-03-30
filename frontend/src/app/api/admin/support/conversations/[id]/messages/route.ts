import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, getSupabaseEnv, requireAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendSupportReplyNotification } from '@/lib/email/notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }
    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch messages.' }, { status: 500 })

    await supabaseAdmin
      .from('support_messages')
      .update({ is_read: true })
      .eq('conversation_id', params.id)
      .eq('sender_type', 'customer')

    return NextResponse.json({ ok: true, messages: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }
    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const sanitizedMessage = message.trim()

    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .insert([{ conversation_id: params.id, sender_type: 'admin', message: sanitizedMessage, is_read: false }])
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })

    await supabaseAdmin
      .from('support_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id)

    const { data: conversation } = await supabaseAdmin
      .from('support_conversations')
      .select('id,user_profile_id,user_profiles:user_profile_id(full_name,email)')
      .eq('id', params.id)
      .single()

    const { data: latestCustomerMessage } = await supabaseAdmin
      .from('support_messages')
      .select('message')
      .eq('conversation_id', params.id)
      .eq('sender_type', 'customer')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const profile = conversation?.user_profiles as { full_name?: string | null; email?: string | null } | null
    if (profile?.email) {
      await sendSupportReplyNotification({
        fullName: profile.full_name || 'Customer',
        email: profile.email,
        supportMessage: sanitizedMessage,
        customerMessage: latestCustomerMessage?.message || null,
      })
    }

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: 'support_reply',
        entity_type: 'support_conversation',
        entity_id: params.id,
        admin_email: ADMIN_EMAIL,
        details: { message_id: data.id },
      },
    ])

    return NextResponse.json({ ok: true, message: data })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
