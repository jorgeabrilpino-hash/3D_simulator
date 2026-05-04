'use client'

import { useCallback } from 'react'

import { obtenerObjetoActivo } from '@/engine/gameEngine'
import { useSimulatorStore } from '@/store/simulatorStore'

import Scene1ABase from './Scene1ABase'

/**
 * Scene1A — Camión cisterna en carretera andina (Modo 1A)
 * Clase ONU: 3 — Líquido inflamable (Gasolina, N° ONU 1203)
 *
 * Objetos interactivos y paso que activan:
 *   'triangulos'       → paso_2 (señalización vial)
 *   'valvula'          → paso_3 (identificar N° ONU)
 *   'telefono'         → paso_4 (llamar 116)
 *   'indicador-viento' → paso_5 (posición de seguridad)
 *   'extintor'         → distractor (no correcto en este modo)
 */
export default function Scene1A() {
  const escenario = useSimulatorStore((state) => state.escenario)
  const currentStep = useSimulatorStore((state) => state.currentStep)
  const isLocked = useSimulatorStore((state) => state.isLocked)
  const selectObject = useSimulatorStore((state) => state.selectObject)

  const activeObjectId = escenario ? obtenerObjetoActivo(escenario, currentStep) : null

  const handleObjectClick = useCallback(
    (id: string) => {
      if (id !== activeObjectId || isLocked) return
      selectObject(id)
    },
    [activeObjectId, isLocked, selectObject]
  )

  return (
    <Scene1ABase
      onObjectClick={handleObjectClick}
      activeObjectId={activeObjectId}
      disabled={isLocked}
    />
  )
}
