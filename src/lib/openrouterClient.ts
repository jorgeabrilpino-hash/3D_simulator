export const MODELO_OPENROUTER = process.env.OPENROUTER_MODEL ?? 'google/gemini-flash-1.5'

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generarConOpenRouter(messages: OpenRouterMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY no configurada')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'ChemSim Peru',
    },
    body: JSON.stringify({
      model: MODELO_OPENROUTER,
      messages,
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return data.choices?.[0]?.message?.content ?? ''
}
