'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, MapPin, Heart, Briefcase, Shield, Loader2, ExternalLink, Pencil } from 'lucide-react'

const mockApp = {
  id: 'app-001',
  status: 'submitted',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  step_data: {
    personal: { firstName: 'Michael', middleName: 'A', lastName: 'Johnson', dateOfBirth: '1990-05-15', gender: 'Male', maritalStatus: 'Single' },
    contact: { email: 'michael@example.com', phone: '+1 (555) 234-5678', address: '123 Main Street', city: 'New York', state: 'NY', postalCode: '10001', country: 'United States' },
    nextOfKin: { fullName: 'Jessica Johnson', relationship: 'Sister', phone: '+1 (555) 876-5432', email: 'jessica@example.com', address: '456 Oak Ave, Brooklyn, NY' },
    accountDetails: { accountType: 'checking', preferredBranch: 'New York', occupation: 'Software Engineer', employer: 'Tech Corp Inc.', monthlyIncome: '$5,000 – $10,000' },
    kyc: { ssn: '***-**-1234', passportPhotoName: 'passport.jpg', meansOfIdName: 'drivers-license.pdf', supportingDocName: '' },
  },
}

const mockDocs = [
  { id: 'doc-001', document_type: 'passport_photo', file_name: 'passport.jpg', storage_path: 'kyc/passport.jpg' },
  { id: 'doc-002', document_type: 'means_of_id', file_name: 'drivers-license.pdf', storage_path: 'kyc/drivers-license.pdf' },
]

interface InfoSection { title: string; icon: React.ElementType; rows: { label: string; value: string }[] }

