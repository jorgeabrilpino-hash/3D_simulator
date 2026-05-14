# PROMPT V2-DECISIONES — Sistema de 2 opciones aleatorias con feedback contextual
> Enviar a Codex después de tener el proyecto ejecutándose
> Este prompt reemplaza/actualiza la lógica de decisiones del simulador

---

Lee AGENTS.md, la skill `skills/worldstate-engine-v2.md` y el archivo
`engine/types-additions.ts` antes de empezar.

## Contexto del cambio

El simulador actualmente muestra todas las decisiones de la escena al mismo tiempo
con indicadores visuales. Hay que cambiarlo a:
- Exactamente 2 opciones por escena, seleccionadas aleatoriamente del pool
- Sin ningún indicador visual de buena/mala (botones completamente neutros)
- Error leve → toast de feedback contextual arriba → sigue a siguiente escena
- Error grave → va directo a EscenaF
- Al reiniciar → nuevas 2 opciones del pool (puede cambiar completamente)

## TAREA 1 — Actualizar engine/types.ts

Añadir al archivo types.ts existente (sin borrar lo que hay):

```typescript
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

export interface EscenaDecisionsData {
  escena_id: EscenaId
  titulo: string
  descripcion_inicial: string
  tiempo_limite_seg: number | null
  timeout_trigger: EscenaId | null
  pool_decisiones: DecisionPool[]
  reglas_seleccion: {
    opciones_por_ronda: number
    garantizar_una_no_grave: boolean
  }
}
```

## TAREA 2 — Crear engine/decisionSelector.ts

Crear este archivo con la lógica de selección aleatoria.
Copiar el contenido completo del archivo `engine/decisionSelector.ts`
que ya existe en el proyecto.

## TAREA 3 — Reemplazar los JSON de decisions

Reemplazar el contenido de los 3 archivos:
- `data/decisions/escena1.json` → con el archivo actualizado que ya existe
- `data/decisions/escena2.json` → con el archivo que ya existe  
- `data/decisions/escena3.json` → con el archivo que ya existe

El nuevo formato usa `pool_decisiones[]` en lugar de `acciones[]`.

## TAREA 4 — Actualizar store/simulatorStore.ts

Añadir al estado del store:
```typescript
opcionesActuales: [SelectedDecision, SelectedDecision] | null
feedbackToast: { visible: boolean; texto: string } | null
```

Añadir estas acciones:

```typescript
cargarOpcionesEscena: (escenaId: EscenaId) => void
// Lee el JSON de decisions de la escena
// Llama a seleccionarDosOpciones() del decisionSelector
// Guarda el resultado en opcionesActuales
// Siempre produce un par diferente (aleatorio)

elegirDecision: (decisionId: string) => void
// Busca la decisión en el pool del escenario actual
// Aplica efecto_worldstate con applyAction()
// Si nivel_error === 'leve':
//   - mostrar feedbackToast con feedback_contextual
//   - navegar a trigger_escena después de 4 segundos
// Si nivel_error === 'grave':
//   - navegar a EscenaF inmediatamente
//   - NO mostrar toast
// Si nivel_error === null (correcta):
//   - navegar directamente, sin toast
// Acumular puntos internamente (nunca mostrar al usuario)

cerrarFeedbackToast: () => void
// Oculta el toast y navega a la siguiente escena
```

## TAREA 5 — Crear components/ui/FeedbackToast.tsx

Componente que aparece en la parte superior de la pantalla.
Solo visible cuando `feedbackToast.visible === true`.

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulatorStore } from '@/store/simulatorStore'

export function FeedbackToast() {
  const { feedbackToast, cerrarFeedbackToast } = useSimulatorStore()

  return (
    <AnimatePresence>
      {feedbackToast?.visible && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-2xl p-4"
        >
          <div className="bg-[#1a1a1a] border border-orange-500/40 rounded-xl
                          p-5 shadow-2xl shadow-black/60">
            <div className="flex items-start gap-3">
              {/* Icono */}
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center
                              justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-sm">⚠</span>
              </div>
              {/* Texto */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-orange-400 mb-1 uppercase tracking-wider">
                  Consecuencia de tu decisión
                </p>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {feedbackToast.texto}
                </p>
              </div>
            </div>
            {/* Barra de progreso automática */}
            <motion.div
              className="mt-4 h-0.5 bg-orange-500 rounded-full origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
              onAnimationComplete={cerrarFeedbackToast}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              Continúa automáticamente...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## TAREA 6 — Actualizar components/ui/PanelAcciones.tsx

El panel ya no muestra una lista de opciones — muestra exactamente 2 botones
completamente neutros, sin colores de correcto/incorrecto.

```tsx
'use client'
import { useSimulatorStore } from '@/store/simulatorStore'

export function PanelAcciones() {
  const { opcionesActuales, elegirDecision, isLocked } = useSimulatorStore()

  if (!opcionesActuales) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-6
                    bg-gradient-to-t from-black via-black/90 to-transparent">
      <div className="max-w-2xl mx-auto space-y-3">
        {opcionesActuales.map((opcion) => (
          <button
            key={opcion.id}
            disabled={isLocked}
            onClick={() => elegirDecision(opcion.id)}
            className="w-full text-left px-5 py-4 rounded-xl
                       bg-[#111111] border border-white/10
                       hover:border-orange-500/50 hover:bg-[#1a1a1a]
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200
                       text-white text-sm leading-relaxed
                       group"
          >
            <span className="font-bold text-orange-400 mr-3 
                             group-hover:text-orange-300">
              {opcion.letra}
            </span>
            {opcion.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
```

## TAREA 7 — Actualizar app/simulador/page.tsx

Añadir el componente FeedbackToast al layout de la página.
Llamar a `cargarOpcionesEscena(worldState.escena_actual)` cada vez
que cambie `worldState.escena_actual` usando useEffect.

```tsx
useEffect(() => {
  if (!worldState.escena_actual.startsWith('escena_F') &&
      worldState.escena_actual !== 'fin_exitoso') {
    cargarOpcionesEscena(worldState.escena_actual)
  }
}, [worldState.escena_actual])
```

Añadir `<FeedbackToast />` fuera del Canvas 3D, al nivel más alto del JSX.

## TAREA 8 — Verificación final

1. Ejecuta `npx tsc --noEmit`. Cero errores.
2. Inicia `npm run dev`.
3. Verifica:
   - Solo aparecen 2 botones neutros por escena
   - Los botones no tienen colores ni indicadores de correcto/incorrecto
   - Al elegir una opción incorrecta leve aparece el toast arriba con countdown
   - El toast desaparece solo y avanza la escena
   - Al reiniciar, las 2 opciones pueden ser diferentes
   - Una opción grave va directo a EscenaF sin toast

## LO QUE CODEX NO DEBE HACER

- ❌ No mostrar puntos en ningún momento al usuario
- ❌ No cambiar el color de los botones después de elegir
- ❌ No marcar cuál fue la opción "correcta" en el toast
- ❌ No mostrar el nivel (optima/correcta/incorrecta) en ningún lugar de la UI
- ❌ No mostrar más de 2 opciones nunca
