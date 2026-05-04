'use client'

import { useSimulatorStore } from '@/store/simulatorStore'

export function FeedbackNormativo() {
  const showFeedback = useSimulatorStore((state) => state.showFeedback)
  const lastFeedback = useSimulatorStore((state) => state.lastFeedback)
  const nextStep = useSimulatorStore((state) => state.nextStep)

  if (!showFeedback || !lastFeedback) return null

  const contenedor = lastFeedback.correcto
    ? 'border-success bg-green-950/95'
    : 'border-error bg-red-950/95'
  const titulo = lastFeedback.correcto ? '✓ ¡Correcto!' : '✕ Incorrecto'

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
      <section className={`w-full max-w-2xl rounded-lg border p-6 shadow-2xl ${contenedor}`}>
        <h2 className="text-2xl font-bold">{titulo}</h2>
        <p className="mt-4 leading-relaxed text-zinc-100">{lastFeedback.texto}</p>
        <p className="mt-4 text-sm italic text-zinc-300">{lastFeedback.normativa}</p>
        {!lastFeedback.correcto && (
          <p className="mt-3 font-semibold text-red-200">
            Puntos perdidos: {lastFeedback.puntosPerdidos}
          </p>
        )}
        <button
          type="button"
          onClick={nextStep}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded bg-accent px-5 py-2 font-semibold text-black transition hover:bg-orange-400"
        >
          Continuar →
        </button>
      </section>
    </div>
  )
}
