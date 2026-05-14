'use client'

import { useSimulatorStore } from '@/store/simulatorStore'

export function PanelAcciones() {
  const opcionesActuales = useSimulatorStore((state) => state.opcionesActuales)
  const elegirDecision = useSimulatorStore((state) => state.elegirDecision)
  const isLocked = useSimulatorStore((state) => state.isLocked)

  if (!opcionesActuales) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6 pt-20">
      <div className="mx-auto max-w-2xl space-y-3">
        {opcionesActuales.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            disabled={isLocked}
            onClick={() => elegirDecision(opcion.id)}
            className="w-full rounded-lg border border-white/10 bg-[#111111] px-5 py-4 text-left text-sm leading-relaxed text-white transition-all duration-200 hover:border-white/30 hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="mr-3 font-semibold text-zinc-300">{opcion.letra}</span>
            {opcion.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
