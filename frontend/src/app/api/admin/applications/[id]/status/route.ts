import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUserId } from '@/lib/utils'
import { ADMIN_EMAIL, requireAuthorizedAdmin } from '@/lib/admin-auth'

const allowedStatuses = new Set(['under_review', 'approved', 'rejected'])

function generateAccountNumber() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000))
}

function generateTemporaryPassword() {
  return `SUC!${Math.random().toString(36).slice(2, 10)}A1`
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const adminAuth = await requireAuthorizedAdmin(request)
    if (!adminAuth.authorized) {
      return adminAuth.response
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
    let temporaryPassword: string | null = null

    if (status === 'approved') {
      const existingProfile = await supabaseAdmin
        .from('user_profiles')
        .select('id,user_id')
        .eq('application_id', applicationId)
        .maybeSingle()

      userId = existingProfile.data?.user_id ?? application.step_data?.auth?.userId ?? generateUserId()

      if (!existingProfile.data) {
        const authUserId = application.step_data?.auth?.authUserId as string | undefined
        const finalLoginEmail = `${userId}@silverunioncapital.com`
        const fullName = `${application.step_data?.personal?.firstName ?? ''} ${application.step_data?.personal?.lastName ?? ''}`.trim() || 'Customer'

        let resolvedAuthUserId = authUserId
        if (resolvedAuthUserId) {
          const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(resolvedAuthUserId, {
            email: finalLoginEmail,
            email_confirm: true,
            user_metadata: { user_id: userId, full_name: fullName },
          })

          if (updateAuthError) {
            resolvedAuthUserId = undefined
          }
        }

        if (!resolvedAuthUserId) {
          temporaryPassword = generateTemporaryPassword()
          const { data: createdAuth, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: finalLoginEmail,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: { user_id: userId, full_name: fullName },
          })

          if (createAuthError || !createdAuth.user) {
            return NextResponse.json({ error: 'Failed to create customer auth account.' }, { status: 500 })
          }

          resolvedAuthUserId = createdAuth.user.id
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert([
            {
              user_id: userId,
              full_name: fullName,
              email: application.step_data?.contact?.email ?? finalLoginEmail,
              phone: application.step_data?.contact?.phone ?? '',
              status: 'active',
              application_id: applicationId,
              auth_user_id: resolvedAuthUserId,
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

    return NextResponse.json({ ok: true, status, userId, temporaryPassword })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
