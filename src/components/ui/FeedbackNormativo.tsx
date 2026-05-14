'use client'

import { useSimulatorStore } from '@/store/simulatorStore'
import { PanelTutor } from './PanelTutor'

export function FeedbackNormativo() {
  const showFeedback = useSimulatorStore((state) => state.showFeedback)
  const ultimoFeedback = useSimulatorStore((state) => state.ultimoFeedback)
  const cerrarFeedback = useSimulatorStore((state) => state.cerrarFeedback)

  if (!showFeedback || !ultimoFeedback) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
      <section className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Consecuencia</p>
        <h2 className="mt-1 text-2xl font-bold">Revision de la decision</h2>
        <p className="mt-4 leading-relaxed text-zinc-100">{ultimoFeedback.texto}</p>
        {ultimoFeedback.normativa && (
          <p className="mt-4 text-sm italic text-zinc-300">{ultimoFeedback.normativa}</p>
        )}
        <PanelTutor />
        <button
          type="button"
          onClick={cerrarFeedback}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded border border-zinc-700 px-5 py-2 font-semibold text-zinc-100 transition hover:border-zinc-400"
        >
          Continuar
        </button>
      </section>
    </div>
  )
}
