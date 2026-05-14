import { generarConAnthropic } from '@/lib/anthropicClient'

export const runtime = 'edge'

export async function POST(request: Request) {
  const body = await request.json()
  const system = 'Eres tutor normativo de ChemSim Peru. Responde breve, especifico y basado en DS 021-2008-MTC y Libro Naranja ONU.'
  const user = `Feedback: ${JSON.stringify(body.ultimoFeedback ?? body.feedback ?? {})}
WorldState: ${JSON.stringify(body.worldState ?? {})}
Explica la decision y una accion siguiente recomendada en maximo 90 palabras.`

  try {
    const text = await generarConAnthropic(system, user)
    return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch {
    return new Response('Tutor fallback no disponible. Usa el feedback normativo como referencia principal.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
