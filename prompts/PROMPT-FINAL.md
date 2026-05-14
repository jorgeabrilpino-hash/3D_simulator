# PROMPT V2-FINAL — Diagnóstico real del browser + lógica de alternancia
> Basado en análisis visual directo de la app en localhost:3000
> Ejecutar en orden. npx tsc --noEmit = 0 errores después de cada tarea.
> REGLA: actualiza AGENTS.md al terminar cada tarea.

---

Lee AGENTS.md completo antes de empezar.

---

## PROBLEMA 1 — CRÍTICO: Escenas completamente oscuras

Diagnóstico visual: el camión es casi negro sobre fondo marrón muy oscuro.
La fuga al 5% tiene un solo punto amarillo imperceptible.
Todo el ambiente es marrón rojizo oscuro — no se distingue nada.

La causa: la iluminación usa colores cálidos muy intensos con poca
luz ambiental, convirtiendo todo en silhouette.

Solución: cambiar TODAS las escenas a iluminación de DÍA CLARO.
No noche, no atardecer — día. La emergencia ocurre de día.

En CADA archivo de escena (Scene1, Scene2, Scene3 y las nuevas):

```tsx
{/* ILUMINACIÓN DÍA CLARO — aplicar a todas las escenas */}
<ambientLight intensity={1.2} color="#ffffff" />
<directionalLight
  position={[10, 15, 8]}
  intensity={2.0}
  color="#fff5e0"
  castShadow
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
/>
{/* Luz de relleno desde el otro lado */}
<directionalLight position={[-8, 8, -5]} intensity={0.8} color="#c8e0ff" />

{/* Sky de día */}
<Sky sunPosition={[100, 40, 10]} turbidity={2} rayleigh={0.5} />

{/* Sin fog oscuro */}
<fog attach="fog" args={['#87CEEB', 60, 200]} />
```

Materiales del camión — colores visibles de día:
```tsx
// Cabina — rojo brillante
<meshStandardMaterial color="#CC2200" metalness={0.3} roughness={0.5} />

// Tanque — plateado metálico
<meshStandardMaterial color="#D0D0D0" metalness={0.85} roughness={0.15} />

// Suelo/asfalto — gris oscuro visible
<meshStandardMaterial color="#2a2a2a" roughness={0.95} />

// Bermas — tierra/pasto visible
<meshStandardMaterial color="#6B8E3E" roughness={1.0} />
```

Fuga — hacer visible desde fuga_pct > 0:
```tsx
// GasParticles siempre activo, escala con fuga_pct
<GasParticles
  position={[-1.5, 0.8, -0.9]}
  claseONU={8}
  intensidad={worldState.fuga_pct > 40 ? 'alta' : worldState.fuga_pct > 15 ? 'media' : 'baja'}
  activo={true}  // SIEMPRE activo, nunca false
/>

// Punto de fuga en la válvula — emissive visible de día
<meshStandardMaterial
  color="#ffdd00"
  emissive="#ff6600"
  emissiveIntensity={2.0}  // más alto para verse de día
/>
```

Charco de ácido — visible desde el inicio:
```tsx
// Visible desde fuga_pct > 0 (no > 5)
{worldState.fuga_pct > 0 && (
  <mesh position={[-1.5, 0.02, -1.5]} rotation={[-Math.PI/2, 0, 0]}>
    <circleGeometry args={[Math.max(0.3, worldState.fuga_pct * 0.035), 20]} />
    <meshStandardMaterial
      color="#aadd00"
      transparent opacity={0.8}
      roughness={0.02}
      emissive="#88aa00"
      emissiveIntensity={0.3}
    />
  </mesh>
)}
```

---

## PROBLEMA 2 — CRÍTICO: Lógica de alternancia de combinaciones

Actualmente el pool es completamente random. En la sesión de prueba,
Escena 2 presentó DOS opciones graves juntas ("cerrar válvula" + "usar agua").
Esto viola la regla y además no implementa la alternancia que pediste.

La lógica que quieres es:

```
Cada escena tiene un TIPO DE RONDA predefinido que rota:
  Ronda tipo A: optima + correcta (las dos son buenas, una mejor)
  Ronda tipo B: correcta + incorrecta_leve (una buena, una leve)
  Ronda tipo C: optima + incorrecta_grave (una muy buena, una grave)
  Ronda tipo D: correcta + incorrecta_grave (una buena, una grave)
  
El tipo de ronda rota en orden A→B→C→D→A en cada reinicio.
NUNCA dos graves juntas. NUNCA dos leves juntas.
```

Actualiza `engine/decisionSelector.ts`:

