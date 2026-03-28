import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUserId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await request.json()
    const { stepData, password, docs } = body as {
      stepData: Record<string, any>
      password: string
      docs?: Array<{ document_type: string; file_name: string; storage_path: string }>
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const userId = generateUserId()
    const tempEmail = `${userId}@silverunioncapital.com`
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password,
      email_confirm: true,
      user_metadata: {
        onboarding_email: stepData?.contact?.email ?? '',
      },
    })

    if (authError || !authUser.user) {
      return NextResponse.json({ error: 'Failed to create pending auth account.' }, { status: 500 })
    }

    const safeStepData = {
      ...stepData,
      auth: {
        authUserId: authUser.user.id,
        onboardingEmail: stepData?.contact?.email ?? null,
        userId,
      },
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert([{ status: 'submitted', step_data: safeStepData }])
      .select('id')
      .single()

    if (error || !data?.id) {
      return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 })
    }

    let documentsSaved = true
    if (Array.isArray(docs) && docs.length > 0) {
      const rows = docs.map((doc) => ({ ...doc, application_id: data.id }))
      const { error: docsError } = await supabaseAdmin.from('kyc_documents').insert(rows)
      if (docsError) {
        documentsSaved = false
      }
    }

    return NextResponse.json({ ok: true, id: data.id, userId, documentsSaved })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
