import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function GroupChat() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()

  const [group, setGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // ── Load group + messages ─────────────────────────────────────────────
  useEffect(() => {
    async function loadGroup() {
      try {
        setLoading(true)
        const gid = parseInt(groupId)

        const [
          { data: groupData, error: gErr },
          { data: gmData, error: gmErr },
          { data: msgData, error: msgErr }
        ] = await Promise.all([
          supabase.from('groups').select('*').eq('id', gid).single(),
          supabase.from('group_members').select('member_id, members(id, name)').eq('group_id', gid),
          supabase.from('group_messages').select('*').eq('group_id', gid).order('created_at', { ascending: true }).limit(200)
        ])

        if (gErr) throw gErr
        if (gmErr) throw gmErr
        if (msgErr) throw msgErr

        setGroup(groupData)

        const memberList = (gmData || []).map(r => r.members).filter(Boolean)
        setMembers(memberList)

        const inGroup = memberList.some(m => m.id === profile?.id)
        if (!inGroup && !isAdmin) {
          navigate('/my-group', { replace: true })
          return
        }

        setMessages(msgData || [])
      } catch (err) {
        console.error('Error loading group chat:', err)
      } finally {
        setLoading(false)
      }
    }
    loadGroup()
  }, [groupId, profile?.id, isAdmin, navigate])

  // ── Realtime subscription ─────────────────────────────────────────────
  useEffect(() => {
    if (!groupId) return
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          setMessages(prev => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new])
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send ──────────────────────────────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending || !profile?.id) return

    setSending(true)
    setText('')

    const optimisticId = `opt-${Date.now()}`
    setMessages(prev => [...prev, {
      id: optimisticId, group_id: parseInt(groupId),
      member_id: profile.id, message: trimmed, created_at: new Date().toISOString()
    }])

    try {
      const { error } = await supabase.from('group_messages').insert([{
        group_id: parseInt(groupId), member_id: profile.id, message: trimmed
      }])
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== optimisticId))
        setText(trimmed)
        alert('Failed to send: ' + error.message)
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      setText(trimmed)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function handleDelete(msgId) {
    if (!window.confirm('Delete this message?')) return
    try {
      const { error } = await supabase.from('group_messages').delete().eq('id', msgId)
      if (error) throw error
      setMessages(prev => prev.filter(m => m.id !== msgId))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  function getMemberName(memberId) {
    return members.find(m => m.id === memberId)?.name || 'Unknown'
  }

  function isOwn(msg) { return msg.member_id === profile?.id }

  function canDelete(msg) { return isOwn(msg) || isAdmin }

  function formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 0) return time
    if (diffDays === 1) return `Yesterday ${time}`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + time
  }

  // Group consecutive messages from same sender within 1 min
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1]
    const sameAuthor = prev?.member_id === msg.member_id
    const closeTime = prev && (new Date(msg.created_at) - new Date(prev.created_at)) < 60000
    return { ...msg, showHeader: !sameAuthor || !closeTime }
  })

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <p style={{ color: '#6b7280' }}>Loading chat...</p>
      </div>
    )
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>← Back</button>
        <div style={s.headerInfo}>
          <div style={s.headerAvatar}>{group?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={s.headerName}>{group?.name}</div>
            <div style={s.headerSub}>{members.length} member{members.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div style={s.memberAvatars}>
          {members.slice(0, 4).map((m, i) => (
            <div key={m.id} style={{ ...s.miniAvatar, marginLeft: i > 0 ? -6 : 0, background: m.id === profile?.id ? '#4f46e5' : '#8b5cf6' }} title={m.name}>
              {m.name[0].toUpperCase()}
            </div>
          ))}
          {members.length > 4 && (
            <div style={{ ...s.miniAvatar, marginLeft: -6, background: '#e5e7eb', color: '#6b7280', fontSize: 10 }}>
              +{members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={s.messagesArea}>
        {messages.length === 0 && (
          <div style={s.emptyChat}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ color: '#9ca3af', fontSize: 15, margin: 0 }}>No messages yet. Start the conversation!</p>
          </div>
        )}

        {grouped.map(msg => {
          const own = isOwn(msg)
          return (
            <div key={msg.id} style={{ ...s.msgWrapper, justifyContent: own ? 'flex-end' : 'flex-start' }}>
              {!own && msg.showHeader && <div style={s.msgAvatar}>{getMemberName(msg.member_id)[0].toUpperCase()}</div>}
              {!own && !msg.showHeader && <div style={{ width: 32, flexShrink: 0 }} />}

              <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                {!own && msg.showHeader && <div style={s.senderName}>{getMemberName(msg.member_id)}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: own ? 'row-reverse' : 'row' }}>
                  <div style={{ ...s.bubble, ...(own ? s.bubbleOwn : s.bubbleOther) }}>
                    {msg.message}
                  </div>
                  {canDelete(msg) && (
                    <button onClick={() => handleDelete(msg.id)} style={s.delBtn} title="Delete">🗑️</button>
                  )}
                </div>

                <div style={{ ...s.timestamp, textAlign: own ? 'right' : 'left' }}>{formatTime(msg.created_at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={s.inputBar}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Message ${group?.name || 'group'}...`}
          style={s.input}
          disabled={sending}
          maxLength={1000}
          autoComplete="off"
        />
        <button type="submit" disabled={!text.trim() || sending}
          style={{ ...s.sendBtn, opacity: !text.trim() || sending ? 0.5 : 1 }}>
          ➤
        </button>
      </form>
    </div>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#f3f4f6', overflow: 'hidden' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  backBtn: { background: 'none', border: 'none', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, flexShrink: 0 },
  headerInfo: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  headerAvatar: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 },
  headerName: { fontSize: 16, fontWeight: 700, color: '#111827' },
  headerSub: { fontSize: 12, color: '#9ca3af' },
  memberAvatars: { display: 'flex', alignItems: 'center' },
  miniAvatar: { width: 26, height: 26, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: '2px solid #fff', flexShrink: 0 },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 },
  emptyChat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' },
  msgWrapper: { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 2 },
  msgAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginBottom: 2 },
  senderName: { fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 3, paddingLeft: 4 },
  bubble: { padding: '9px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' },
  bubbleOwn: { background: '#4f46e5', color: '#fff', borderBottomRightRadius: 4 },
  bubbleOther: { background: '#fff', color: '#1f2937', borderBottomLeftRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  timestamp: { fontSize: 10, color: '#9ca3af', marginTop: 3 },
  delBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 4, opacity: 0.4, flexShrink: 0 },
  inputBar: { display: 'flex', gap: 10, padding: '12px 16px', background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
  input: { flex: 1, padding: '11px 16px', borderRadius: 24, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#f9fafb' },
  sendBtn: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
}

export default GroupChat
