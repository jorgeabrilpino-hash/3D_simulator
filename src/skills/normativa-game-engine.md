# Skill: Normativa Peruana + Game Engine
## Descripción
Implementa la lógica de decisiones del simulador ChemSim basada en el
DS 021-2008-MTC y el Libro Naranja ONU. Define cómo construir los JSON
de escenarios, el motor de evaluación, el sistema de puntaje y el
generador de feedback normativo con citas exactas de la ley peruana.

## Cuándo usar esta skill
- Al crear o modificar archivos en `src/data/scenarios/`
- Al trabajar en `src/engine/` (gameEngine, scoreCalculator, feedbackEngine)
- Al construir `src/store/simulatorStore.ts`
- Cuando el prompt mencione: "decisiones", "puntaje", "feedback", "normativa",
  "DS 021", "ONU", "árbol de decisión", "paso correcto", "penalización"

## Instrucciones para el agente

### PASO 1 — Estructura del JSON de escenario (formato canónico)

```json
// src/data/scenarios/modo1a.json
{
  "id": "modo1a",
  "titulo": "Modo 1A — Fuga en ruta",
  "descripcion": "Eres conductor de un camión cisterna con carga Clase 3 (líquido inflamable). Detectas una fuga en la válvula lateral mientras circula por la carretera.",
  "clase_onu": 3,
  "sustancia_ejemplo": "Gasolina — N° ONU 1203",
  "puntaje_aprobatorio": 70,
  "pasos": [
    {
      "id": "paso_1",
      "orden": 1,
      "pregunta": "¿Qué haces inmediatamente al detectar la fuga?",
      "opciones": [
        {
          "id": "op_a",
          "texto": "Detener el vehículo en zona segura y apagar el motor",
          "es_correcta": true,
          "puntaje": 20
        },
        {
          "id": "op_b",
          "texto": "Seguir conduciendo hasta encontrar un taller mecánico",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "accion_peligrosa"
        },
        {
          "id": "op_c",
          "texto": "Acelerar para llegar más rápido al destino",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "accion_peligrosa"
        }
      ],
      "feedback_correcto": "Correcto. El DS 021-2008-MTC, Art. 160° establece que ante cualquier emergencia el conductor debe detener el vehículo en lugar seguro, alejado de fuentes de ignición, y apagar inmediatamente el motor para evitar explosión.",
      "feedback_incorrecto": "Incorrecto. Continuar con el vehículo en movimiento aumenta el riesgo de ignición por fricción y expande el área de derrame. Artículo 160° DS 021-2008-MTC: detención inmediata es obligatoria.",
      "normativa_ref": "DS 021-2008-MTC, Artículo 160°",
      "objeto_3d_asociado": null
    },
    {
      "id": "paso_2",
      "orden": 2,
      "pregunta": "El vehículo está detenido. ¿Cuál es el siguiente paso?",
      "opciones": [
        {
          "id": "op_a",
          "texto": "Colocar triángulos de seguridad a 50m adelante y atrás",
          "es_correcta": true,
          "puntaje": 20
        },
        {
          "id": "op_b",
          "texto": "Intentar cerrar la válvula manualmente sin EPP",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "sin_proteccion"
        },
        {
          "id": "op_c",
          "texto": "Llamar al jefe de operaciones antes de hacer cualquier cosa",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "protocolo_incorrecto"
        }
      ],
      "feedback_correcto": "Correcto. La señalización vial es el primer paso de protección a terceros. DS 021-2008-MTC requiere señalización inmediata para evitar accidentes secundarios.",
      "feedback_incorrecto": "Incorrecto. Manipular la válvula sin EPP adecuado ante una fuga de líquido inflamable puede causar quemaduras graves o ignición. La señalización tiene prioridad para proteger a otros usuarios de la vía.",
      "normativa_ref": "DS 021-2008-MTC, Artículo 161°; Libro Naranja ONU Cap. 7",
      "objeto_3d_asociado": "triangulos"
    },
    {
      "id": "paso_3",
      "orden": 3,
      "pregunta": "¿Qué información debes obtener de la etiqueta del tanque antes de llamar a emergencias?",
      "opciones": [
        {
          "id": "op_a",
          "texto": "El número ONU y el número de riesgo (código Kemler)",
          "es_correcta": true,
          "puntaje": 20
        },
        {
          "id": "op_b",
          "texto": "El nombre del transportista y la placa del vehículo",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "informacion_insuficiente"
        },
        {
          "id": "op_c",
          "texto": "No es necesario, los bomberos ya saben qué hacer",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "omision_critica"
        }
      ],
      "feedback_correcto": "Correcto. El N° ONU identifica la sustancia y el código Kemler indica el tipo de riesgo. Esta información es lo primero que pedirán los bomberos. Libro Naranja ONU: identificación obligatoria antes de notificar.",
      "feedback_incorrecto": "Incorrecto. El N° ONU es la primera información que los servicios de emergencia necesitan para determinar el equipo correcto. Sin él, los bomberos pueden llegar sin el EPP adecuado.",
      "normativa_ref": "Libro Naranja ONU, Sección 5.3; DS 021-2008-MTC Art. 22°",
      "objeto_3d_asociado": "valvula"
    },
    {
      "id": "paso_4",
      "orden": 4,
      "pregunta": "¿A quién llamas primero?",
      "opciones": [
        {
          "id": "op_a",
          "texto": "Bomberos al 116 e informas N° ONU y ubicación exacta",
          "es_correcta": true,
          "puntaje": 20
        },
        {
          "id": "op_b",
          "texto": "Al jefe de operaciones de la empresa",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "protocolo_incorrecto"
        },
        {
          "id": "op_c",
          "texto": "A la Policía de Tránsito (PNP)",
          "es_correcta": false,
          "puntaje": 5,
          "error_tipo": "orden_incorrecto"
        }
      ],
      "feedback_correcto": "Correcto. El DS 021-2008-MTC establece que la primera llamada es siempre al 116 (Bomberos), indicando: N° ONU, clase de riesgo, ubicación exacta y cantidad estimada del derrame.",
      "feedback_incorrecto": "Incorrecto. El jefe de operaciones no tiene capacidad de respuesta de emergencia. La normativa es explícita: primera llamada al 116. El reporte interno a la empresa es posterior.",
      "normativa_ref": "DS 021-2008-MTC, Artículo 163°; Plan Nacional de Contingencia",
      "objeto_3d_asociado": "telefono"
    },
    {
      "id": "paso_5",
      "orden": 5,
      "pregunta": "Mientras esperas a bomberos, ¿dónde te posicionas?",
      "opciones": [
        {
          "id": "op_a",
          "texto": "A favor del viento, mínimo 50 metros del derrame",
          "es_correcta": true,
          "puntaje": 20
        },
        {
          "id": "op_b",
          "texto": "Junto al camión para vigilar que no roben la carga",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "riesgo_personal"
        },
        {
          "id": "op_c",
          "texto": "En contra del viento para ver mejor la fuga",
          "es_correcta": false,
          "puntaje": 0,
          "error_tipo": "exposicion_toxica"
        }
      ],
      "feedback_correcto": "Correcto. Posicionarse a favor del viento evita la exposición a vapores inflamables o tóxicos. La distancia mínima de 50m es estándar para Clase 3 según la Guía de Respuesta a Emergencias (GRE) ONU.",
      "feedback_incorrecto": "Incorrecto. Mantenerse cerca del derrame expone al conductor a vapores inflamables que pueden ignicionarse. A favor del viento y a distancia es la posición de seguridad estándar ONU.",
      "normativa_ref": "GRE ONU 2020, Guía 128; DS 021-2008-MTC Art. 164°",
      "objeto_3d_asociado": "indicador-viento"
    }
  ]
}
```

