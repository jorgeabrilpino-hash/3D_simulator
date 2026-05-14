'use client'

import { useSimulatorStore } from '@/store/simulatorStore'

const SCENE_LABELS: Record<string, string> = {
  escena_1: 'Escena 1',
  escena_2: 'Escena 2',
  escena_3: 'Escena 3',
  escena_F_A: 'Escena F-A',
  escena_F_B: 'Escena F-B',
  escena_F_C: 'Escena F-C',
  fin_exitoso: 'Final',
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function leakColor(fugaPct: number) {
  if (fugaPct < 20) return 'bg-green-500'
  if (fugaPct <= 50) return 'bg-yellow-400'
  return 'bg-red-500'
}

export function BarraEstado() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const fugaPct = Math.round(worldState.fuga_pct)
  const critical = worldState.errores_criticos >= 3

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/90 p-4 shadow-xl shadow-black/30 backdrop-blur">
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:items-center">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-zinc-200">Fuga activa</span>
            <span className="font-mono font-bold text-zinc-100">{fugaPct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded bg-zinc-800">
            <div
              className={`h-full rounded ${leakColor(fugaPct)} transition-all`}
              style={{ width: `${Math.min(100, Math.max(0, fugaPct))}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Errores criticos</p>
          <div className="mt-1 flex gap-1 text-xl" aria-label={`${worldState.errores_criticos} errores criticos`}>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={
                  index < worldState.errores_criticos
                    ? critical
                      ? 'text-red-400'
                      : 'text-yellow-400'
                    : 'text-zinc-700'
                }
              >
                !
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Tiempo escena</p>
          <p className="mt-1 font-mono text-xl font-semibold text-zinc-100">
            {formatTime(worldState.tiempo_escena_actual_seg)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Escena actual</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {SCENE_LABELS[worldState.escena_actual] ?? worldState.escena_actual}
          </p>
        </div>
      </div>
    </section>
  )
}
