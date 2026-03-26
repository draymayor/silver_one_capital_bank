import { Settings, Mail, Shield, Bell } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl" data-testid="admin-settings">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">System and admin configuration.</p>
      </div>

      {[
        {
          icon: Mail, title: 'Email Configuration', rows: [
            { label: 'Support Email', value: 'support@silverunioncapital.com' },
            { label: 'Admin Email', value: 'admin@silverunioncapital.com' },
            { label: 'No-Reply Email', value: 'noreply@silverunioncapital.com' },
          ]
        },
        {
          icon: Shield, title: 'Security Settings', rows: [
            { label: 'Session Timeout', value: '60 minutes' },
            { label: 'MFA Required', value: 'Yes' },
            { label: 'Max Login Attempts', value: '5' },
          ]
        },
        {
          icon: Bell, title: 'Notification Settings', rows: [
            { label: 'New Application Alerts', value: 'Enabled' },
            { label: 'Status Change Notifications', value: 'Enabled' },
            { label: 'Daily Summary Email', value: 'Enabled' },
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
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="text-gray-800 font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
