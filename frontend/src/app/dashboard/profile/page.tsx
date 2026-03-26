'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Mail, Briefcase } from 'lucide-react'

const demoProfile = {
  full_name: 'Customer Demo',
  email: 'customer@example.com',
  phone: '+1 (000) 000-0000',
  status: 'active',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(demoProfile)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data } = await supabase
          .from('user_profiles')
          .select('full_name,email,phone,status')
          .eq('auth_user_id', session.user.id)
          .single()

        if (data) {
          setProfile({
            full_name: data.full_name || demoProfile.full_name,
            email: data.email || demoProfile.email,
            phone: data.phone || demoProfile.phone,
            status: data.status || demoProfile.status,
          })
        }
      } catch {
        // keep demo fallback
      }
    }

    fetchProfile()
  }, [])

  const firstName = profile.full_name.split(' ')[0] || 'Customer'

  return (
    <div className="space-y-6 max-w-2xl" data-testid="profile-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Persisted profile information from your account.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {firstName.charAt(0)}
        </div>
        <div>
          <h2 className="font-heading font-bold text-xl text-[#0B2447]">{profile.full_name}</h2>
          <p className="text-gray-500 text-sm">{profile.email}</p>
          <p className="text-gray-400 text-xs mt-1 capitalize">Status: {profile.status}</p>
        </div>
      </div>

      {[
        {
          icon: User, title: 'Personal Details',
          rows: [
            { label: 'Full Name', value: profile.full_name },
            { label: 'Account Status', value: profile.status },
          ],
        },
        {
          icon: Mail, title: 'Contact Information',
          rows: [
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone },
          ],
        },
        {
          icon: Briefcase, title: 'Prototype Note',
          rows: [
            { label: 'Employment Data', value: 'Demo-only in this prototype' },
          ],
        },
      ].map(({ icon: Icon, title, rows }) => (
        <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <Icon className="w-4 h-4 text-[#0B2447]" />
            <h3 className="font-heading font-bold text-[#0B2447] text-sm">{title}</h3>
          </div>
          <div className="p-6 space-y-4">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-400 font-medium">{label}</span>
                <span className="text-gray-800 font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