### PASO 2 — Interfaces TypeScript obligatorias

```typescript
// src/engine/types.ts
export interface Opcion {
  id: string
  texto: string
  es_correcta: boolean
  puntaje: number
  error_tipo?: string
}

export interface Paso {
  id: string
  orden: number
  pregunta: string
  opciones: Opcion[]
  feedback_correcto: string
  feedback_incorrecto: string
  normativa_ref: string
  objeto_3d_asociado: string | null
}

export interface Escenario {
  id: string
  titulo: string
  descripcion: string
  clase_onu: number
  sustancia_ejemplo: string
  puntaje_aprobatorio: number
  pasos: Paso[]
}

export interface RespuestaUsuario {
  paso_id: string
  opcion_id: string
  es_correcta: boolean
  puntaje_obtenido: number
  timestamp: number
}

export interface ResultadoSimulacion {
  escenario_id: string
  respuestas: RespuestaUsuario[]
  puntaje_total: number
  puntaje_maximo: number
  porcentaje: number
  aprobado: boolean
  tiempo_total_segundos: number
  fecha: string
}
```

### PASO 3 — Motor de evaluación

```typescript
// src/engine/gameEngine.ts
import type { Escenario, RespuestaUsuario, ResultadoSimulacion } from './types'

export function evaluarRespuesta(
  escenario: Escenario,
  paso_id: string,
  opcion_id: string
): { es_correcta: boolean; puntaje: number; feedback: string; normativa: string } {
  const paso = escenario.pasos.find(p => p.id === paso_id)
  if (!paso) throw new Error(`Paso ${paso_id} no encontrado`)

  const opcion = paso.opciones.find(o => o.id === opcion_id)
  if (!opcion) throw new Error(`Opción ${opcion_id} no encontrada`)

  return {
    es_correcta: opcion.es_correcta,
    puntaje: opcion.puntaje,
    feedback: opcion.es_correcta ? paso.feedback_correcto : paso.feedback_incorrecto,
    normativa: paso.normativa_ref
  }
}

export function calcularResultado(
  escenario: Escenario,
  respuestas: RespuestaUsuario[],
  tiempoSegundos: number
): ResultadoSimulacion {
  const puntaje_total = respuestas.reduce((acc, r) => acc + r.puntaje_obtenido, 0)
  const puntaje_maximo = escenario.pasos.reduce(
    (acc, p) => acc + Math.max(...p.opciones.map(o => o.puntaje)), 0
  )
  const porcentaje = Math.round((puntaje_total / puntaje_maximo) * 100)

  return {
    escenario_id: escenario.id,
    respuestas,
    puntaje_total,
    puntaje_maximo,
    porcentaje,
    aprobado: porcentaje >= escenario.puntaje_aprobatorio,
    tiempo_total_segundos: tiempoSegundos,
    fecha: new Date().toISOString()
  }
}
```

