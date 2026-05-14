'use client'

import { useCallback, useMemo } from 'react'

import { useSimulatorStore } from '@/store/simulatorStore'

import Scene1Base, { Escena1ContenidoBase } from './Scene1Base'

const OBJECT_IDS = [
  'zona_valvula',
  'panel_kemler',
  'kit_epp',
  'cabina_motor',
  'extintor',
  'hoja_sds',
  'zona_confirmacion',
  'triangulos',
]

export default function Scene1() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const opcionesActuales = useSimulatorStore((state) => state.opcionesActuales)
  const elegirDecision = useSimulatorStore((state) => state.elegirDecision)

  const disabledObjects = useMemo(() => {
    const activos = new Set(
      opcionesActuales
        ?.map((opcion) => opcion.objeto_3d_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    )
    return new Set(OBJECT_IDS.filter((id) => !activos.has(id)))
  }, [opcionesActuales])

  const handleObjectClick = useCallback(
    (objectId: string) => {
      const decision = opcionesActuales?.find((opcion) => opcion.objeto_3d_id === objectId)
      if (decision) elegirDecision(decision.id)
    },
    [elegirDecision, opcionesActuales],
  )

  return (
    <Scene1Base
      onObjectClick={handleObjectClick}
      disabledObjects={disabledObjects}
      fugaPct={worldState.fuga_pct}
    />
  )
}

export function Escena1Contenido() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const opcionesActuales = useSimulatorStore((state) => state.opcionesActuales)
  const elegirDecision = useSimulatorStore((state) => state.elegirDecision)

  const disabledObjects = useMemo(() => {
    const activos = new Set(
      opcionesActuales
        ?.map((opcion) => opcion.objeto_3d_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    )
    return new Set(OBJECT_IDS.filter((id) => !activos.has(id)))
  }, [opcionesActuales])

  const handleObjectClick = useCallback(
    (objectId: string) => {
      const decision = opcionesActuales?.find((opcion) => opcion.objeto_3d_id === objectId)
      if (decision) elegirDecision(decision.id)
    },
    [elegirDecision, opcionesActuales],
  )

  return (
    <Escena1ContenidoBase
      onObjectClick={handleObjectClick}
      disabledObjects={disabledObjects}
      fugaPct={worldState.fuga_pct}
    />
  )
}
