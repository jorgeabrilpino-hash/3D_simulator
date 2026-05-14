'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'

import { FeedbackToast } from '@/components/ui/FeedbackToast'
import { HudSuperior } from '@/components/ui/HudSuperior'
import { PanelAcciones } from '@/components/ui/PanelAcciones'
import { PantallaPuntaje } from '@/components/ui/PantallaPuntaje'
import { useSimulatorStore } from '@/store/simulatorStore'

const EscenaActiva = dynamic(
  () => import('@/components/scene/EscenaActiva').then((mod) => mod.EscenaActiva),
  { ssr: false },
)
const SceneWrapper = dynamic(
  () => import('@/components/scene/SceneWrapper').then((mod) => mod.SceneWrapper),
  { ssr: false },
)
const EscenaF = dynamic(() => import('@/components/scene/EscenaF/EscenaF'), { ssr: false })

export default function SimuladorPage() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const resultado = useSimulatorStore((state) => state.resultado)
  const iniciarSimulacion = useSimulatorStore((state) => state.iniciarSimulacion)
  const cargarOpcionesEscena = useSimulatorStore((state) => state.cargarOpcionesEscena)
  const tickTiempo = useSimulatorStore((state) => state.tickTiempo)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    iniciarSimulacion()
  }, [iniciarSimulacion])

  useEffect(() => {
    const interval = window.setInterval(() => {
      tickTiempo()
    }, 1000)
    return () => window.clearInterval(interval)
  }, [tickTiempo])

  useEffect(() => {
    if (!worldState.escena_actual.startsWith('escena_F') && worldState.escena_actual !== 'fin_exitoso') {
      cargarOpcionesEscena(worldState.escena_actual)
    }
  }, [cargarOpcionesEscena, worldState.escena_actual])

  const esFallo = worldState.escena_actual.startsWith('escena_F') || Boolean(resultado?.trigger_fallo)
  const esResultado = Boolean(resultado && !resultado.trigger_fallo)
  const mostrarEscenaActiva = !esFallo && !esResultado

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 z-0">
        <SceneWrapper>
          {mostrarEscenaActiva ? <EscenaActiva escenaId={worldState.escena_actual} /> : null}
        </SceneWrapper>
      </div>

      {esFallo ? <EscenaF /> : null}
      {esResultado ? <PantallaPuntaje /> : null}
      {mostrarEscenaActiva ? (
        <>
          <HudSuperior />
          <FeedbackToast />
          <PanelAcciones />
        </>
      ) : null}
    </main>
  )
}
