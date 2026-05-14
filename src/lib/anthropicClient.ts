export const MODELO_FALLBACK = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

export async function generarConAnthropic(system: string, user: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELO_FALLBACK,
      max_tokens: 700,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic error ${response.status}`)
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>
  }

  return data.content?.map((item) => item.text ?? '').join('') ?? ''
}