### PASO 4 — Store Zustand

```typescript
// src/store/simulatorStore.ts
import { create } from 'zustand'
import type { Escenario, RespuestaUsuario, ResultadoSimulacion } from '@/engine/types'

interface SimulatorState {
  escenario: Escenario | null
  currentStep: number
  respuestas: RespuestaUsuario[]
  resultado: ResultadoSimulacion | null
  isLocked: boolean       // bloquea clicks mientras se muestra feedback
  showFeedback: boolean
  lastFeedback: { texto: string; normativa: string; correcto: boolean } | null

  // Acciones
  loadEscenario: (escenario: Escenario) => void
  selectObject: (opcion_id: string) => void
  nextStep: () => void
  resetSimulador: () => void
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  escenario: null,
  currentStep: 0,
  respuestas: [],
  resultado: null,
  isLocked: false,
  showFeedback: false,
  lastFeedback: null,

  loadEscenario: (escenario) => set({
    escenario, currentStep: 0, respuestas: [], resultado: null,
    isLocked: false, showFeedback: false, lastFeedback: null
  }),

  selectObject: (opcion_id) => {
    const { escenario, currentStep, respuestas } = get()
    if (!escenario) return
    // La lógica de evaluación va aquí — importar evaluarRespuesta
  },

  nextStep: () => set(state => ({ currentStep: state.currentStep + 1, showFeedback: false, isLocked: false })),

  resetSimulador: () => set({ currentStep: 0, respuestas: [], resultado: null, isLocked: false, showFeedback: false })
}))
```

## Ejemplo de uso aplicado al proyecto
Al crear `modo1b.json`, seguir exactamente el mismo esquema que `modo1a.json`.
Cambiar: título, descripción, 5 pasos nuevos para terminal de carga (cerrar válvula de suministro → activar ventilación → evacuar radio SDS → llamar DGAAM → confirmar EPP).
Mantener: estructura de campos, formato de feedback con cita normativa.

## Restricciones
- NUNCA inventar artículos normativos — solo usar los del documento maestro
- NUNCA colocar lógica de evaluación dentro de componentes React
- El campo `normativa_ref` SIEMPRE debe tener la cita exacta (DS + artículo o Libro ONU + sección)
- El puntaje por paso SIEMPRE debe sumar 100 en total (5 pasos × 20 puntos)
- NUNCA modificar el JSON de escenarios desde el store — son datos inmutables
