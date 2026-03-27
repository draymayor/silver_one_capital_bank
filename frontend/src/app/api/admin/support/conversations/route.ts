import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data: conversations, error } = await auth.supabaseAdmin
      .from('support_conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch conversations.' }, { status: 500 })

    const conversationIds = (conversations ?? []).map((c) => c.id)
    const profileIds = (conversations ?? []).map((c) => c.user_profile_id).filter(Boolean)

    const [{ data: profiles }, { data: unread }, { data: latest }] = await Promise.all([
      profileIds.length
        ? auth.supabaseAdmin.from('user_profiles').select('id,full_name,user_id,email').in('id', profileIds)
        : Promise.resolve({ data: [] as any[] }),
      conversationIds.length
        ? auth.supabaseAdmin.from('support_messages').select('conversation_id', { count: 'exact' }).in('conversation_id', conversationIds).eq('sender_type', 'customer').eq('is_read', false)
        : Promise.resolve({ data: [] as any[] }),
      conversationIds.length
        ? auth.supabaseAdmin.from('support_messages').select('conversation_id,message,created_at,sender_type').in('conversation_id', conversationIds).order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
    ])

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
    const unreadMap = new Map<string, number>()
    ;(unread ?? []).forEach((m: any) => unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1))

    const latestMap = new Map<string, any>()
    ;(latest ?? []).forEach((m: any) => {
      if (!latestMap.has(m.conversation_id)) latestMap.set(m.conversation_id, m)
    })

    const rows = (conversations ?? []).map((c: any) => ({
      ...c,
      profile: profileMap.get(c.user_profile_id) ?? null,
      unread_count: unreadMap.get(c.id) ?? 0,
      latest_message: latestMap.get(c.id) ?? null,
    }))

    return NextResponse.json({ ok: true, conversations: rows })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
