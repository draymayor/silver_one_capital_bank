import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'admin@silverunioncapital.com'

async function isAuthorizedAdmin(request: NextRequest, supabaseUrl: string, anonKey: string) {
  const adminToken = request.cookies.get('suc-admin-session')?.value
  if (!adminToken) return false

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${adminToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await authClient.auth.getUser()
  return !error && data.user?.email === ADMIN_EMAIL
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const authorized = await isAuthorizedAdmin(request, supabaseUrl, anonKey)
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    return NextResponse.json({ ok: true, application, docs: docs ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
