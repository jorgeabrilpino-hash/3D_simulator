'use client'

import { motion } from 'framer-motion'

import type { ReporteIA as ReporteIAData, ResultadoSimulacion } from '@/engine/types'
import { useSimulatorStore } from '@/store/simulatorStore'

interface ReporteIAProps {
  reporte?: ReporteIAData | null
  isLoading?: boolean
  resultado?: ResultadoSimulacion | null
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-24 animate-pulse rounded bg-zinc-900" />
        <div className="h-24 animate-pulse rounded bg-zinc-900" />
      </div>
    </div>
  )
}

export default function ReporteIA({
  reporte: reporteProp,
  isLoading: isLoadingProp,
  resultado: resultadoProp,
}: ReporteIAProps) {
  const reporteStore = useSimulatorStore((state) => state.reporteIA)
  const isLoadingStore = useSimulatorStore((state) => state.isLoadingReporte)
  const resultadoStore = useSimulatorStore((state) => state.resultado)

  const reporte = reporteProp ?? reporteStore
  const isLoading = isLoadingProp ?? isLoadingStore
  const resultado = resultadoProp ?? resultadoStore

  if (isLoading) return <LoadingState />

  if (!resultado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6 text-zinc-400">
        No hay resultado disponible para generar el reporte.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 text-white md:p-10">
      <motion.div
        className="mx-auto max-w-4xl space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h1 className="text-2xl font-semibold">Analisis del recorrido</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {reporte?.resumen ?? 'El recorrido fue registrado para analisis.'}
          </p>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-lg font-semibold">Camino tomado</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {resultado.camino_tomado.map((escena, index) => (
              <span key={`${escena}-${index}`} className="rounded border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
                {index + 1}. {escena}
              </span>
            ))}
          </div>
        </section>

        {reporte && (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-lg font-semibold">Observaciones</h2>
              <div className="mt-4 space-y-3">
                {reporte.fortalezas.map((item) => (
                  <p key={item} className="rounded border border-zinc-800 p-3 text-sm text-zinc-300">
                    {item}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-lg font-semibold">Temas a reforzar</h2>
              <div className="mt-4 space-y-3">
                {reporte.temas_a_reforzar.map((item) => (
                  <p key={item} className="rounded border border-zinc-800 p-3 text-sm text-zinc-300">
                    {item}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 md:col-span-2">
              <h2 className="text-lg font-semibold">Plan de estudio</h2>
              <div className="mt-4 space-y-3">
                {reporte.plan_estudio.map((item, index) => (
                  <p key={item} className="rounded border border-zinc-800 p-3 text-sm text-zinc-300">
                    {index + 1}. {item}
                  </p>
                ))}
              </div>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  )
}
