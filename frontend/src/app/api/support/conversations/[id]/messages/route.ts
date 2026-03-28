import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { copyCookies, requireCustomerAuth } from '@/lib/customer-auth'

async function validateConversationOwnership(conversationId: string, userProfileId: string) {
  const { data } = await supabaseAdmin
    .from('support_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_profile_id', userProfileId)
    .single()

  return Boolean(data?.id)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireCustomerAuth(request)
    if (!auth.authorized) return auth.response

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', auth.authUserId)
      .single()

    if (!profile?.id) return NextResponse.json({ error: 'Unable to find your user profile.' }, { status: 404 })

    const isOwner = await validateConversationOwnership(params.id, profile.id)
    if (!isOwner) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })

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
      .eq('sender_type', 'admin')

    const response = NextResponse.json({ ok: true, messages: data ?? [] })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireCustomerAuth(request)
    if (!auth.authorized) return auth.response

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', auth.authUserId)
      .single()

    if (!profile?.id) return NextResponse.json({ error: 'Unable to find your user profile.' }, { status: 404 })

    const isOwner = await validateConversationOwnership(params.id, profile.id)
    if (!isOwner) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })

    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .insert([{ conversation_id: params.id, sender_type: 'customer', message: message.trim(), is_read: false }])
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })

    await supabaseAdmin
      .from('support_conversations')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    const response = NextResponse.json({ ok: true, message: data })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