```typescript
// engine/decisionSelector.ts — REEMPLAZAR COMPLETO

import type { DecisionPool, SelectedDecision } from './types'

export type TipoRonda = 'A' | 'B' | 'C' | 'D'

// Secuencia de rondas — rota con cada reinicio
const SECUENCIA_RONDAS: TipoRonda[] = ['A', 'B', 'C', 'D']
let runCount = 0

export function getTipoRondaActual(): TipoRonda {
  return SECUENCIA_RONDAS[runCount % SECUENCIA_RONDAS.length]
}

export function incrementarRun(): void {
  runCount++
}

export function resetRunCount(): void {
  runCount = 0
}

/**
 * Selecciona exactamente 2 opciones según el tipo de ronda:
 * A = optima + correcta
 * B = correcta + incorrecta_leve
 * C = optima + incorrecta_grave
 * D = correcta + incorrecta_grave
 */
export function seleccionarDosOpciones(
  pool: DecisionPool[]
): [DecisionPool, DecisionPool] {
  const tipo = getTipoRondaActual()

  const optimas = pool.filter(d => d.nivel === 'optima')
  const correctas = pool.filter(d => d.nivel === 'correcta')
  const leves = pool.filter(d => d.nivel === 'incorrecta_leve')
  const graves = pool.filter(d => d.nivel === 'incorrecta_grave')

  let opcion1: DecisionPool
  let opcion2: DecisionPool

  switch (tipo) {
    case 'A':
      // Dos buenas: optima + correcta
      opcion1 = pickRandom(optimas) ?? pickRandom(correctas)!
      opcion2 = pickRandom(correctas.filter(d => d.id !== opcion1.id))
               ?? pickRandom(optimas.filter(d => d.id !== opcion1.id))!
      break

    case 'B':
      // Una buena + una leve
      opcion1 = pickRandom([...optimas, ...correctas])!
      opcion2 = pickRandom(leves.filter(d => d.id !== opcion1.id))
               ?? pickRandom(correctas.filter(d => d.id !== opcion1.id))!
      break

    case 'C':
      // Una óptima + una grave
      opcion1 = pickRandom(optimas) ?? pickRandom(correctas)!
      opcion2 = pickRandom(graves)
               ?? pickRandom(leves.filter(d => d.id !== opcion1.id))!
      break

    case 'D':
      // Una correcta + una grave
      opcion1 = pickRandom(correctas) ?? pickRandom(optimas)!
      opcion2 = pickRandom(graves)
               ?? pickRandom(leves.filter(d => d.id !== opcion1.id))!
      break
  }

  // Siempre validar que no sean la misma
  if (!opcion1 || !opcion2 || opcion1.id === opcion2.id) {
    // Fallback: las dos primeras del pool distintas
    const [a, b] = pool
    return [a, b]
  }

  // Orden aleatorio para que A no siempre sea la "buena"
  return Math.random() > 0.5 ? [opcion1, opcion2] : [opcion2, opcion1]
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

export function debesMostrarFeedback(decision: DecisionPool): boolean {
  return decision.nivel_error === 'leve' && !!decision.feedback_contextual
}

export function formatearParaUI(decisions: [DecisionPool, DecisionPool]): SelectedDecision[] {
  return decisions.map((d, index) => ({
    id: d.id,
    texto: d.texto_opcion,
    letra: index === 0 ? 'A' : 'B' as 'A' | 'B',
    objeto_3d_id: d.objeto_3d_id
  }))
}
```

En `store/simulatorStore.ts`, en la acción `resetSimulador`:
```typescript
resetSimulador: () => {
  incrementarRun()  // avanza la secuencia de rondas
  set({ ...estadoInicial })
}
```

---

## PROBLEMA 3 — Errores leves no se marcan en el HUD

Diagnóstico: tomé decisión incorrecta leve en E1 y los 3 cuadros
de "ERRORES" del HUD permanecieron grises. No se marcó nada.

Los errores leves DEBEN marcar el HUD diferente a los errores críticos.

Actualiza `components/ui/HudSuperior.tsx`:

```tsx
// El HUD debe mostrar DOS tipos de indicadores:
// - Cuadros grises → errores leves acumulados (máx 3 antes de penalización)
// - Cuadros rojos → errores críticos (máx 3 antes de EscenaF)

// Añadir al WorldState (engine/types.ts):
// errores_leves: number  // contador separado

// En HudSuperior.tsx, reemplazar la sección de ERRORES:
<div className="flex flex-col items-center gap-1">
  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
    Errores
  </span>
  <div className="flex flex-col gap-1">
    {/* Fila de errores críticos — rojo */}
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`crit-${i}`}
          animate={{
            backgroundColor: i < worldState.errores_criticos
              ? '#ef4444'  // rojo — error crítico
              : '#1f2937', // gris oscuro — vacío
            scale: i < worldState.errores_criticos && worldState.errores_criticos > 0
              ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
          className="w-3 h-3 rounded-sm border border-white/10"
          title="Error crítico"
        />
      ))}
    </div>
    {/* Fila de errores leves — amarillo */}
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`leve-${i}`}
          animate={{
            backgroundColor: i < (worldState.errores_leves ?? 0)
              ? '#eab308'  // amarillo — error leve
              : '#1f2937',
          }}
          transition={{ duration: 0.3 }}
          className="w-3 h-2 rounded-sm border border-white/10"
          title="Error leve"
        />
      ))}
    </div>
  </div>
</div>
```

