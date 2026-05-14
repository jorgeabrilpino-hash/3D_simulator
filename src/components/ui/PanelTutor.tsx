'use client'

import { useEffect, useMemo, useState } from 'react'

import { useSimulatorStore } from '@/store/simulatorStore'

function fallbackTutor(tipo: string) {
  if (tipo === 'correcto') {
    return 'Tutor IA: buena decision. Conserva la secuencia: identificar, comunicar, aislar y esperar apoyo especializado.'
  }
  if (tipo === 'error_critico') {
    return 'Tutor IA: esta accion puede agravar la fuga o exponer personas. Revisa la cita normativa antes de continuar.'
  }
  return 'Tutor IA: la decision no es ideal. Prioriza el 116, la senalizacion y la distancia segura.'
}

export function PanelTutor() {
  const ultimoFeedback = useSimulatorStore((state) => state.ultimoFeedback)
  const modeloActivo = useSimulatorStore((state) => state.modeloActivo)
  const worldState = useSimulatorStore((state) => state.worldState)
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const endpoint = useMemo(
    () => (modeloActivo === 'anthropic' ? '/api/tutor-fallback' : '/api/tutor'),
    [modeloActivo],
  )

  useEffect(() => {
    if (!ultimoFeedback) return

    const controller = new AbortController()
    setIsLoading(true)
    setText('')

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ultimoFeedback, worldState }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Tutor no disponible')
        return response.text()
      })
      .then((body) => setText(body || fallbackTutor(ultimoFeedback.tipo)))
      .catch(() => setText(fallbackTutor(ultimoFeedback.tipo)))
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [endpoint, ultimoFeedback, worldState])

  if (!ultimoFeedback) return null

  return (
    <aside className="mt-5 rounded border border-zinc-800 bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-orange-300">Tutor IA</p>
        <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{modeloActivo}</span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-300">
        {isLoading ? 'Consultando tutor...' : text || fallbackTutor(ultimoFeedback.tipo)}
      </p>
    </aside>
  )
}
