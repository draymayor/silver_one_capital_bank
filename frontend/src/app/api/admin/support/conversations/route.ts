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

    const [{ data: conversations, error: conversationsError }, { data: approvedUsers, error: usersError }] = await Promise.all([
      supabaseAdmin
        .from('support_conversations')
        .select('*, user_profiles:user_profile_id(id,user_id,full_name,email,status)')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabaseAdmin
        .from('user_profiles')
        .select('id,user_id,full_name,email,status')
        .in('status', ['active', 'suspended'])
        .order('created_at', { ascending: false })
        .limit(500),
    ])

    if (conversationsError || usersError) {
      return NextResponse.json({ error: 'Failed to fetch support data.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, conversations: conversations ?? [], approvedUsers: approvedUsers ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { userProfileId, subject, message } = await request.json()
    if (!userProfileId || typeof userProfileId !== 'string') {
      return NextResponse.json({ error: 'A target user is required.' }, { status: 400 })
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('support_conversations')
      .insert([{ user_profile_id: userProfileId, subject: subject?.trim() || 'Support Request', status: 'open' }])
      .select('*, user_profiles:user_profile_id(id,user_id,full_name,email,status)')
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Failed to create conversation.' }, { status: 500 })
    }

    if (typeof message === 'string' && message.trim()) {
      await supabaseAdmin
        .from('support_messages')
        .insert([{ conversation_id: conversation.id, sender_type: 'admin', message: message.trim(), is_read: false }])

      await supabaseAdmin
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
    }

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: 'support_conversation_created',
        entity_type: 'support_conversation',
        entity_id: conversation.id,
        admin_email: ADMIN_EMAIL,
        details: { user_profile_id: userProfileId },
      },
    ])

    return NextResponse.json({ ok: true, conversation })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
