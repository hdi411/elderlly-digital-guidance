import { useState } from 'react'

interface Props {
  onComplete: () => void
}

export default function SetupScreen({ onComplete }: Props): JSX.Element {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSave(): void {
    if (!key.startsWith('sk-')) {
      setError('Please enter a valid OpenAI API key (starts with sk-)')
      return
    }
    localStorage.setItem('openai_api_key', key.trim())
    onComplete()
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F2EDE6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, system-ui, sans-serif', padding: 24
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 36px',
        maxWidth: 480, width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C1C1E', margin: 0 }}>
            AI Guidance
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
            Your personal assistant for using technology
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', display: 'block', marginBottom: 8 }}>
            🔑 Enter your OpenAI API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="sk-..."
            style={{
              width: '100%', padding: '14px 16px', fontSize: 15,
              borderRadius: 12, border: '1.5px solid #E5E0D8',
              outline: 'none', boxSizing: 'border-box' as const, background: '#F7F3EE'
            }}
          />
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 14, color: '#DC2626'
          }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={!key}
          style={{
            width: '100%', padding: '16px', fontSize: 17, fontWeight: 700,
            background: key ? '#3B82F6' : '#D1D5DB', color: '#fff',
            border: 'none', borderRadius: 14, cursor: key ? 'pointer' : 'default'
          }}
        >
          Get Started →
        </button>

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
          Your key is stored only on this device. Never shared.
        </p>
      </div>
    </div>
  )
}
