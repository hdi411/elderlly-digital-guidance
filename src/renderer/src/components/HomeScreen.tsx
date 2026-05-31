import { useState } from 'react'
import { detectIntent } from '../services/openai'

interface Props {
  onResetKey: () => void
}

const QUICK_ACTIONS = [
  { label: 'Call Someone',    type: 'call',      icon: '📞' },
  { label: 'Video Call',      type: 'video_call', icon: '📹' },
  { label: 'Send Message',    type: 'text',       icon: '💬' },
  { label: 'Get Directions',  type: 'navigate',   icon: '🗺️' },
  { label: 'Search Google',   type: 'search',     icon: '🔍' },
  { label: 'Check Weather',   type: 'weather',    icon: '🌤️' },
  { label: 'Watch YouTube',   type: 'youtube',    icon: '📺' },
  { label: 'Play Music',      type: 'music',      icon: '🎵' },
  { label: 'Send Email',      type: 'email',      icon: '✉️' },
  { label: 'Read News',       type: 'news',       icon: '📰' },
  { label: 'Take Photo',      type: 'photo',      icon: '📷' },
  { label: 'View Photos',     type: 'photos',     icon: '📸' },
  { label: 'Shop Online',     type: 'buy',        icon: '🛒' },
  { label: 'Find Hospital',   type: 'hospital',   icon: '🏥' },
  { label: 'Find Pharmacy',   type: 'pharmacy',   icon: '💊' },
  { label: 'Set Reminder',    type: 'reminder',   icon: '⏰' },
  { label: 'Open Calendar',   type: 'calendar',   icon: '📅' },
  { label: 'Translate Text',  type: 'translate',  icon: '🌐' },
  { label: 'Call a Taxi',     type: 'taxi',       icon: '🚕' },
  { label: 'Open App Store',  type: 'download',   icon: '⬇️' },
  { label: 'Pay / Wallet',    type: 'pay',        icon: '💳' },
  { label: 'WhatsApp',        type: 'whatsapp',   icon: '💚' },
]

type Status = 'idle' | 'loading' | 'confirming' | 'executing' | 'done' | 'error'

export default function HomeScreen({ onResetKey }: Props): JSX.Element {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [listening, setListening] = useState(false)
  const [result, setResult] = useState<{ type: string; params: Record<string, string>; display: string } | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isError, setIsError] = useState(false)

  // ── Voice input ──────────────────────────────────────────────────
  function startVoice(): void {
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setFeedback('Voice not supported in this browser.'); setIsError(true); return }
    const r = new SR()
    r.lang = 'en-US'
    r.interimResults = false
    r.onresult = (e: any) => { setText(e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    setListening(true)
  }

  // ── Submit text to GPT ───────────────────────────────────────────
  async function handleSubmit(): Promise<void> {
    if (!text.trim()) return
    setStatus('loading')
    setFeedback('')
    setIsError(false)
    try {
      const intent = await detectIntent(text.trim())
      setResult(intent)
      setStatus('confirming')
    } catch (err: any) {
      setFeedback(err.message)
      setIsError(true)
      setStatus('error')
    }
  }

  // ── Execute confirmed action ─────────────────────────────────────
  async function handleConfirm(): Promise<void> {
    if (!result) return
    setStatus('executing')
    const res = await window.api.executeAction({ type: result.type, params: result.params })
    setFeedback(res.message)
    setIsError(!res.success)
    setStatus('done')
    setText('')
    setResult(null)
    setTimeout(() => { setStatus('idle'); setFeedback('') }, 4000)
  }

  // ── Quick action button ──────────────────────────────────────────
  async function handleQuickAction(type: string): Promise<void> {
    setStatus('executing')
    const res = await window.api.executeAction({ type, params: {} })
    setFeedback(res.message)
    setIsError(!res.success)
    setStatus('done')
    setTimeout(() => { setStatus('idle'); setFeedback('') }, 3000)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F2EDE6',
      fontFamily: '-apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column'
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E5E0D8',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
      }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>AI Guidance</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Tell me what you need help with</div>
        </div>
        <button onClick={onResetKey} style={{
          background: 'none', border: '1px solid #E5E0D8', borderRadius: 8,
          padding: '6px 12px', fontSize: 12, color: '#9CA3AF', cursor: 'pointer'
        }}>⚙️ Settings</button>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

        {/* AI Input */}
        <div style={{ maxWidth: 700, margin: '0 auto 24px' }}>
          <div style={{
            background: '#fff', borderRadius: 18, border: '1.5px solid #E5E0D8',
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)'
          }}>
            <input
              type="text" value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={status === 'loading' || status === 'executing'}
              placeholder="Type here... e.g. 'Call my son' or 'Navigate to hospital'"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 17, color: '#1C1C1E', background: 'transparent'
              }}
            />
            {text && (
              <button onClick={handleSubmit} disabled={status === 'loading'} style={{
                background: '#3B82F6', border: 'none', borderRadius: 12,
                width: 40, height: 40, fontSize: 18, color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>→</button>
            )}
            <button onClick={startVoice} disabled={status === 'loading'} style={{
              width: 52, height: 52, borderRadius: 26, border: 'none',
              background: listening ? '#EF4444' : '#3B82F6', fontSize: 22,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: listening ? '0 0 0 6px rgba(239,68,68,0.2)' : 'none',
              transition: 'all 0.2s', color: '#fff'
            }}>
              {listening ? '⏹' : '🎤'}
            </button>
          </div>

          {/* Status feedback */}
          {status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '14px', fontSize: 16, color: '#3B82F6', fontWeight: 500 }}>
              🤖 Understanding your request...
            </div>
          )}

          {/* Confirmation card */}
          {status === 'confirming' && result && (
            <div style={{
              background: '#EFF6FF', border: '1.5px solid #BFDBFE',
              borderRadius: 16, padding: '18px 20px', marginTop: 12
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1D4ED8', marginBottom: 14 }}>
                I understood: {result.display}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleConfirm} style={{
                  flex: 2, padding: '14px', background: '#3B82F6', color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer'
                }}>✅ Yes, do it!</button>
                <button onClick={() => { setStatus('idle'); setResult(null) }} style={{
                  flex: 1, padding: '14px', background: '#fff', color: '#6B7280',
                  border: '1.5px solid #E5E0D8', borderRadius: 12, fontSize: 15, cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {(status === 'done' || status === 'error') && feedback && (
            <div style={{
              background: isError ? '#FEF2F2' : '#F0FDF4',
              border: `1.5px solid ${isError ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: 14, padding: '14px 18px', marginTop: 12,
              fontSize: 16, fontWeight: 500,
              color: isError ? '#DC2626' : '#15803D'
            }}>
              {isError ? '❌ ' : '✅ '}{feedback}
            </div>
          )}
        </div>

        {/* Quick action grid */}
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.type}
                onClick={() => handleQuickAction(action.type)}
                disabled={status === 'loading' || status === 'executing'}
                style={{
                  background: '#fff', border: '1.5px solid #E5E0D8',
                  borderRadius: 14, padding: '16px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}
              >
                <span style={{ fontSize: 28 }}>{action.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', textAlign: 'center' }}>
                  {action.label}
                </span>
              </button>
            ))}

            {/* Emergency button */}
            <button
              onClick={() => handleQuickAction('emergency')}
              style={{
                background: '#FEF2F2', border: '2px solid #FECACA',
                borderRadius: 14, padding: '16px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer', gridColumn: 'span 2'
              }}
            >
              <span style={{ fontSize: 28 }}>🆘</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>
                Emergency — Call 911
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
