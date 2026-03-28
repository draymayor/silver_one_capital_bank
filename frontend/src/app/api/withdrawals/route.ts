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
      .from('withdrawal_requests')
      .select('*')
      .eq('user_profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to load withdrawal requests.' }, { status: 500 })

    const response = NextResponse.json({ ok: true, requests: data ?? [] })
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

    const { amount, bankName, accountNumber, routingNumber, memo } = await request.json()

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid withdrawal amount.' }, { status: 400 })
    }

    if (!bankName || !accountNumber || !routingNumber) {
      return NextResponse.json({ error: 'Bank, account number, and routing number are required.' }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', auth.authUserId)
      .single()

    if (!profile?.id) return NextResponse.json({ error: 'Unable to find your user profile.' }, { status: 404 })

    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('id,balance')
      .eq('user_profile_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!account?.id) return NextResponse.json({ error: 'No active account found.' }, { status: 404 })

    const availableBalance = Number(account.balance || 0)
    if (parsedAmount > availableBalance) {
      return NextResponse.json({ error: 'Withdrawal amount exceeds your available balance.' }, { status: 400 })
    }

    const { data: created, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert([
        {
          user_profile_id: profile.id,
          account_id: account.id,
          amount: parsedAmount,
          bank_name: String(bankName).trim(),
          account_number: String(accountNumber).trim(),
          routing_number: String(routingNumber).trim(),
          memo: typeof memo === 'string' ? memo.trim() || null : null,
          status: 'pending',
        },
      ])
      .select('*')
      .single()

    if (error || !created) return NextResponse.json({ error: 'Unable to submit withdrawal request right now.' }, { status: 500 })

    const response = NextResponse.json({ ok: true, request: created })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
