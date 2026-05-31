const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `
You are an AI assistant helping elderly people use technology.
Identify what the user wants to do and extract relevant details.

Return ONLY valid JSON in this exact format:
{
  "type": "<action_type>",
  "params": { ... },
  "confidence": 0.0-1.0,
  "display": "<friendly description of what you will do>"
}

Action types and their params:
- call          → { "name": "", "phone": "" }
- video_call    → { "name": "", "phone": "" }
- text          → { "name": "", "phone": "" }
- email         → { "to": "" }
- whatsapp      → { "name": "" }
- wechat        → { "name": "" }
- navigate      → { "destination": "" }
- search        → { "query": "" }
- buy           → { "query": "" }
- photo         → {}
- photos        → {}
- news          → {}
- download      → {}
- pay           → {}
- weather       → {}
- calendar      → {}
- music         → { "query": "" }
- youtube       → { "query": "" }
- hospital      → {}
- pharmacy      → {}
- reminder      → { "text": "" }
- translate     → { "query": "" }
- taxi          → { "destination": "" }
- emergency     → {}

Examples:
"I want to call my son John" → { "type": "call", "params": { "name": "John" }, "confidence": 0.95, "display": "Calling your son John" }
"navigate to McDonald's"    → { "type": "navigate", "params": { "destination": "McDonald's" }, "confidence": 0.98, "display": "Getting directions to McDonald's" }
"I need an ambulance"       → { "type": "emergency", "params": {}, "confidence": 0.99, "display": "Calling emergency services" }
`.trim()

export async function detectIntent(text: string): Promise<{
  type: string
  params: Record<string, string>
  confidence: number
  display: string
}> {
  const apiKey = localStorage.getItem('openai_api_key')
  if (!apiKey) throw new Error('Please set your OpenAI API key first.')

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('Could not understand your request. Please try again.')
  }
}