Añadir `errores_leves: number` al WorldState en `engine/types.ts`.
Inicializar en 0 en `initialWorldState` en `engine/worldState.ts`.

En `engine/worldState.ts`, en `applyAction()`:
```typescript
// Incrementar errores leves
if (action.nivel_error === 'leve') {
  next.errores_leves = (state.errores_leves ?? 0) + 1
}
```

---

## PROBLEMA 4 — Crear Escenas 4, 5 y 6 (día claro, modelo compartido)

Lee Scene1.tsx y Scene2.tsx como referencia.
Todas las escenas nuevas usan iluminación de DÍA CLARO (Problema 1).
Todas importan CamionCisterna de shared/.

### Escena 4 — Llegada de bomberos (día, 2pm)
`components/scene/Escena4/Scene4.tsx`

Elementos únicos vs anteriores:
- Camión de bomberos rojo a 25m: BoxGeometry[3,1.5,1.5] rojo brillante
  Solo visible si worldState.llamo_116 === true
  Si llamo_116 === false: solo el camión cisterna solo, sin ayuda
- Figura bombero: CylinderGeometry[0.2,0.2,1.6] amarillo con casco
- Luces de emergencia: 2 pequeños cuadros rojos/azules sobre el camión
  que alternan con useFrame (sin que sea de noche)
- Conos de seguridad: ConeGeometry naranja × 4 alrededor del área

### Escena 5 — Control activo (día, tarde)
`components/scene/Escena5/Scene5.tsx`

Elementos únicos:
- El charco de ácido es más grande (visualizar fuga acumulada)
- Cinta de peligro: líneas amarillas/negras entre postes (BoxGeometry)
- Camión de bomberos siempre presente
- Figura de inspector con portapapeles (BoxGeometry blanco)
- El camión cisterna con fuga mínima (mostrarFuga prop reducido)

### Escena 6 — Cierre y documentación (día claro)
`components/scene/Escena6/Scene6.tsx`

Elementos únicos:
- El charco ya no existe o es muy pequeño (worldState.fuga_pct * 0.1)
- Zona limpiada: círculo verde en el suelo
- Camión cisterna sin fuga (mostrarFuga={false})
- Señalización de cierre: cartel simple blanco
- trigger_escena: 'fin_exitoso' en la acción correcta

---

## PROBLEMA 5 — JSON para escenas 4, 5 y 6

Crear los 3 archivos siguiendo el schema de escena1.json.
IMPORTANTE: cada pool debe tener exactamente:
- 2 opciones nivel: 'optima'
- 3 opciones nivel: 'correcta'
- 2 opciones nivel: 'incorrecta_leve' (con feedback_contextual corto)
- 1 opción nivel: 'incorrecta_grave' (sin feedback_contextual, trigger EscenaF)

Esto asegura que el selector pueda formar cualquier tipo de ronda (A, B, C, D).

### data/decisions/escena4.json — Coordinar con bomberos
Situación: bomberos han llegado. Hay que coordinar.
Óptimas: entregar SDS + plano de planta; señalar válvula exacta al jefe
Correctas: alejarse del perímetro indicado; confirmar número de personas
Leves: "intentar explicar tú mismo cómo apagar la fuga"
  feedback: "Tu rol es informar, no intervenir. Los bomberos ya tienen el protocolo."
  "tomar fotos para redes sociales desde la zona"
  feedback: "Zona de peligro activa. Documentación personal interfiere con la operación."
Grave: tocar/manipular equipo de los bomberos → escena_F_C

### data/decisions/escena5.json — Documentar el incidente
Situación: fuga controlada, hay que documentar.
Óptimas: llenar bitácora oficial completa; notificar a DGAAM inmediatamente
Correctas: contactar empresa transportista; confirmar con supervisor
Leves: "irse a descansar y documentar después"
  feedback: "La documentación debe ser inmediata. Los detalles se pierden con el tiempo."
  "documentar solo los datos mínimos"
  feedback: "El informe incompleto puede generar sanciones. DS 021 exige registro total."
Grave: falsificar datos del incidente → escena_F_C

### data/decisions/escena6.json — Cierre oficial
Situación: inspector presente, firma requerida.
Óptimas: firmar informe tras verificar cada punto; tomar fotos del área limpia
Correctas: confirmar cadena de custodia de residuos; pedir copia del acta
Leves: "firmar sin leer el informe completo"
  feedback: "El conductor responde legalmente por lo que firma. Siempre leer antes."
  "discutir el contenido del informe con el inspector"
  feedback: "Las observaciones deben hacerse en el momento, no después de firmar."
