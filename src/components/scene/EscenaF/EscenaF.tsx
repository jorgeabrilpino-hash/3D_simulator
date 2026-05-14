'use client'

import { useMemo, useState } from 'react'

import { useSimulatorStore } from '@/store/simulatorStore'

import EscenaFVisual from './EscenaFVisual'

type EscenaFVersion = 'A' | 'B' | 'C'

const TRIGGER_DESCRIPTION = {
  timeout_deteccion:
    'La fuga estuvo activa durante 5 minutos sin ser detectada ni controlada.',
  errores_acumulados:
    'Tres errores criticos acumularon condiciones inseguras y convirtieron la fuga en derrame incontrolable.',
  fuga_incontrolable:
    'La fuga alcanzo un nivel incontrolable sin una llamada oportuna al 116.',
  abandono_camion:
    'El camion quedo sin supervision durante una emergencia activa.',
  reparacion_improvisada:
    'El intento de reparar la valvula sin apoyo especializado agravo la fuga activa.',
  civil_afectado:
    'Un civil permanecio expuesto dentro del area de peligro sin ser retirado a tiempo.',
}

const PROTOCOL_STEPS = [
  'Detectar la fuga desde una posicion segura y leer Kemler/ONU 1830.',
  'Apagar motor, usar EPP y evitar contacto directo con la valvula.',
  'Llamar al 116, informar acido sulfurico ONU 1830 y senalizar la via.',
  'Preparar SDS, rutas y notificar a DGAAM cuando corresponda.',
  'Mantener zona segura, alejar civiles y esperar a bomberos sin reparar la valvula.',
]

function getVersion(escenaActual: string, triggerFallo: string | null | undefined): EscenaFVersion {
  if (escenaActual === 'escena_F_A') return 'A'
  if (escenaActual === 'escena_F_B') return 'B'
  if (escenaActual === 'escena_F_C') return 'C'

  if (triggerFallo === 'timeout_deteccion') return 'A'
  if (triggerFallo === 'errores_acumulados' || triggerFallo === 'fuga_incontrolable') return 'B'
  if (triggerFallo === 'abandono_camion' || triggerFallo === 'reparacion_improvisada' || triggerFallo === 'civil_afectado') return 'C'
  return 'C'
}

export default function EscenaF() {
  const {
    worldState,
    resultado,
    accionesEjecutadas,
    resetSimulador,
  } = useSimulatorStore()
  const [showProtocol, setShowProtocol] = useState(false)

  const version = getVersion(
    worldState.escena_actual,
    resultado?.trigger_fallo ?? worldState.trigger_fallo,
  )

  const triggerDescription = useMemo(() => {
    const lastAction = accionesEjecutadas[accionesEjecutadas.length - 1]
    const trigger = resultado?.trigger_fallo ?? worldState.trigger_fallo

    if (lastAction?.tipo === 'error_critico') {
      return lastAction.descripcion
    }

    if (trigger && trigger in TRIGGER_DESCRIPTION) {
      return TRIGGER_DESCRIPTION[trigger]
    }

    return 'La secuencia de decisiones derivo en fallo catastrofico.'
  }, [accionesEjecutadas, resultado?.trigger_fallo, worldState.trigger_fallo])

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <EscenaFVisual
        version={version}
        triggerDescription={triggerDescription}
        worldStateFinal={{
          fuga_pct: resultado?.worldState_final.fuga_pct ?? worldState.fuga_pct,
          errores_criticos:
            resultado?.worldState_final.errores_criticos ?? worldState.errores_criticos,
          tiempo_total_seg: resultado?.tiempo_total_seg ?? worldState.tiempo_escena_actual_seg,
        }}
        onRetry={resetSimulador}
        onViewProtocol={() => setShowProtocol(true)}
      />

      {showProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-neutral-200 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Protocolo correcto</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Flujo esperado para acido sulfurico ONU 1830, Clase 8.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProtocol(false)}
                className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Cerrar
              </button>
            </div>
            <ol className="space-y-3">
              {PROTOCOL_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 rounded bg-neutral-900 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-900 text-sm font-semibold text-red-100">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
