import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const [logsRes, notesRes, openSupportRes] = await Promise.all([
      auth.supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      auth.supabaseAdmin.from('notifications').select('id,title,message,created_at').order('created_at', { ascending: false }).limit(20),
      auth.supabaseAdmin.from('support_conversations').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ])

    return NextResponse.json({
      ok: true,
      logs: logsRes.data ?? [],
      notifications: notesRes.data ?? [],
      open_support_count: openSupportRes.count ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
