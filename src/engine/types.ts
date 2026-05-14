// src/engine/types.ts — v2.0
// REEMPLAZA COMPLETAMENTE el types.ts de v1

// ─────────────────────────────────────────
// WORLD STATE — viaja entre escenas
// ─────────────────────────────────────────
export interface WorldState {
  // Progresión de la fuga
  fuga_pct: number                    // 0-100, empieza en 5
  radio_peligro_m: number             // metros, empieza en 3

  // Tiempos
  tiempo_deteccion_seg: number        // 0 hasta que detecta la fuga
  tiempo_escena_actual_seg: number    // reloj de la escena actual

  // Acciones completadas
  leyo_kemler: boolean
  epp_puesto: boolean
  llamo_116: boolean
  senalizacion_puesta: boolean
  notifico_dgaam: boolean
  documentos_listos: boolean

  // Estado de errores
  errores_leves: number
  errores_criticos: number            // acumulados, 3 = trigger Escena F
  trigger_fallo: TriggerFallo | null  // qué causó el fallo (si aplica)

  // Civiles
  civil_en_peligro: boolean

  // Navegación
  escena_actual: EscenaId
  historial_escenas: EscenaId[]       // registro del camino tomado
}

export type EscenaId =
  | 'escena_1'
  | 'escena_2'
  | 'escena_3'
  | 'escena_4'
  | 'escena_5'
  | 'escena_6'
  | 'escena_F_A'   // fallo por timeout E1
  | 'escena_F_B'   // fallo por errores críticos E2
  | 'escena_F_C'   // fallo por abandono/civil E3
  | 'fin_exitoso'

export type TriggerFallo =
  | 'timeout_deteccion'       // no detectó en 5 min
  | 'errores_acumulados'      // 3 errores críticos
  | 'fuga_incontrolable'      // fuga_pct >= 70 sin llamar 116
  | 'abandono_camion'         // se alejó > 50m
  | 'reparacion_improvisada'  // intentó reparar la fuga sin apoyo especializado
  | 'civil_afectado'          // no actuó ante civil en peligro

// ─────────────────────────────────────────
// DECISIONES — nuevo schema v2
// reemplaza el schema de Paso/Opcion de v1
// ─────────────────────────────────────────
export type TipoAccion =
  | 'correcto'
  | 'error_leve'
  | 'error_critico'
  | 'neutro'

export interface EfectoWorldState {
  fuga_pct?: number             // valor absoluto nuevo (no delta)
  fuga_pct_delta?: number       // incremento relativo
  leyo_kemler?: boolean
  epp_puesto?: boolean
  llamo_116?: boolean
  senalizacion_puesta?: boolean
  notifico_dgaam?: boolean
  documentos_listos?: boolean
  civil_en_peligro?: boolean
  radio_peligro_m?: number
  tiempo_perdido_seg?: number   // penalización de tiempo
  errores_criticos_delta?: number
}

export interface ActionDecision {
  id: string
  escena: EscenaId
  descripcion: string
  tipo: TipoAccion
  efecto_worldstate: EfectoWorldState
  puntos: number                // positivo = suma, negativo = resta
  feedback_texto: string
  articulo_normativo: string
  trigger_escena: EscenaId | null  // null = no navega, string = navega
  objeto_3d_id: string | null      // ID del objeto clickable en la escena
}

export interface DecisionsData {
  escena_id: EscenaId
  titulo: string
  descripcion_inicial: string
  tiempo_limite_seg: number | null   // null = sin límite
  timeout_trigger: EscenaId | null   // a dónde va si se acaba el tiempo
  acciones: ActionDecision[]
}

export type NivelDecision = 'optima' | 'correcta' | 'incorrecta_leve' | 'incorrecta_grave'
export type NivelError = 'leve' | 'grave' | null

export interface DecisionPool {
  id: string
  texto_opcion: string
  nivel: NivelDecision
  nivel_error: NivelError
  efecto_worldstate: Partial<WorldState & {
    fuga_pct_delta: number
    errores_criticos_delta: number
    tiempo_perdido_seg: number
  }>
  puntos: number
  feedback_contextual: string | null
  trigger_escena: EscenaId | null
  objeto_3d_id: string | null
}

export interface SelectedDecision {
  id: string
  texto: string
  letra: 'A' | 'B'
  objeto_3d_id: string | null
}

export interface ReglaSeleccion {
  opciones_por_ronda: number
  garantizar_una_no_grave: boolean
  nota?: string
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

export interface FeedbackToastState {
  visible: boolean
  texto: string
}

// ─────────────────────────────────────────
// RESULTADO FINAL
// ─────────────────────────────────────────
export type NivelDesempeno = 'excelente' | 'aprobado' | 'en_desarrollo' | 'reprobado' | 'fallo_catastrofico'

export interface ResultadoSimulacion {
  worldState_final: WorldState
  puntaje_total: number
  puntaje_maximo: number
  porcentaje: number
  nivel: NivelDesempeno
  aprobado: boolean
  tiempo_total_seg: number
  camino_tomado: EscenaId[]
  acciones_ejecutadas: string[]    // IDs de acciones
  trigger_fallo: TriggerFallo | null
  fecha: string
}

// ─────────────────────────────────────────
// PUNTAJE — categorías v2
// ─────────────────────────────────────────
export interface DesglosePuntaje {
  deteccion_rapida: number        // máx 20
  identificacion_correcta: number // máx 15
  primera_respuesta: number       // máx 30
  cadena_limpia: number           // bonus 15
  espera_activa: number           // máx 10
  cumplimiento_normativo: number  // máx 10
  total: number                   // máx 100
}

// ─────────────────────────────────────────
// REPORTE IA — estructura del JSON que
// devuelve /api/reporte (sin cambios de v1)
// ─────────────────────────────────────────
export interface ReporteIA {
  resumen: string
  fortalezas: string[]
  temas_a_reforzar: string[]
  plan_estudio: string[]
  mensaje_motivacional: string
}

// ─────────────────────────────────────────
// PANEL DOCENTE — datos v2
// ─────────────────────────────────────────
export interface RegistroAlumno {
  id: string
  nombre: string
  empresa_id?: string
  simulaciones: ResultadoSimulacion[]
  mejor_puntaje: number
  aprobado: boolean
  trigger_fallos_frecuentes: TriggerFallo[]
}
