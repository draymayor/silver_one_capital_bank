import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server environment is missing Supabase configuration.' }, { status: 500 })
    }

    const { accessToken, currentPassword, newPassword } = await request.json()

    if (!accessToken || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: userData } = await authClient.auth.getUser()
    const email = userData.user?.email
    if (!email) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })
    }

    const verifyClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error: verifyError } = await verifyClient.auth.signInWithPassword({ email, password: currentPassword })
    if (verifyError) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    const { error: updateError } = await authClient.auth.updateUser({ password: newPassword })
    if (updateError) {
      return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}
