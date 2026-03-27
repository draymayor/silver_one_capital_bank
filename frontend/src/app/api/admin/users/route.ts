import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data: users, error } = await auth.supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 })

    const userIds = (users ?? []).map((u) => u.id)
    const { data: accounts } = userIds.length
      ? await auth.supabaseAdmin.from('accounts').select('*').in('user_profile_id', userIds)
      : { data: [] as any[] }

    const accountMap = new Map<string, any[]>()
    ;(accounts ?? []).forEach((a: any) => {
      accountMap.set(a.user_profile_id, [...(accountMap.get(a.user_profile_id) ?? []), a])
    })

    const rows = (users ?? []).map((u: any) => ({ ...u, accounts: accountMap.get(u.id) ?? [] }))
    return NextResponse.json({ ok: true, users: rows })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
