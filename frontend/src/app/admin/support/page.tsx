'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { LifeBuoy, Send, RefreshCw, PlusCircle } from 'lucide-react'

interface UserProfile {
  id: string
  user_id?: string
  full_name?: string
  email?: string
  status?: string
}

interface Conversation {
  id: string
  subject: string
  status: 'open' | 'closed'
  updated_at: string
  user_profiles?: UserProfile
}

interface Message {
  id: string
  sender_type: 'customer' | 'admin'
  message: string
  created_at: string
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([])
  const [activeId, setActiveId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const fetchConversations = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true)
    try {
      const res = await fetch('/api/admin/support/conversations', { credentials: 'include', cache: 'no-store' })
      const payload = await res.json().catch(() => null)
      if (res.ok && payload?.ok) {
        const list = payload.conversations ?? []
        const users = payload.approvedUsers ?? []
        setConversations(list)
        setApprovedUsers(users)
        setActiveId((current) => {
          if (current && list.some((conversation: Conversation) => conversation.id === current)) return current
          return list[0]?.id || ''
        })
        setSelectedUser((current) => current || users[0]?.id || '')
      }
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return
    const res = await fetch(`/api/admin/support/conversations/${conversationId}/messages`, { credentials: 'include', cache: 'no-store' })
    const payload = await res.json().catch(() => null)
    if (res.ok && payload?.ok) setMessages(payload.messages ?? [])
  }, [])

  useEffect(() => {
    void fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchConversations({ silent: true })
    }, 2500)

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        void fetchConversations({ silent: true })
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetchConversations])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }

    void fetchMessages(activeId)

    const interval = setInterval(() => {
      void fetchMessages(activeId)
    }, 1500)

    return () => clearInterval(interval)
  }, [activeId, fetchMessages])

  const active = useMemo(() => conversations.find((conversation) => conversation.id === activeId), [conversations, activeId])

  async function createConversation() {
    if (!selectedUser) return

    const res = await fetch('/api/admin/support/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userProfileId: selectedUser,
        subject: newSubject.trim() || 'Support Request',
        message: newMessage.trim(),
      }),
    })

    const payload = await res.json()
    if (res.ok && payload?.ok) {
      const created = payload.conversation as Conversation
      setConversations((prev) => [created, ...prev])
      setActiveId(created.id)
      setMessages(payload.message ? [payload.message] : [])
      setNewSubject('')
      setNewMessage('')
    }
  }

  async function sendReply() {
    if (!draft.trim() || !activeId) return
    const res = await fetch(`/api/admin/support/conversations/${activeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: draft.trim() }),
      credentials: 'include',
    })
    const payload = await res.json()
    if (res.ok && payload?.ok) {
      setMessages((prev) => [...prev, payload.message])
      void fetchConversations({ silent: true })
      setDraft('')
    }
  }

  async function toggleStatus() {
    if (!active) return
    const nextStatus = active.status === 'open' ? 'closed' : 'open'
    const res = await fetch(`/api/admin/support/conversations/${active.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
      credentials: 'include',
    })
    if (res.ok) {
      setConversations((prev) => prev.map((conversation) => (conversation.id === active.id ? { ...conversation, status: nextStatus } : conversation)))
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-support-inbox">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Support Inbox</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor customer conversations and reply from one place</p>
        </div>
        <button onClick={() => { void fetchConversations() }} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B2447] border border-gray-200 rounded-lg px-3 py-2 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-heading font-bold text-[#0B2447] text-sm">Start Conversation with Approved User</h2>
        <div className="grid md:grid-cols-[1.2fr,1fr] gap-3">
          <select
            value={selectedUser}
            onChange={(event) => setSelectedUser(event.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
          >
            {approvedUsers.map((user) => (
              <option key={user.id} value={user.id}>{user.full_name || user.email || user.user_id || 'Unknown user'}</option>
            ))}
          </select>
          <input
            value={newSubject}
            onChange={(event) => setNewSubject(event.target.value)}
            placeholder="Subject"
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
          />
        </div>
        <textarea
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Optional opening message"
          rows={2}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none"
        />
        <button
          onClick={createConversation}
          disabled={!selectedUser}
          className="inline-flex items-center gap-2 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" /> Create Conversation
        </button>
      </div>

      <div className="grid lg:grid-cols-[340px,1fr] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-heading font-bold text-[#0B2447] text-sm">Conversations</div>
          {loading ? <div className="py-10 text-center text-gray-400 text-sm">Loading...</div> : (
            <div className="divide-y divide-gray-100 max-h-[550px] overflow-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${conversation.id === activeId ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">{conversation.subject || 'Support Request'}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${conversation.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {conversation.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{conversation.user_profiles?.full_name || conversation.user_profiles?.email || 'Unknown user'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(conversation.updated_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
            <div>
              <p className="font-heading font-bold text-[#0B2447] text-sm">{active?.subject || 'Select a conversation'}</p>
              <p className="text-xs text-gray-500">{active?.user_profiles?.full_name || active?.user_profiles?.email || ''}</p>
            </div>
            {active && (
              <button onClick={toggleStatus} className="text-xs font-semibold text-[#1565C0] hover:text-[#0B2447]">
                Mark as {active.status === 'open' ? 'Closed' : 'Open'}
              </button>
            )}
          </div>

          <div className="flex-1 p-5 space-y-3 overflow-auto bg-gray-50/50">
            {!active ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Choose a conversation from the left.</div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No messages in this thread yet.</div>
            ) : messages.map((message) => (
              <div key={message.id} className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${message.sender_type === 'admin' ? 'ml-auto bg-[#0B2447] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                <p>{message.message}</p>
                <p className={`text-[10px] mt-1 ${message.sender_type === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>{formatDate(message.created_at)}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a reply..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none"
              rows={2}
              disabled={!active || active.status === 'closed'}
            />
            <button
              onClick={sendReply}
              disabled={!active || active.status === 'closed' || !draft.trim()}
              className="inline-flex items-center gap-1.5 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      </div>

      {conversations.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <LifeBuoy className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          No support conversations yet.
        </div>
      )}
    </div>
  )
}
