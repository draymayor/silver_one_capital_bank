import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(request: NextRequest, { params }: { params: { accountId: string } }) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { amount, note } = await request.json()
    const delta = Number(amount)
    if (!Number.isFinite(delta) || delta === 0) {
      return NextResponse.json({ error: 'A non-zero numeric amount is required.' }, { status: 400 })
    }

    const { data: account, error: getError } = await auth.supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', params.accountId)
      .single()

    if (getError || !account) return NextResponse.json({ error: 'Account not found.' }, { status: 404 })

    const newBalance = Number(account.balance) + delta
    const { error: updateError } = await auth.supabaseAdmin
      .from('accounts')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', params.accountId)

    if (updateError) return NextResponse.json({ error: 'Failed to update balance.' }, { status: 500 })

    await auth.supabaseAdmin.from('audit_logs').insert([
      {
        action: 'admin_balance_adjustment',
        entity_type: 'account',
        entity_id: params.accountId,
        admin_email: auth.adminEmail,
        details: { delta, previous_balance: Number(account.balance), new_balance: newBalance, note: note ?? '' },
      },
    ])

    return NextResponse.json({ ok: true, balance: newBalance })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
