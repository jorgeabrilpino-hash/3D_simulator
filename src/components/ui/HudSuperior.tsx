'use client'

import { motion } from 'framer-motion'

import { useSimulatorStore } from '@/store/simulatorStore'

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
  const seg = seconds % 60
  return `${min}:${seg.toString().padStart(2, '0')}`
}

export function HudSuperior() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const { fuga_pct, radio_peligro_m, errores_criticos, errores_leves, tiempo_escena_actual_seg } = worldState

  const fugaPct = Math.round(fuga_pct)
  const litrosDerramados = Math.round(fuga_pct * 100)
  const colorFuga = fuga_pct > 60 ? '#ef4444' : fuga_pct > 30 ? '#f97316' : '#22c55e'
  const nivelAlerta = errores_criticos >= 2 ? 'CRITICO' : errores_criticos === 1 ? 'ALERTA' : 'ESTABLE'
  const colorAlerta = errores_criticos >= 2 ? '#ef4444' : errores_criticos === 1 ? '#f97316' : '#22c55e'
  const tiempoFormato = formatTime(tiempo_escena_actual_seg)

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-40 px-4 pt-3">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-black/70 px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="flex min-w-[80px] flex-col items-center">
            <span className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Derramado</span>
            <motion.span
              key={litrosDerramados}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              className="font-mono text-lg font-bold text-white"
            >
              {litrosDerramados.toLocaleString()}L
            </motion.span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="min-w-[150px] flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Nivel de fuga</span>
              <span className="font-mono text-[10px]" style={{ color: colorFuga }}>
                {fugaPct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: colorFuga }}
                animate={{ width: `${Math.min(100, Math.max(0, fugaPct))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex min-w-[70px] flex-col items-center">
            <span className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Radio</span>
            <span className="font-mono text-lg font-bold text-orange-400">{radio_peligro_m}m</span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Errores</span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`crit-${i}`}
                    animate={{
                      backgroundColor: i < errores_criticos ? '#ef4444' : '#1f2937',
                      scale: i < errores_criticos && errores_criticos > 0 ? [1, 1.3, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-3 w-3 rounded-sm border border-white/10"
                    title="Error critico"
                  />
                ))}
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`leve-${i}`}
                    animate={{
                      backgroundColor: i < (errores_leves ?? 0) ? '#eab308' : '#1f2937',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 w-3 rounded-sm border border-white/10"
                    title="Error leve"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex min-w-[70px] flex-col items-center">
            <span className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Estado</span>
            <motion.span animate={{ color: colorAlerta }} className="text-xs font-bold uppercase tracking-wide">
              {nivelAlerta}
            </motion.span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex min-w-[50px] flex-col items-center">
            <span className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Tiempo</span>
            <span className="font-mono text-sm text-white">{tiempoFormato}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
