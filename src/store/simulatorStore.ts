'use client'

import escena1 from '@/data/decisions/escena1.json'
import escena2 from '@/data/decisions/escena2.json'
import escena3 from '@/data/decisions/escena3.json'
import escena4 from '@/data/decisions/escena4.json'
import escena5 from '@/data/decisions/escena5.json'
import escena6 from '@/data/decisions/escena6.json'
import { formatearParaUI, incrementarRun, seleccionarDosOpciones } from '@/engine/decisionSelector'
import {
  applyAction,
  calcularResultado,
  evaluarTransicion,
  initialWorldState,
  navegarAEscena,
  tickReloj,
} from '@/engine/worldState'
import { audioManager } from '@/lib/audioManager'
import type {
  ActionDecision,
  DecisionPool,
  EscenaDecisionsData,
  EscenaId,
  FeedbackToastState,
  ReporteIA,
  ResultadoSimulacion,
  SelectedDecision,
  WorldState,
} from '@/engine/types'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const DECISIONS_BY_SCENE: Partial<Record<EscenaId, EscenaDecisionsData>> = {
  escena_1: escena1 as unknown as EscenaDecisionsData,
  escena_2: escena2 as unknown as EscenaDecisionsData,
  escena_3: escena3 as unknown as EscenaDecisionsData,
  escena_4: escena4 as unknown as EscenaDecisionsData,
  escena_5: escena5 as unknown as EscenaDecisionsData,
  escena_6: escena6 as unknown as EscenaDecisionsData,
}

function getSelectionKey(decisions: [DecisionPool, DecisionPool]) {
  return decisions.map((decision) => decision.id).sort().join('|')
}

function toActionDecision(decision: DecisionPool, escena: EscenaId): ActionDecision {
  return {
    id: decision.id,
    escena,
    descripcion: decision.texto_opcion,
    tipo:
      decision.nivel_error === 'grave'
        ? 'error_critico'
        : decision.nivel_error === 'leve'
          ? 'error_leve'
          : 'correcto',
    efecto_worldstate: decision.efecto_worldstate,
    puntos: decision.puntos,
    feedback_texto: decision.feedback_contextual ?? '',
    articulo_normativo: '',
    trigger_escena: decision.trigger_escena,
    objeto_3d_id: decision.objeto_3d_id,
  }
}

function registrarTiempoDeteccion(
  previousState: WorldState,
  nextState: WorldState,
  tiempoInicioSeg: number,
) {
  if (previousState.escena_actual !== 'escena_1' || nextState.tiempo_deteccion_seg !== 0) {
    return nextState
  }

  return {
    ...nextState,
    tiempo_deteccion_seg: Math.floor(Date.now() / 1000) - tiempoInicioSeg,
  }
}

function navegarConResultado(
  state: WorldState,
  destino: EscenaId | null,
  acciones: ActionDecision[],
  tiempoInicioSeg: number,
) {
  if (!destino) {
    return { worldState: state, resultado: null as ResultadoSimulacion | null }
  }

  const worldState = navegarAEscena(state, destino)
  const resultado =
    destino.startsWith('escena_F') || destino === 'fin_exitoso'
      ? calcularResultado(worldState, acciones, Math.floor(Date.now() / 1000) - tiempoInicioSeg)
      : null

  return { worldState, resultado }
}

function playDecisionAudio(decision: DecisionPool) {
  if (decision.nivel_error === 'leve') {
    audioManager.playWarning()
  } else if (decision.nivel_error === 'grave') {
    audioManager.playDanger()
  } else {
    audioManager.playClick()
  }
}

function playNavigationAudio(destino: EscenaId | null, dangerAlreadyPlayed = false) {
  if (!destino) return
  if (destino === 'fin_exitoso') {
    audioManager.playSuccess()
    return
  }
  if (destino.startsWith('escena_F')) {
    if (!dangerAlreadyPlayed) audioManager.playDanger()
    return
  }
  audioManager.playTransition()
}

interface SimulatorState {
  worldState: WorldState
  accionesEjecutadas: ActionDecision[]
  tiempoInicioSeg: number
  puntajeInterno: number

  opcionesActuales: [SelectedDecision, SelectedDecision] | null
  ultimaSeleccionKey: string | null
  ultimaSeleccionPorEscena: Partial<Record<EscenaId, string>>
  feedbackToast: FeedbackToastState | null