export default function ApplicationDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [app, setApp] = useState(mockApp)
  const [docs, setDocs] = useState(mockDocs)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [note, setNote] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function fetchApp() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/applications/${id}`, { credentials: 'include' })
        const payload = await res.json()
        if (res.ok && payload?.ok && payload.application) {
          setApp(payload.application)
          if (Array.isArray(payload.docs)) setDocs(payload.docs)
        }
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    if (id !== 'app-001') fetchApp(); else setLoading(false)
  }, [id])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function updateStatus(status: string) {
    setActionLoading(status)
    try {
      const res = await fetch(`/api/admin/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const payload = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Request failed')

      if (status === 'approved' && payload.userId) {
        const tempPwMsg = payload.temporaryPassword ? ` Temporary password: ${payload.temporaryPassword}` : ''
        showToast(`Application approved. User ID: ${payload.userId}.${tempPwMsg}`, 'success')
      } else {
        showToast(`Application marked as ${getStatusLabel(status)}`, 'success')
      }

      setApp(prev => ({ ...prev, status }))
    } catch {
      showToast('Action failed. Please try again.', 'error')
    } finally {
      setActionLoading('')
    }
  }

  async function addNote() {
    if (!note.trim()) return
    try {
      const res = await fetch(`/api/admin/applications/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note: note.trim() }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Failed')
      showToast('Note added.', 'success')
      setNote('')
    } catch {
      showToast('Failed to add note.', 'error')
    }
  }

  async function getDocUrl(path: string) {
    const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const sections: InfoSection[] = [
    {
      title: 'Personal Information', icon: User,
      rows: [
        { label: 'Full Name', value: `${app.step_data.personal.firstName} ${app.step_data.personal.middleName ?? ''} ${app.step_data.personal.lastName}`.trim() },
        { label: 'Date of Birth', value: app.step_data.personal.dateOfBirth },
        { label: 'Gender', value: app.step_data.personal.gender },
        { label: 'Marital Status', value: app.step_data.personal.maritalStatus },
      ],
    },
    {
      title: 'Contact Information', icon: MapPin,
      rows: [
        { label: 'Email', value: app.step_data.contact.email },
        { label: 'Phone', value: app.step_data.contact.phone },
        { label: 'Address', value: `${app.step_data.contact.address}, ${app.step_data.contact.city}, ${app.step_data.contact.state} ${app.step_data.contact.postalCode}` },
        { label: 'Country', value: app.step_data.contact.country },
      ],
    },
    {
      title: 'Next of Kin', icon: Heart,
      rows: [
        { label: 'Full Name', value: app.step_data.nextOfKin.fullName },
        { label: 'Relationship', value: app.step_data.nextOfKin.relationship },
        { label: 'Phone', value: app.step_data.nextOfKin.phone },
        { label: 'Email', value: app.step_data.nextOfKin.email },
      ],
    },
    {
      title: 'Account Details', icon: Briefcase,
      rows: [
        { label: 'Account Type', value: app.step_data.accountDetails.accountType },
        { label: 'Preferred Branch', value: app.step_data.accountDetails.preferredBranch },
        { label: 'Occupation', value: app.step_data.accountDetails.occupation },
        { label: 'Employer', value: app.step_data.accountDetails.employer },
        { label: 'Monthly Income', value: app.step_data.accountDetails.monthlyIncome },
      ],
    },
    {
      title: 'KYC & Identity', icon: Shield,
      rows: [
        { label: 'SSN (masked)', value: app.step_data.kyc.ssn },
      ],
    },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-[#0B2447] animate-spin" /></div>
  }

  return (
    <div className="space-y-6 max-w-5xl" data-testid="application-detail">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-slide-up ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#0B2447] text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </Link>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">
            {app.step_data.personal.firstName} {app.step_data.personal.lastName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
              {getStatusLabel(app.status)}
            </span>
            <span className="text-gray-400 text-xs">Submitted {formatDate(app.created_at)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {app.status !== 'under_review' && (
            <button onClick={() => updateStatus('under_review')} disabled={!!actionLoading}
              className="inline-flex items-center gap-2 border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              data-testid="mark-under-review-btn">
              {actionLoading === 'under_review' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Mark Under Review
            </button>
          )}
          {app.status !== 'approved' && (
            <button onClick={() => updateStatus('approved')} disabled={!!actionLoading}
              className="inline-flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              data-testid="approve-btn">
              {actionLoading === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
          )}
          {app.status !== 'rejected' && (
            <button onClick={() => updateStatus('rejected')} disabled={!!actionLoading}
              className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              data-testid="reject-btn">
              {actionLoading === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
          )}
        </div>
      </div>

      {/* Info sections */}
      <div className="grid sm:grid-cols-2 gap-5">
        {sections.map(({ title, icon: Icon, rows }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <Icon className="w-4 h-4 text-[#0B2447]" />
              <h3 className="font-heading font-bold text-[#0B2447] text-sm">{title}</h3>
            </div>
            <div className="p-5 space-y-3">
              {rows.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">{label}</span>
                  <span className="text-xs text-gray-800 font-semibold text-right">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <FileText className="w-4 h-4 text-[#0B2447]" />
            <h3 className="font-heading font-bold text-[#0B2447] text-sm">KYC Documents</h3>
          </div>
          <div className="p-5 space-y-3">
            {docs.length === 0 ? (
              <p className="text-gray-400 text-sm">No documents uploaded.</p>
            ) : docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.file_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                </div>
                <button onClick={() => getDocUrl(doc.storage_path)} className="inline-flex items-center gap-1.5 text-[#1565C0] hover:text-[#0B2447] text-xs font-semibold transition-colors">
                  View <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <Pencil className="w-4 h-4 text-[#0B2447]" />
            <h3 className="font-heading font-bold text-[#0B2447] text-sm">Internal Notes</h3>
          </div>
          <div className="p-5">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add an internal note about this application..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none"
              rows={3}
              data-testid="admin-note-textarea"
            />
            <button onClick={addNote} className="mt-3 inline-flex items-center gap-2 bg-[#0B2447] text-white hover:bg-[#06162c] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all" data-testid="add-note-btn">
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
