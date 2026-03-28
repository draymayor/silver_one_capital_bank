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
    const auth = await getUserProfileIdFromBearer(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const isOwner = await validateConversationOwnership(params.id, auth.userProfileId)
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
    const auth = await getUserProfileIdFromBearer(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const isOwner = await validateConversationOwnership(params.id, auth.userProfileId)
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

    return NextResponse.json({ ok: true, message: data })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