  ultimoFeedback: {
    texto: string
    normativa: string
    tipo: ActionDecision['tipo']
    puntos: number
  } | null
  showFeedback: boolean
  isLocked: boolean

  resultado: ResultadoSimulacion | null
  reporteIA: ReporteIA | null
  isLoadingReporte: boolean
  modeloActivo: 'openrouter' | 'anthropic'

  iniciarSimulacion: () => void
  cargarOpcionesEscena: (escenaId: EscenaId) => void
  elegirDecision: (decisionId: string) => void
  cerrarFeedbackToast: () => void
  ejecutarAccion: (accion: ActionDecision) => void
  tickTiempo: () => void
  cerrarFeedback: () => void
  setReporteIA: (reporte: ReporteIA) => void
  setLoadingReporte: (loading: boolean) => void
  setModeloActivo: (modelo: 'openrouter' | 'anthropic') => void
  resetSimulador: () => void
}

export const useSimulatorStore = create<SimulatorState>()(
  subscribeWithSelector((set, get) => ({
    worldState: initialWorldState,
    accionesEjecutadas: [],
    tiempoInicioSeg: 0,
    puntajeInterno: 0,
    opcionesActuales: null,
    ultimaSeleccionKey: null,
    ultimaSeleccionPorEscena: {},
    feedbackToast: null,
    ultimoFeedback: null,
    showFeedback: false,
    isLocked: false,
    resultado: null,
    reporteIA: null,
    isLoadingReporte: false,
    modeloActivo: 'openrouter',

    iniciarSimulacion: () => {
      set({
        worldState: { ...initialWorldState },
        accionesEjecutadas: [],
        tiempoInicioSeg: Math.floor(Date.now() / 1000),
        puntajeInterno: 0,
        opcionesActuales: null,
        ultimaSeleccionKey: null,
        ultimaSeleccionPorEscena: {},
        feedbackToast: null,
        ultimoFeedback: null,
        showFeedback: false,
        isLocked: false,
        resultado: null,
        reporteIA: null,
        isLoadingReporte: false,
      })
    },

    cargarOpcionesEscena: (escenaId) => {
      const decisionsData = DECISIONS_BY_SCENE[escenaId]
      if (!decisionsData || decisionsData.pool_decisiones.length < 2) {
        set({ opcionesActuales: null })
        return
      }

      let selected = seleccionarDosOpciones(decisionsData.pool_decisiones)
      let key = getSelectionKey(selected)

      const ultimaKeyEscena = get().ultimaSeleccionPorEscena[escenaId]

      if (decisionsData.pool_decisiones.length > 2) {
        for (let attempt = 0; attempt < 5 && key === ultimaKeyEscena; attempt += 1) {
          selected = seleccionarDosOpciones(decisionsData.pool_decisiones)
          key = getSelectionKey(selected)
        }
      }

      set({
        opcionesActuales: formatearParaUI(selected) as [SelectedDecision, SelectedDecision],
        ultimaSeleccionKey: key,
        ultimaSeleccionPorEscena: {
          ...get().ultimaSeleccionPorEscena,
          [escenaId]: key,
        },
      })
    },

    elegirDecision: (decisionId) => {
      const { worldState, accionesEjecutadas, isLocked, tiempoInicioSeg, puntajeInterno } = get()
      if (isLocked) return

      const decisionsData = DECISIONS_BY_SCENE[worldState.escena_actual]
      const decision = decisionsData?.pool_decisiones.find((item) => item.id === decisionId)
      if (!decision) return

      playDecisionAudio(decision)

      const accion = toActionDecision(decision, worldState.escena_actual)
      const estadoAplicado = applyAction(worldState, accion)
      const estadoFinal = registrarTiempoDeteccion(worldState, estadoAplicado, tiempoInicioSeg)
      const nuevasAcciones = [...accionesEjecutadas, accion]
      const nuevoPuntaje = puntajeInterno + decision.puntos

      if (decision.nivel_error === 'leve') {
        set({
          worldState: estadoFinal,
          accionesEjecutadas: nuevasAcciones,
          puntajeInterno: nuevoPuntaje,
          opcionesActuales: null,
          feedbackToast: {
            visible: true,
            texto: decision.feedback_contextual ?? 'Tu decision tuvo una consecuencia en la emergencia.',
          },
          isLocked: true,
          showFeedback: false,
          ultimoFeedback: null,
        })
        return
      }

      const destino = decision.trigger_escena ?? evaluarTransicion(estadoFinal, estadoFinal.tiempo_escena_actual_seg)
      const navegacion = navegarConResultado(estadoFinal, destino, nuevasAcciones, tiempoInicioSeg)
      playNavigationAudio(destino, decision.nivel_error === 'grave')

      set({
        worldState: navegacion.worldState,
        accionesEjecutadas: nuevasAcciones,
        puntajeInterno: nuevoPuntaje,
        opcionesActuales: null,
        feedbackToast: null,
        isLocked: false,
        showFeedback: false,
        ultimoFeedback: null,
        resultado: navegacion.resultado ?? get().resultado,
      })
    },

    cerrarFeedbackToast: () => {
      const { feedbackToast, worldState, accionesEjecutadas, tiempoInicioSeg } = get()
      if (!feedbackToast?.visible) return

      const ultimaAccion = accionesEjecutadas[accionesEjecutadas.length - 1]
      const destino =
        ultimaAccion?.trigger_escena ??
        evaluarTransicion(worldState, worldState.tiempo_escena_actual_seg)
      const navegacion = navegarConResultado(worldState, destino, accionesEjecutadas, tiempoInicioSeg)
      playNavigationAudio(destino)

      set({
        worldState: navegacion.worldState,
        feedbackToast: null,
        isLocked: false,
        resultado: navegacion.resultado ?? get().resultado,
      })
    },

    ejecutarAccion: (accion) => {
      const { worldState, accionesEjecutadas, tiempoInicioSeg } = get()
      const nuevoEstado = applyAction(worldState, accion)
      const nuevasAcciones = [...accionesEjecutadas, accion]
      const estadoFinal = registrarTiempoDeteccion(worldState, nuevoEstado, tiempoInicioSeg)

      set({
        worldState: estadoFinal,
        accionesEjecutadas: nuevasAcciones,
        ultimoFeedback: {
          texto: accion.feedback_texto,
          normativa: accion.articulo_normativo,
          tipo: accion.tipo,
          puntos: accion.puntos,
        },
        showFeedback: accion.feedback_texto !== '',
        isLocked: accion.feedback_texto !== '',
      })
    },

    tickTiempo: () => {
      const { worldState, accionesEjecutadas, tiempoInicioSeg, resultado, showFeedback, feedbackToast } = get()
      if (resultado) return
      if (showFeedback || feedbackToast?.visible) return

      const nuevoEstado = tickReloj(worldState)
      const destino = evaluarTransicion(nuevoEstado, nuevoEstado.tiempo_escena_actual_seg)

      if (destino) {
        const navegacion = navegarConResultado(nuevoEstado, destino, accionesEjecutadas, tiempoInicioSeg)
        playNavigationAudio(destino)
        set({
          worldState: navegacion.worldState,
          resultado: navegacion.resultado ?? get().resultado,
          opcionesActuales: null,
        })
      } else {
        set({ worldState: nuevoEstado })
      }
    },

    cerrarFeedback: () => {
      const { worldState, accionesEjecutadas, tiempoInicioSeg } = get()
      const ultimaAccion = accionesEjecutadas[accionesEjecutadas.length - 1]

      set({ showFeedback: false, isLocked: false })

      const destino =
        ultimaAccion?.trigger_escena ??
        evaluarTransicion(worldState, worldState.tiempo_escena_actual_seg)

      if (destino) {
        const navegacion = navegarConResultado(worldState, destino, accionesEjecutadas, tiempoInicioSeg)
        playNavigationAudio(destino)
        set({
          worldState: navegacion.worldState,
          resultado: navegacion.resultado ?? get().resultado,
          opcionesActuales: null,
        })
      }
    },

    setReporteIA: (reporte) => set({ reporteIA: reporte, isLoadingReporte: false }),
    setLoadingReporte: (loading) => set({ isLoadingReporte: loading }),
    setModeloActivo: (modelo) => set({ modeloActivo: modelo }),

    resetSimulador: () => {
      incrementarRun()
      set({
        worldState: { ...initialWorldState },
        accionesEjecutadas: [],
        tiempoInicioSeg: Math.floor(Date.now() / 1000),
        puntajeInterno: 0,
        opcionesActuales: null,
        feedbackToast: null,
        ultimoFeedback: null,
        showFeedback: false,
        isLocked: false,
        resultado: null,
        reporteIA: null,
        isLoadingReporte: false,
      })
    },
  })),
)
