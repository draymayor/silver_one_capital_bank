import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { copyCookies, requireCustomerAuth } from '@/lib/customer-auth'
import { sendWithdrawalCompletedEmail, sendWithdrawalSubmittedEmail } from '@/lib/email/notifications'

function getWithdrawalInsertError(error: { code?: string; message?: string; details?: string | null; hint?: string | null } | null | undefined) {
  if (!error) return 'Unable to submit withdrawal request at the moment.'

  if (error.code === '23503') return 'Unable to submit withdrawal request because your account link is invalid. Please refresh and try again.'
  if (error.code === '23514') return 'Unable to submit withdrawal request because one or more values did not pass validation.'
  if (error.code === '22P02') return 'Unable to submit withdrawal request because the submitted format is invalid.'

  return error.details || error.hint || error.message || 'Unable to submit withdrawal request at the moment.'
}

function generateCode(prefix: 'VAT' | 'TAX') {
  const value = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${value}`
}

function asCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

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

    const sanitizedBankName = typeof bankName === 'string' ? bankName.trim() : ''
    const sanitizedAccountNumber = typeof accountNumber === 'string' ? accountNumber.trim() : ''
    const sanitizedRoutingNumber = typeof routingNumber === 'string' ? routingNumber.trim() : ''
    const sanitizedMemo = typeof memo === 'string' ? memo.trim() || null : null

    if (!sanitizedBankName || !sanitizedAccountNumber || !sanitizedRoutingNumber) {
      return NextResponse.json({ error: 'Bank, account number, and routing number are required.' }, { status: 400 })
    }

    if (!/^\d{9}$/.test(sanitizedRoutingNumber)) {
      return NextResponse.json({ error: 'Routing number must be exactly 9 digits.' }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id,full_name,email')
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

    const vatCode = generateCode('VAT')
    const taxCode = generateCode('TAX')

    const { data: created, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert([
        {
          user_profile_id: profile.id,
          account_id: account.id,
          amount: parsedAmount,
          bank_name: sanitizedBankName,
          account_number: sanitizedAccountNumber,
          routing_number: sanitizedRoutingNumber,
          memo: sanitizedMemo,
          vat_code: vatCode,
          tax_code: taxCode,
          status: 'verification_required',
        },
      ])
      .select('*')
      .single()

    if (error || !created) {
      return NextResponse.json({ error: getWithdrawalInsertError(error) }, { status: 500 })
    }

    if (profile.email) {
      await sendWithdrawalSubmittedEmail({
        fullName: profile.full_name || 'Customer',
        email: profile.email,
        amount: asCurrency(parsedAmount),
      })
    }

    const response = NextResponse.json({ ok: true, request: created })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireCustomerAuth(request)
    if (!auth.authorized) return auth.response

    const { requestId, vatCode, taxCode } = await request.json()

    const sanitizedVatCode = typeof vatCode === 'string' ? vatCode.trim() : ''
    const sanitizedTaxCode = typeof taxCode === 'string' ? taxCode.trim() : ''

    if (!requestId || !sanitizedVatCode || !sanitizedTaxCode) {
      return NextResponse.json({ error: 'Withdrawal request and both verification codes are required.' }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id,full_name,email')
      .eq('auth_user_id', auth.authUserId)
      .single()

    if (!profile?.id) return NextResponse.json({ error: 'Unable to find your user profile.' }, { status: 404 })

    const { data: existing } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('id,status,amount,account_id,user_profile_id,vat_code,tax_code')
      .eq('id', requestId)
      .eq('user_profile_id', profile.id)
      .single()

    if (!existing?.id) return NextResponse.json({ error: 'Withdrawal request not found.' }, { status: 404 })
    if (existing.status === 'completed') return NextResponse.json({ error: 'This withdrawal request is already completed.' }, { status: 400 })

    if (sanitizedVatCode !== existing.vat_code || sanitizedTaxCode !== existing.tax_code) {
      return NextResponse.json({ error: 'The verification codes entered are invalid. Please check and try again.' }, { status: 400 })
    }

    const { data: account } = await supabaseAdmin.from('accounts').select('id,balance').eq('id', existing.account_id).single()
    if (!account?.id) return NextResponse.json({ error: 'Linked account not found.' }, { status: 404 })

    const nextBalance = Number((Number(account.balance || 0) - Number(existing.amount)).toFixed(2))
    if (nextBalance < 0) return NextResponse.json({ error: 'Insufficient balance to complete this withdrawal.' }, { status: 400 })

    const [{ error: balanceError }, { error: txError }, { data: updated, error: updateError }] = await Promise.all([
      supabaseAdmin.from('accounts').update({ balance: nextBalance }).eq('id', account.id),
      supabaseAdmin.from('transactions').insert([
        {
          user_profile_id: existing.user_profile_id,
          account_id: existing.account_id,
          amount: Number(existing.amount),
          transaction_type: 'withdrawal',
          direction: 'debit',
          description: 'Completed withdrawal after VAT/TAX verification',
          status: 'completed',
          withdrawal_request_id: existing.id,
          processed_at: new Date().toISOString(),
        },
      ]),
      supabaseAdmin
        .from('withdrawal_requests')
        .update({ status: 'completed', reviewed_at: new Date().toISOString(), reviewed_by: 'customer_verification' })
        .eq('id', existing.id)
        .select('*')
        .single(),
    ])

    if (balanceError || txError || updateError || !updated) {
      return NextResponse.json({ error: 'Unable to complete withdrawal request at this time.' }, { status: 500 })
    }

    if (profile.email) {
  try {
    await sendWithdrawalCompletedEmail({
      fullName: profile.full_name || 'Customer',
      email: profile.email,
      amount: asCurrency(Number(existing.amount)),
    })
  } catch (emailErr) {
    console.error('Failed to send withdrawal completed email:', emailErr)
  }
}

    const response = NextResponse.json({ ok: true, request: updated, message: 'Withdrawal verification successful. Your withdrawal request is now completed.' })
    copyCookies(auth.response, response)
    return response
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
