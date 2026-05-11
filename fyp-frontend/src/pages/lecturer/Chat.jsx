import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import { formatDate, formatTime } from '../../utils/helpers'
import styles from './Lecturer.module.css'

export default function LecturerChat() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState([])
  const [active, setActive]       = useState(null)
  const [thread, setThread]       = useState(null)
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.getProposals()
      .then(data => {
        const withThread = data.filter(p => p.chatThread)
        setProposals(withThread)
        if (withThread.length > 0) setActive(withThread[0])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!active) return
    api.getChatThread(active.id)
      .then(setThread)
      .catch(() => setThread(null))
  }, [active?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [thread?.messages?.length])

  const handleSend = async () => {
    if (!input.trim() || !active) return
    try {
      const msg = await api.sendMessage(active.id, input.trim())
      setThread(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : prev)
      setInput('')
    } catch(e) { console.error(e) }
  }

  const handleKeyDown = e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const grouped = (thread?.messages||[]).reduce((acc,m) => {
    const d = formatDate(m.sentAt||m.sent_at)
    if (!acc[d]) acc[d] = []
    acc[d].push(m)
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <p className={styles.sectionSub} style={{ marginBottom:16 }}>Communicate with industry partners about their proposals</p>

      {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>
      : proposals.length === 0 ? (
        <div className={styles.card} style={{ textAlign:'center', padding:60 }}>
          <MessageSquare size={36} style={{ color:'var(--text-muted)', margin:'0 auto 12px', display:'block' }}/>
          <h3 style={{ fontFamily:'Space Grotesk', marginBottom:8 }}>No chat threads yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>Chat threads open automatically when you approve or reject a proposal.</p>
        </div>
      ) : (
        <div className={styles.chatLayout}>
          <div className={styles.chatSidebar}>
            <div className={styles.chatSidebarHeader}>Conversations ({proposals.length})</div>
            <div className={styles.chatThreadList}>
              {proposals.map(p => (
                <div key={p.id} className={`${styles.chatThreadItem} ${active?.id===p.id?styles.activeThread:''}`} onClick={() => setActive(p)}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:28,height:28,borderRadius:'50%',background:'#7C3AED',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0 }}>
                      {p.submittedBy?.firstName?.[0]}{p.submittedBy?.lastName?.[0]}
                    </div>
                    <div className={styles.chatThreadTitle}>{p.title}</div>
                  </div>
                  <div className={styles.chatThreadSub}>{p.submittedBy?.companyName || 'Industry Partner'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chatMain}>
            {active ? (<>
              <div className={styles.chatHeader}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div>
                    <div className={styles.chatHeaderTitle}>{active.title}</div>
                    <div className={styles.chatHeaderSub}>
                      {active.companyName} ·{' '}
                      <span style={{ color:active.status==='approved'?'#16A34A':active.status==='rejected'?'#DC2626':'#D97706', fontWeight:600, textTransform:'capitalize' }}>{active.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.chatMessages}>
                {Object.entries(grouped).map(([date,msgs]) => (
                  <div key={date}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'8px 0 16px' }}>
                      <div style={{ flex:1, height:1, background:'var(--border)' }}/>
                      <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{date}</span>
                      <div style={{ flex:1, height:1, background:'var(--border)' }}/>
                    </div>
                    {msgs.map(m => {
                      const isMe   = m.senderId === user.id || m.sender?.id === user.id
                      const sender = m.sender
                      return (
                        <div key={m.id} className={`${styles.msgRow} ${isMe?styles.mine:''}`}>
                          <div className={styles.msgAvatar} style={{ background:isMe?'#CC0000':'#7C3AED', marginTop:2 }}>
                            {sender ? `${(sender.firstName||sender.first_name||'')[0]}${(sender.lastName||sender.last_name||'')[0]}` : '?'}
                          </div>
                          <div>
                            <div className={`${styles.msgBubble} ${isMe?styles.mine:styles.theirs}`}>{m.message}</div>
                            <div className={`${styles.msgTime} ${!isMe?styles.theirs:''}`}>
                              {sender ? (sender.firstName||sender.first_name) : ''} · {formatTime(m.sentAt||m.sent_at)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>

              <div className={styles.chatInputArea}>
                <textarea className={styles.chatInput} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Type a message... (Enter to send)" rows={1}/>
                <button onClick={handleSend} disabled={!input.trim()}
                  style={{ width:40,height:40,borderRadius:'50%',background:input.trim()?'var(--red)':'var(--border)',border:'none',cursor:input.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',transition:'var(--transition)',flexShrink:0 }}>
                  <Send size={16} color="#fff"/>
                </button>
              </div>
            </>) : (
              <div className={styles.chatEmptyState}>
                <MessageSquare size={32} style={{ opacity:0.3 }}/>
                <p>Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
