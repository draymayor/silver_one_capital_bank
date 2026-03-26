import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUserId } from '@/lib/utils'

const ADMIN_EMAIL = 'admin@silverunioncapital.com'
const allowedStatuses = new Set(['under_review', 'approved', 'rejected'])

function generateAccountNumber() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000))
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminCookie = request.cookies.get('suc-admin-session')
    if (!adminCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { status } = await request.json()

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid status update request.' }, { status: 400 })
    }

    const applicationId = params.id

    const { data: application, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    }

    let userId: string | null = null

    if (status === 'approved') {
      const existingProfile = await supabaseAdmin
        .from('user_profiles')
        .select('id,user_id')
        .eq('application_id', applicationId)
        .maybeSingle()

      userId = existingProfile.data?.user_id ?? generateUserId()

      if (!existingProfile.data) {
        const generatedEmail = `${userId}@silverunioncapital.com`
        const loginPassword = application.password_hash || `${Math.random().toString(36).slice(2)}A1!`

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: generatedEmail,
          password: loginPassword,
          email_confirm: true,
          user_metadata: {
            user_id: userId,
            full_name: `${application.step_data?.personal?.firstName ?? ''} ${application.step_data?.personal?.lastName ?? ''}`.trim(),
          },
        })

        if (authError || !authUser.user) {
          return NextResponse.json({ error: 'Failed to create customer auth account.' }, { status: 500 })
        }

        const fullName = `${application.step_data?.personal?.firstName ?? ''} ${application.step_data?.personal?.lastName ?? ''}`.trim() || 'Customer'

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert([
            {
              user_id: userId,
              full_name: fullName,
              email: application.step_data?.contact?.email ?? generatedEmail,
              phone: application.step_data?.contact?.phone ?? '',
              status: 'active',
              application_id: applicationId,
              auth_user_id: authUser.user.id,
            },
          ])
          .select('id')
          .single()

        if (profileError || !profile) {
          return NextResponse.json({ error: 'Failed to create user profile.' }, { status: 500 })
        }

        const { error: accountError } = await supabaseAdmin.from('accounts').insert([
          {
            user_profile_id: profile.id,
            account_number: generateAccountNumber(),
            account_type: application.step_data?.accountDetails?.accountType || 'checking',
            balance: 0,
            status: 'active',
          },
        ])

        if (accountError) {
          return NextResponse.json({ error: 'Failed to create default account.' }, { status: 500 })
        }

        const { error: notificationError } = await supabaseAdmin.from('notifications').insert([
          {
            user_profile_id: profile.id,
            title: 'Account Approved',
            message: `Your account was approved. Your User ID is ${userId}.`,
            notification_type: 'success',
          },
        ])

        if (notificationError) {
          return NextResponse.json({ error: 'Failed to create approval notification.' }, { status: 500 })
        }
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)

    if (updateError) {
      return NextResponse.json({ error: 'Unable to update application status.' }, { status: 500 })
    }

    await supabaseAdmin.from('audit_logs').insert([
      {
        action: `application_${status}`,
        entity_type: 'application',
        entity_id: applicationId,
        admin_email: ADMIN_EMAIL,
        details: userId ? { user_id: userId } : {},
      },
    ])

    return NextResponse.json({ ok: true, status, userId })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
