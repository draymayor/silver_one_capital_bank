'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Conversation {
  id: string
  subject: string
  status: string
  created_at: string
  profile?: { full_name?: string; user_id?: string; email?: string } | null
  latest_message?: { message: string; created_at: string; sender_type: string } | null
  unread_count?: number
}

interface SupportMessage {
  id: string
  sender_type: 'customer' | 'admin'
  message: string
  created_at: string
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [reply, setReply] = useState('')
  const [toast, setToast] = useState('')

  async function loadConversations() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/support/conversations', { credentials: 'include' })
      const payload = await res.json()
      if (res.ok && payload?.ok) {
        setConversations(payload.conversations ?? [])
        if (!selectedId && payload.conversations?.[0]?.id) {
          setSelectedId(payload.conversations[0].id)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(id: string) {
    const res = await fetch(`/api/admin/support/conversations/${id}/messages`, { credentials: 'include' })
    const payload = await res.json()
    if (res.ok && payload?.ok) setMessages(payload.messages ?? [])
  }

  useEffect(() => { loadConversations() }, [])
  useEffect(() => { if (selectedId) loadMessages(selectedId) }, [selectedId])

  async function sendReply() {
    if (!selectedId || !reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/support/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: reply.trim() }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Failed to send')
      setReply('')
      setToast('Reply sent')
      setTimeout(() => setToast(''), 2500)
      await loadMessages(selectedId)
      await loadConversations()
    } catch {
      setToast('Failed to send reply')
      setTimeout(() => setToast(''), 2500)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-support-inbox">
      {toast && <div className="fixed top-5 right-5 z-50 bg-[#0B2447] text-white text-sm px-4 py-2.5 rounded-lg">{toast}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Support Inbox</h1>
          <p className="text-gray-500 text-sm mt-1">Review customer conversations and reply from admin.</p>
        </div>
        <button onClick={loadConversations} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100"><p className="text-xs font-semibold text-gray-500 uppercase">Conversations</p></div>
          <div className="max-h-[620px] overflow-y-auto divide-y divide-gray-100">
            {loading ? <div className="p-6 text-sm text-gray-400">Loading...</div> : conversations.length === 0 ? <div className="p-6 text-sm text-gray-400">No conversations yet.</div> : conversations.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left p-4 hover:bg-gray-50 ${selectedId === c.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.profile?.full_name || 'Customer'}</p>
                    <p className="text-xs text-gray-500">{c.profile?.user_id || c.profile?.email || '—'}</p>
                  </div>
                  {Boolean(c.unread_count) && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{c.unread_count}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{c.latest_message?.message || c.subject || 'No messages'}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatDate(c.latest_message?.created_at || c.created_at)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[620px]">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#0B2447]" />
            <p className="font-heading font-semibold text-[#0B2447]">Conversation</p>
          </div>
          <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-gray-50">
            {!selectedId ? <p className="text-sm text-gray-400">Select a conversation to view messages.</p> : messages.length === 0 ? <p className="text-sm text-gray-400">No messages yet.</p> : messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${m.sender_type === 'admin' ? 'ml-auto bg-[#0B2447] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                <p>{m.message}</p>
                <p className={`text-[11px] mt-1 ${m.sender_type === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>{formatDate(m.created_at)}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 bg-white flex items-end gap-2">
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Write a reply..." className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none" />
            <button onClick={sendReply} disabled={sending || !reply.trim() || !selectedId} className="inline-flex items-center gap-2 bg-[#0B2447] text-white hover:bg-[#06162c] disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm font-semibold">
              <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
