'use client'

import { useEffect, useMemo, useState } from 'react'
import { LifeBuoy, Send } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface Conversation {
  id: string
  subject: string
  status: 'open' | 'closed'
  updated_at: string
}

interface Message {
  id: string
  sender_type: 'customer' | 'admin'
  message: string
  created_at: string
}

export default function DashboardSupportPage() {
  const [token, setToken] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [reply, setReply] = useState('')

  useEffect(() => {
    async function bootstrap() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      setToken(session.access_token)

      const res = await fetch('/api/support/conversations', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const payload = await res.json()
      if (res.ok && payload?.ok) {
        const list = payload.conversations ?? []
        setConversations(list)
        if (list[0]?.id) setActiveId(list[0].id)
      }

      setLoading(false)
    }

    bootstrap()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!activeId || !token) return
      const res = await fetch(`/api/support/conversations/${activeId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = await res.json()
      if (res.ok && payload?.ok) setMessages(payload.messages ?? [])
    }

    loadMessages()
  }, [activeId, token])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [conversations, activeId],
  )

  async function startConversation() {
    if (!token || !newMessage.trim()) return

    const res = await fetch('/api/support/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subject: subject.trim() || 'Support Request', message: newMessage.trim() }),
    })

    const payload = await res.json()
    if (res.ok && payload?.ok) {
      const created = payload.conversation as Conversation
      setConversations((prev) => [created, ...prev])
      setActiveId(created.id)
      setMessages(payload.message ? [payload.message] : [])
      setSubject('')
      setNewMessage('')
    }
  }

  async function sendReply() {
    if (!token || !activeId || !reply.trim()) return

    const res = await fetch(`/api/support/conversations/${activeId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: reply.trim() }),
    })

    const payload = await res.json()
    if (res.ok && payload?.ok) {
      setMessages((prev) => [...prev, payload.message])
      setReply('')
      setConversations((prev) => prev.map((conversation) => (
        conversation.id === activeId
          ? { ...conversation, updated_at: new Date().toISOString(), status: 'open' }
          : conversation
      )))
    }
  }

  return (
    <div className="space-y-6" data-testid="dashboard-support-page">
      <div>
        <h1 className="font-heading font-bold text-2xl text-[#0B2447]">Support Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Chat with customer support and track all your conversations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-heading font-bold text-[#0B2447] text-base">Start a New Support Conversation</h2>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Subject"
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none"
        />
        <textarea
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Describe your request..."
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none"
        />
        <button
          onClick={startConversation}
          disabled={!newMessage.trim()}
          className="inline-flex items-center gap-2 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Send Message
        </button>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-heading font-bold text-[#0B2447] text-sm">Your Conversations</div>
          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="py-10 px-5 text-center text-gray-400 text-sm">No conversations yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${conversation.id === activeId ? 'bg-blue-50' : ''}`}
                >
                  <p className="font-medium text-sm text-gray-900 truncate">{conversation.subject || 'Support Request'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${conversation.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {conversation.status}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(conversation.updated_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[500px] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-heading font-bold text-[#0B2447] text-sm">{activeConversation?.subject || 'Select a conversation'}</p>
          </div>

          <div className="flex-1 p-5 space-y-3 overflow-auto bg-gray-50/50">
            {!activeConversation ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Choose a conversation to view messages.</div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No messages yet.</div>
            ) : messages.map((message) => (
              <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${message.sender_type === 'customer' ? 'ml-auto bg-[#0B2447] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                <p>{message.message}</p>
                <p className={`text-[10px] mt-1 ${message.sender_type === 'customer' ? 'text-white/70' : 'text-gray-400'}`}>{formatDate(message.created_at)}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Type your reply..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none resize-none"
              rows={2}
              disabled={!activeConversation || activeConversation.status === 'closed'}
            />
            <button
              onClick={sendReply}
              disabled={!activeConversation || activeConversation.status === 'closed' || !reply.trim()}
              className="inline-flex items-center gap-1.5 bg-[#0B2447] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#06162c] disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      </div>

      {!loading && conversations.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <LifeBuoy className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          Reach out anytime and our support team will respond here.
        </div>
      )}
    </div>
  )
}
