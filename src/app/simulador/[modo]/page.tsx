'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { BarraProgreso } from '@/components/ui/BarraProgreso'
import { FeedbackNormativo } from '@/components/ui/FeedbackNormativo'
import { PanelDecision } from '@/components/ui/PanelDecision'
import { PantallaPuntaje } from '@/components/ui/PantallaPuntaje'
import modo1aData from '@/data/scenarios/modo1a.json'
import type { Escenario } from '@/engine/types'
import { useSimulatorStore } from '@/store/simulatorStore'

const escenarios: Record<string, Escenario> = {
  modo1a: modo1aData as Escenario,
}

const Scene1A = dynamic(() => import('@/components/scene/Modo1A/Scene1A'), { ssr: false })

export default function SimuladorModoPage() {
  const params = useParams()
  const modoParam = Array.isArray(params.modo) ? params.modo[0] : params.modo
  const escenarioDisponible = typeof modoParam === 'string' ? escenarios[modoParam] : undefined

  const escenario = useSimulatorStore((state) => state.escenario)
  const currentStep = useSimulatorStore((state) => state.currentStep)
  const resultado = useSimulatorStore((state) => state.resultado)
  const loadEscenario = useSimulatorStore((state) => state.loadEscenario)
  const setElapsedSeconds = useSimulatorStore((state) => state.setElapsedSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (escenarioDisponible) {
      loadEscenario(escenarioDisponible)
    }
  }, [escenarioDisponible, loadEscenario])

  useEffect(() => {
    if (!escenarioDisponible) return undefined

    const startedAt = Date.now()
    setElapsedSeconds(0)
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [escenarioDisponible, setElapsedSeconds])

  useEffect(() => {
    if (!resultado || !timerRef.current) return
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [resultado])

  if (!escenarioDisponible) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="max-w-md rounded-lg border border-muted bg-zinc-950 p-6 text-center">
          <h1 className="text-2xl font-bold">Modo no disponible</h1>
          <p className="mt-3 text-zinc-300">El escenario solicitado todavía no está habilitado.</p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded bg-accent px-5 py-2 font-semibold text-black"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    )
  }

  if (!escenario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Cargando escenario...
      </main>
    )
  }

  if (resultado) {
    return <PantallaPuntaje />
  }

  const paso = escenario.pasos[currentStep]

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {modoParam === 'modo1a' && (
        <div className="fixed inset-0 z-0">
          <Scene1A />
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 px-4 py-4 md:px-6">
        <BarraProgreso pasoActual={currentStep} totalPasos={escenario.pasos.length} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-4xl px-4 pb-4 md:px-6">
        {paso ? (
          <PanelDecision paso={paso} totalPasos={escenario.pasos.length} />
        ) : (
          <p className="rounded-lg border border-muted bg-zinc-950 p-4 text-zinc-300">
            No hay pasos disponibles.
          </p>
        )}
      </div>

      <FeedbackNormativo />
    </main>
  )
}