Grave: rechazar firmar el informe oficial → escena_F_C

---

## PROBLEMA 6 — Actualizar worldState para 6 escenas

`engine/worldState.ts` — añadir a EscenaId y evaluarTransicion:

```typescript
// EscenaId — añadir:
| 'escena_4' | 'escena_5' | 'escena_6'

// evaluarTransicion — añadir casos:
if (escena === 'escena_3') {
  if (state.trigger_fallo) return 'escena_F_C'
  return null
}
if (escena === 'escena_4') {
  if (state.trigger_fallo) return 'escena_F_C'
  return null
}
if (escena === 'escena_5') {
  if (state.trigger_fallo) return 'escena_F_C'
  return null
}
// escena_6 termina cuando la acción tiene trigger_escena: 'fin_exitoso'
```

`store/simulatorStore.ts` — añadir imports de escena4, 5, 6:
```typescript
import escena4Decisions from '@/data/decisions/escena4.json'
import escena5Decisions from '@/data/decisions/escena5.json'
import escena6Decisions from '@/data/decisions/escena6.json'

const DECISIONS_MAP = {
  escena_1: escena1Decisions,
  escena_2: escena2Decisions,
  escena_3: escena3Decisions,
  escena_4: escena4Decisions,
  escena_5: escena5Decisions,
  escena_6: escena6Decisions,
}
```

`app/simulador/page.tsx` — añadir Scene4, Scene5, Scene6 al SCENE_MAP:
```typescript
const Scene4 = dynamic(() => import('@/components/scene/Escena4/Scene4'), { ssr: false })
const Scene5 = dynamic(() => import('@/components/scene/Escena5/Scene5'), { ssr: false })
const Scene6 = dynamic(() => import('@/components/scene/Escena6/Scene6'), { ssr: false })

const SCENE_MAP = {
  escena_1: Scene1,
  escena_2: Scene2,
  escena_3: Scene3,
  escena_4: Scene4,
  escena_5: Scene5,
  escena_6: Scene6,
}
```

---

## PROBLEMA 7 — Pantalla de resumen final mejorada

La pantalla final debe mostrar claramente:
- Errores leves cometidos (amarillo) vs errores críticos (rojo)
- Las decisiones exactas tomadas en cada escena
- Si completó las 6 escenas o se fue a EscenaF

En el componente de pantalla final, añadir sección:

```tsx
{/* Resumen de errores */}
<div className="w-full max-w-2xl mb-8">
  <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 text-center">
    Registro de decisiones
  </p>
  <div className="flex gap-6 justify-center mb-4">
    <div className="text-center">
      <p className="text-yellow-400 text-2xl font-bold font-mono">
        {worldState.errores_leves ?? 0}
      </p>
      <p className="text-gray-500 text-xs mt-1">Errores leves</p>
    </div>
    <div className="w-px bg-white/10" />
    <div className="text-center">
      <p className="text-red-400 text-2xl font-bold font-mono">
        {worldState.errores_criticos}
      </p>
      <p className="text-gray-500 text-xs mt-1">Errores críticos</p>
    </div>
    <div className="w-px bg-white/10" />
    <div className="text-center">
      <p className="text-green-400 text-2xl font-bold font-mono">
        {worldState.historial_escenas.filter(e => !e.startsWith('escena_F')).length}
      </p>
      <p className="text-gray-500 text-xs mt-1">Escenas completadas</p>
    </div>
  </div>
</div>
```

---

## VERIFICACIÓN FINAL — navegar tú mismo

Después de implementar todo:

1. `npm test` → todos los tests pasan
2. `npx tsc --noEmit` → 0 errores
3. Abre localhost:3000 → iniciar simulación
4. Verifica que la escena es visiblemente de día — camión rojo sobre asfalto gris
5. Verifica que la fuga tiene partículas visibles desde el inicio
6. Toma una decisión leve → verifica que el HUD marca un cuadro AMARILLO
7. Completa 6 escenas → verifica que la pantalla final muestra errores leves y críticos separados
8. Reinicia → verifica que el tipo de ronda cambia (de A a B)
9. Reinicia otra vez → tipo C (una óptima + una grave)
10. Verifica en consola que no hay errores de JavaScript

Documenta qué encontraste y qué corregiste.

## TAREA FINAL — Actualizar AGENTS.md

Reflejar:
- Iluminación de día en todas las escenas (regla permanente)
- Sistema de alternancia de rondas A/B/C/D
- errores_leves en WorldState
- HUD con dos filas de indicadores
- 6 escenas documentadas
- Pantalla final con desglose de errores
