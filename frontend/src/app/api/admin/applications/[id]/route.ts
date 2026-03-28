import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuthorizedAdmin } from '@/lib/admin-auth'

export async function GET(
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

    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', params.id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    }

    const { data: docs } = await supabaseAdmin
      .from('kyc_documents')
      .select('*')
      .eq('application_id', params.id)

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('application_id', params.id)
      .maybeSingle()

    return NextResponse.json({ ok: true, application: { ...application, user_id: profile?.user_id ?? null }, docs: docs ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
