// src/engine/worldState.ts — v2.0
// Motor central del simulador. Reemplaza gameEngine.ts de v1.

import type {
  WorldState,
  ActionDecision,
  EscenaId,
  TriggerFallo,
  ResultadoSimulacion,
  DesglosePuntaje,
  NivelDesempeno
} from './types'

// ─────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────
export const initialWorldState: WorldState = {
  fuga_pct: 5,
  radio_peligro_m: 3,
  tiempo_deteccion_seg: 0,
  tiempo_escena_actual_seg: 0,
  leyo_kemler: false,
  epp_puesto: false,
  llamo_116: false,
  senalizacion_puesta: false,
  notifico_dgaam: false,
  documentos_listos: false,
  errores_leves: 0,
  errores_criticos: 0,
  trigger_fallo: null,
  civil_en_peligro: false,
  escena_actual: 'escena_1',
  historial_escenas: ['escena_1']
}

// ─────────────────────────────────────────
// APLICAR ACCIÓN
// ─────────────────────────────────────────
export function applyAction(
  state: WorldState,
  action: ActionDecision
): WorldState {
  const next = { ...state }

  // Aplicar efectos del worldState
  const efecto = action.efecto_worldstate

  if (efecto.fuga_pct !== undefined) {
    next.fuga_pct = efecto.fuga_pct
  }
  if (efecto.fuga_pct_delta !== undefined) {
    next.fuga_pct = Math.min(100, Math.max(0, next.fuga_pct + efecto.fuga_pct_delta))
  }
  if (efecto.leyo_kemler !== undefined) next.leyo_kemler = efecto.leyo_kemler
  if (efecto.epp_puesto !== undefined) next.epp_puesto = efecto.epp_puesto
  if (efecto.llamo_116 !== undefined) next.llamo_116 = efecto.llamo_116
  if (efecto.senalizacion_puesta !== undefined) next.senalizacion_puesta = efecto.senalizacion_puesta
  if (efecto.notifico_dgaam !== undefined) next.notifico_dgaam = efecto.notifico_dgaam
  if (efecto.documentos_listos !== undefined) next.documentos_listos = efecto.documentos_listos
  if (efecto.civil_en_peligro !== undefined) next.civil_en_peligro = efecto.civil_en_peligro
  if (efecto.radio_peligro_m !== undefined) next.radio_peligro_m = efecto.radio_peligro_m
  if (efecto.tiempo_perdido_seg !== undefined) {
    next.tiempo_escena_actual_seg += efecto.tiempo_perdido_seg
  }

  // Incrementar errores críticos
  if (action.tipo === 'error_leve') {
    next.errores_leves = (state.errores_leves ?? 0) + 1
  }

  if (efecto.errores_criticos_delta !== undefined) {
    next.errores_criticos = Math.max(0, state.errores_criticos + efecto.errores_criticos_delta)
  } else if (action.tipo === 'error_critico') {
    next.errores_criticos = state.errores_criticos + 1
  }

  // Radio de peligro crece con fuga_pct
  if (next.fuga_pct > 30 && !efecto.radio_peligro_m) {
    next.radio_peligro_m = Math.min(50, 3 + (next.fuga_pct / 2))
  }

  // Civil en peligro si radio supera 40m (distancia al vehículo detenido)
  if (next.radio_peligro_m >= 40) {
    next.civil_en_peligro = true
  }

  // Evaluar triggers de fallo
  next.trigger_fallo =
    state.trigger_fallo ??
    evaluarTriggerFalloPorAccion(action) ??
    evaluarTriggerFallo(next)

  return next
}

// ─────────────────────────────────────────
// EVALUAR TRIGGER DE FALLO
// ─────────────────────────────────────────
function evaluarTriggerFallo(state: WorldState): TriggerFallo | null {
  if (state.errores_criticos >= 3) return 'errores_acumulados'
  if (state.fuga_pct >= 70 && !state.llamo_116) return 'fuga_incontrolable'
  return null
}

