'use client'

import { useSimulatorStore } from '@/store/simulatorStore'
import type { Paso } from '@/engine/types'

interface PanelDecisionProps {
  paso: Paso
  totalPasos: number
}

const letras = ['A', 'B', 'C']

export function PanelDecision({ paso, totalPasos }: PanelDecisionProps) {
  const isLocked = useSimulatorStore((state) => state.isLocked)
  const selectObject = useSimulatorStore((state) => state.selectObject)

  return (
    <section className="rounded-lg border border-muted bg-zinc-950 p-5 shadow-xl shadow-black/30">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Paso {paso.orden} de {totalPasos}
      </p>
      <h2 className="mt-3 text-2xl font-bold leading-tight text-foreground">{paso.pregunta}</h2>

      <div className="mt-5 grid gap-3">
        {paso.opciones.map((opcion, index) => (
          <button
            key={opcion.id}
            type="button"
            disabled={isLocked}
            onClick={() => selectObject(opcion.id)}
            className="grid min-h-14 grid-cols-[2.25rem_1fr] items-center gap-3 rounded border border-muted bg-background p-3 text-left transition hover:border-accent hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex size-9 items-center justify-center rounded bg-accent font-bold text-black">
              {letras[index]}
            </span>
            <span className="text-sm text-zinc-100 md:text-base">{opcion.texto}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
