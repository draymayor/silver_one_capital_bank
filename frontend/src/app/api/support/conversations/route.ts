import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

async function getUserProfileIdFromBearer(request: NextRequest) {
  const env = getSupabaseEnv()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!env || !anonKey) return { error: 'Server environment is missing Supabase configuration.', status: 500 as const }

  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!accessToken) return { error: 'Missing access token.', status: 401 as const }

  const authClient = createClient(env.supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData } = await authClient.auth.getUser()
  const authUserId = userData.user?.id
  if (!authUserId) return { error: 'Invalid session.', status: 401 as const }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()

  if (!profile?.id) return { error: 'Unable to find your user profile.', status: 404 as const }

  return { userProfileId: profile.id }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserProfileIdFromBearer(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await supabaseAdmin
      .from('support_conversations')
      .select('*')
      .eq('user_profile_id', auth.userProfileId)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch support conversations.' }, { status: 500 })

    return NextResponse.json({ ok: true, conversations: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getUserProfileIdFromBearer(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { subject, message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('support_conversations')
      .insert([{ user_profile_id: auth.userProfileId, subject: subject?.trim() || 'Support Request', status: 'open' }])
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

    return NextResponse.json({ ok: true, conversation, message: firstMessage })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
