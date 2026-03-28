import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, getSupabaseEnv, requireAuthorizedAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/server'

const CREDIT_TYPES = new Set(['deposit', 'interest', 'refund', 'credit_adjustment'])
const DEBIT_TYPES = new Set(['withdrawal', 'fee', 'debit_adjustment'])

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    if (!getSupabaseEnv()) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) return adminAuth.response

    const { amount, type, description } = await request.json()
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero.' }, { status: 400 })
    }

    if (!CREDIT_TYPES.has(type) && !DEBIT_TYPES.has(type)) {
      return NextResponse.json({ error: 'Unsupported transaction type.' }, { status: 400 })
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id,balance')
      .eq('user_profile_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (accountError) {
      return NextResponse.json({ error: 'Failed to load user account.' }, { status: 500 })
    }

    if (!account?.id) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 })
    }

    const delta = CREDIT_TYPES.has(type) ? parsedAmount : -parsedAmount
    const currentBalance = Number(account.balance || 0)
    const nextBalance = Number((currentBalance + delta).toFixed(2))

    if (nextBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance for this transaction.' }, { status: 400 })
    }

    const [{ data: transaction, error: txError }, { error: updateError }] = await Promise.all([
      supabaseAdmin
        .from('transactions')
        .insert([
          {
            user_profile_id: params.id,
            account_id: account.id,
            amount: parsedAmount,
            transaction_type: type,
            direction: delta >= 0 ? 'credit' : 'debit',
            description: typeof description === 'string' ? description.trim() || null : null,
            status: 'completed',
            processed_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .single(),
      supabaseAdmin.from('accounts').update({ balance: nextBalance }).eq('id', account.id),
    ])

    if (txError || updateError || !transaction) {
      return NextResponse.json({ error: 'Failed to add transaction.' }, { status: 500 })
    }

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: 'transaction_added',
        entity_type: 'user_profile',
        entity_id: params.id,
        admin_email: ADMIN_EMAIL,
        details: { transaction_id: transaction.id, type, amount: parsedAmount },
      },
    ])

    return NextResponse.json({ ok: true, transaction, balance: nextBalance })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
