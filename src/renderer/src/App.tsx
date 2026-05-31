import { useState, useEffect } from 'react'
import SetupScreen from './components/SetupScreen'
import HomeScreen from './components/HomeScreen'

export default function App(): JSX.Element {
  const [hasKey, setHasKey] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const key = localStorage.getItem('openai_api_key')
    setHasKey(!!key && key.startsWith('sk-'))
    setLoading(false)
  }, [])

  if (loading) return <div style={{ background: '#F2EDE6', height: '100vh' }} />

  if (!hasKey) {
    return <SetupScreen onComplete={() => setHasKey(true)} />
  }

  return <HomeScreen onResetKey={() => setHasKey(false)} />
}
