'use client'

import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react'

const profile = {
  firstName: 'Michael', middleName: 'A', lastName: 'Johnson', dateOfBirth: '1990-05-15',
  gender: 'Male', maritalStatus: 'Single', email: 'michael@example.com',
  phone: '+1 (555) 234-5678', address: '123 Main Street, New York, NY 10001', country: 'United States',
  occupation: 'Software Engineer', employer: 'Tech Corp Inc.',
}

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl" data-testid="profile-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your personal information on file.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.firstName.charAt(0)}
        </div>
        <div>
          <h2 className="font-heading font-bold text-xl text-[#0B2447]">{profile.firstName} {profile.lastName}</h2>
          <p className="text-gray-500 text-sm">{profile.email}</p>
          <p className="text-gray-400 text-xs mt-1">{profile.occupation} · {profile.employer}</p>
        </div>
      </div>

      {/* Info sections */}
      {[
        {
          icon: User, title: 'Personal Details',
          rows: [
            { label: 'Full Name', value: `${profile.firstName} ${profile.middleName} ${profile.lastName}` },
            { label: 'Date of Birth', value: profile.dateOfBirth },
            { label: 'Gender', value: profile.gender },
            { label: 'Marital Status', value: profile.maritalStatus },
          ]
        },
        {
          icon: Mail, title: 'Contact Information',
          rows: [
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone },
            { label: 'Address', value: profile.address },
            { label: 'Country', value: profile.country },
          ]
        },
        {
          icon: Briefcase, title: 'Employment',
          rows: [
            { label: 'Occupation', value: profile.occupation },
            { label: 'Employer', value: profile.employer },
          ]
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

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <p className="text-blue-800 text-sm">To update your profile information, please contact our support team at <a href="mailto:support@silverunioncapital.com" className="font-semibold underline">support@silverunioncapital.com</a>.</p>
      </div>
    </div>
  )
}