function evaluarTriggerFalloPorAccion(action: ActionDecision): TriggerFallo | null {
  if (action.id === 'e3_abandonar_camion') return 'abandono_camion'
  if (action.id === 'e3_reparar_valvula') return 'reparacion_improvisada'
  if (action.id === 'e3_D') return 'reparacion_improvisada'
  return null
}

// ─────────────────────────────────────────
// EVALUAR TRANSICIÓN ENTRE ESCENAS
// ─────────────────────────────────────────
export function evaluarTransicion(
  state: WorldState,
  tiempoTranscurrido: number
): EscenaId | null {
  const escena = state.escena_actual

  // Si hay trigger de fallo activo → Escena F correspondiente
  if (state.trigger_fallo) {
    if (state.trigger_fallo === 'timeout_deteccion') return 'escena_F_A'
    if (state.trigger_fallo === 'errores_acumulados') return 'escena_F_B'
    if (state.trigger_fallo === 'fuga_incontrolable') return 'escena_F_B'
    if (state.trigger_fallo === 'abandono_camion') return 'escena_F_C'
    if (state.trigger_fallo === 'reparacion_improvisada') return 'escena_F_C'
    if (state.trigger_fallo === 'civil_afectado') return 'escena_F_C'
  }

  if (escena === 'escena_1') {
    // Timeout de 5 minutos sin detectar
    if (tiempoTranscurrido >= 300) return 'escena_F_A'
    // Sigue en escena_1 hasta que el usuario detecte la fuga
    return null
  }

  if (escena === 'escena_2') {
    // Fuga incontrolable sin llamar
    if (state.fuga_pct >= 70 && !state.llamo_116) return 'escena_F_B'
    // 3 errores críticos
    if (state.errores_criticos >= 3) return 'escena_F_B'
    // Camino exitoso: llamó al 116
    if (state.llamo_116) return 'escena_3'
    return null
  }

  if (escena === 'escena_3') {
    // Civil en peligro no resuelto en 30 segundos
    if (state.civil_en_peligro && tiempoTranscurrido >= 30) return 'escena_F_C'
    // Abandono o error crítico
    if (state.trigger_fallo) return 'escena_F_C'
    return null
  }

  if (escena === 'escena_4' || escena === 'escena_5' || escena === 'escena_6') {
    if (state.trigger_fallo) return 'escena_F_C'
    return null
  }

  return null
}

// ─────────────────────────────────────────
// NAVEGAR A NUEVA ESCENA
// ─────────────────────────────────────────
export function navegarAEscena(
  state: WorldState,
  destino: EscenaId
): WorldState {
  const trigger_fallo =
    state.trigger_fallo ??
    (destino === 'escena_F_A'
      ? 'timeout_deteccion'
      : destino === 'escena_F_B'
        ? evaluarTriggerFallo(state)
      : destino === 'escena_F_C'
        ? state.civil_en_peligro
          ? 'civil_afectado'
          : 'reparacion_improvisada'
        : null)

  return {
    ...state,
    trigger_fallo,
    escena_actual: destino,
    tiempo_escena_actual_seg: 0,
    historial_escenas: [...state.historial_escenas, destino]
  }
}

