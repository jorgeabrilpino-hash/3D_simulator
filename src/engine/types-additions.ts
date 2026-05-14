// engine/types.ts — v2.1
// Añadir estos tipos al archivo types.ts existente
// (complementa WorldState, EscenaId, etc. que ya están)

import type { EscenaId } from './types'

// ─────────────────────────────────────────
// NUEVO SCHEMA DE DECISIONES — pool aleatorio
// Reemplaza ActionDecision de v2.0
// ─────────────────────────────────────────

export type NivelDecision = 'optima' | 'correcta' | 'incorrecta_leve' | 'incorrecta_grave'
export type NivelError = 'leve' | 'grave' | null

export interface DecisionPool {
  id: string
  texto_opcion: string                  // lo que ve el usuario — sin pistas
  nivel: NivelDecision                  // interno, nunca se muestra en UI
  nivel_error: NivelError               // null si es correcta
  efecto_worldstate: Partial<{
    fuga_pct_delta: number
    leyo_kemler: boolean
    epp_puesto: boolean
    llamo_116: boolean
    senalizacion_puesta: boolean
    notifico_dgaam: boolean
    documentos_listos: boolean
    civil_en_peligro: boolean
    radio_peligro_m: number
    tiempo_perdido_seg: number
    errores_criticos_delta: number
  }>
  puntos: number                        // interno, nunca se muestra en UI
  feedback_contextual: string | null    // solo para error leve, nunca para graves
  trigger_escena: EscenaId | null
  objeto_3d_id: string | null
}

export interface ReglaSeleccion {
  opciones_por_ronda: number            // siempre 2 en el MVP
  garantizar_una_no_grave: boolean
  nota: string
}

export interface EscenaDecisionsData {
  escena_id: EscenaId
  titulo: string
  descripcion_inicial: string
  tiempo_limite_seg: number | null
  timeout_trigger: EscenaId | null
  pool_decisiones: DecisionPool[]
  reglas_seleccion: ReglaSeleccion
}

// Opciones formateadas para mostrar en UI — sin información de nivel/puntos
export interface SelectedDecision {
  id: string
  texto: string
  letra: 'A' | 'B'
  objeto_3d_id: string | null
}

// Estado del feedback toast
export interface FeedbackToast {
  visible: boolean
  texto: string
  tipo: 'leve'    // solo aparece para errores leves
}

// ─────────────────────────────────────────
// ACTUALIZACIÓN AL WorldState — añadir campo
// ─────────────────────────────────────────
// Añadir al WorldState existente:
// opcionesActuales: [SelectedDecision, SelectedDecision] | null
// feedbackToast: FeedbackToast | null
