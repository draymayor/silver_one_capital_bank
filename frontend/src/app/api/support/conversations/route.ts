import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { copyCookies, requireCustomerAuth } from '@/lib/customer-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireCustomerAuth(request)
    if (!auth.authorized) return auth.response

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', auth.authUserId)
      .single()

    if (!profile?.id) return NextResponse.json({ error: 'Unable to find your user profile.' }, { status: 404 })

    const { data, error } = await supabaseAdmin
      .from('support_conversations')
      .select('*')
      .eq('user_profile_id', profile.id)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch support conversations.' }, { status: 500 })

    const response = NextResponse.json({ ok: true, conversations: data ?? [] })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireCustomerAuth(request)
    if (!auth.authorized) return auth.response

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', auth.authUserId)
      .single()

    if (!profile?.id) return NextResponse.json({ error: 'Unable to find your user profile.' }, { status: 404 })

    const { subject, message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('support_conversations')
      .insert([{ user_profile_id: profile.id, subject: subject?.trim() || 'Support Request', status: 'open' }])
      .select('*')
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Failed to create support conversation.' }, { status: 500 })
    }

    const { data: firstMessage, error: messageError } = await supabaseAdmin
      .from('support_messages')
      .insert([{ conversation_id: conversation.id, sender_type: 'customer', message: message.trim(), is_read: false }])
      .select('*')
      .single()

    if (messageError) {
      return NextResponse.json({ error: 'Failed to send first support message.' }, { status: 500 })
    }

    const response = NextResponse.json({ ok: true, conversation, message: firstMessage })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