// ─────────────────────────────────────────
// CALCULAR PUNTAJE v2
// ─────────────────────────────────────────
export function calcularPuntaje(
  state: WorldState,
  accionesEjecutadas: ActionDecision[],
  tiempoDeteccionSeg: number
): DesglosePuntaje {
  let deteccion = 0
  let identificacion = 0
  let primera_respuesta = 0
  let cadena_limpia = 0
  let espera_activa = 0
  let cumplimiento = 0

  // Detección rápida
  if (tiempoDeteccionSeg < 60) deteccion = 20
  else if (tiempoDeteccionSeg < 180) deteccion = 12
  else if (tiempoDeteccionSeg < 300) deteccion = 5

  // Identificación correcta (leyó Kemler + SDS)
  if (state.leyo_kemler) identificacion += 8
  // +7 si consultó SDS (acción específica)
  const leySDS = accionesEjecutadas.find(a => a.id === 'e2_consultar_sds')
  if (leySDS) identificacion += 7

  // Primera respuesta correcta
  if (state.llamo_116) primera_respuesta += 15
  if (state.senalizacion_puesta) primera_respuesta += 10
  if (state.epp_puesto) primera_respuesta += 5

  // Cadena limpia (bonus si 0 errores críticos)
  if (state.errores_criticos === 0) cadena_limpia = 15

  // Espera activa en E3
  if (!state.trigger_fallo && state.escena_actual !== 'escena_F_A'
      && state.escena_actual !== 'escena_F_B'
      && state.escena_actual !== 'escena_F_C') {
    espera_activa = 10
  }

  // Cumplimiento normativo completo
  if (state.notifico_dgaam) cumplimiento += 5
  if (state.documentos_listos) cumplimiento += 5

  const total = deteccion + identificacion + primera_respuesta +
                cadena_limpia + espera_activa + cumplimiento

  return {
    deteccion_rapida: deteccion,
    identificacion_correcta: identificacion,
    primera_respuesta,
    cadena_limpia,
    espera_activa,
    cumplimiento_normativo: cumplimiento,
    total
  }
}

// ─────────────────────────────────────────
// CALCULAR RESULTADO FINAL
// ─────────────────────────────────────────
export function calcularResultado(
  state: WorldState,
  accionesEjecutadas: ActionDecision[],
  tiempoTotalSeg: number
): ResultadoSimulacion {
  const desglose = calcularPuntaje(state, accionesEjecutadas, state.tiempo_deteccion_seg)
  const porcentaje = desglose.total
  const aprobado = porcentaje >= 70 && state.trigger_fallo === null

  let nivel: NivelDesempeno
  if (state.trigger_fallo !== null) nivel = 'fallo_catastrofico'
  else if (porcentaje >= 90) nivel = 'excelente'
  else if (porcentaje >= 70) nivel = 'aprobado'
  else if (porcentaje >= 50) nivel = 'en_desarrollo'
  else nivel = 'reprobado'

  return {
    worldState_final: state,
    puntaje_total: desglose.total,
    puntaje_maximo: 100,
    porcentaje,
    nivel,
    aprobado,
    tiempo_total_seg: tiempoTotalSeg,
    camino_tomado: state.historial_escenas,
    acciones_ejecutadas: accionesEjecutadas.map(a => a.id),
    trigger_fallo: state.trigger_fallo,
    fecha: new Date().toISOString()
  }
}

// ─────────────────────────────────────────
// TICK DEL RELOJ (llamar cada segundo)
// ─────────────────────────────────────────
export function tickReloj(state: WorldState): WorldState {
  const next = { ...state }
  next.tiempo_escena_actual_seg += 1

  // Fuga crece sola con el tiempo si no se ha actuado
  if (!state.llamo_116 && !state.epp_puesto) {
    // +2% cada 30 segundos de inacción
    if (next.tiempo_escena_actual_seg % 30 === 0) {
      next.fuga_pct = Math.min(100, next.fuga_pct + 2)
    }
  }

  // Re-evaluar trigger de fallo con nuevo estado
  const timeoutTrigger: TriggerFallo | null =
    next.escena_actual === 'escena_1' && next.tiempo_escena_actual_seg >= 300
      ? 'timeout_deteccion'
      : null
  const civilTrigger: TriggerFallo | null =
    next.escena_actual === 'escena_3' && next.civil_en_peligro && next.tiempo_escena_actual_seg >= 30
      ? 'civil_afectado'
      : null
  const newTrigger = timeoutTrigger ?? civilTrigger ?? evaluarTriggerFallo(next)
  if (newTrigger && !next.trigger_fallo) {
    next.trigger_fallo = newTrigger
  }

  return next
}
