# PROMPT V2-MEJORAS — Testing, HUD, Escenas sin v0
> Enviar a Codex como un solo prompt completo

---

Lee estos archivos antes de escribir código:
1. AGENTS.md
2. skills/worldstate-engine-v2.md
3. skills/r3f-scene-builder.md
4. components/scene/Escena1/Scene1.tsx  (referencia de estructura)
5. store/simulatorStore.ts
6. engine/worldState.ts

Hay 4 tareas. Ejecútalas en orden. Después de cada una: npx tsc --noEmit = 0 errores.

---

## TAREA 1 — Arreglar pantalla negra entre escenas

El bug ocurre porque el Canvas de R3F se desmonta y remonta bruscamente
al cambiar de escena, dejando un frame negro visible.

Solución: nunca desmontar el Canvas — mantenerlo siempre montado y
cambiar solo el contenido interno.

**1a. Actualiza `app/simulador/page.tsx`:**

El Canvas debe estar siempre presente. La lógica de qué escena mostrar
va DENTRO del Canvas, no fuera.

```tsx
// Mapa de escenas — todas cargadas, solo una visible
const ESCENAS = {
  escena_1: lazy(() => import('@/components/scene/Escena1/Scene1')),
  escena_2: lazy(() => import('@/components/scene/Escena2/Scene2')),
  escena_3: lazy(() => import('@/components/scene/Escena3/Scene3')),
}

// En el JSX — UN SOLO Canvas siempre montado
<SceneWrapper>
  <Suspense fallback={null}>
    {!worldState.escena_actual.startsWith('escena_F') &&
     worldState.escena_actual !== 'fin_exitoso' && (
      <EscenaActiva escenaId={worldState.escena_actual} />
    )}
  </Suspense>
</SceneWrapper>
```

**1b. Crea `components/scene/EscenaActiva.tsx`:**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useSimulatorStore } from '@/store/simulatorStore'
import escena1Decisions from '@/data/decisions/escena1.json'
import escena2Decisions from '@/data/decisions/escena2.json'
import escena3Decisions from '@/data/decisions/escena3.json'

// Importar los contenidos 3D de cada escena (NO el Canvas, solo el contenido)
import { Escena1Contenido } from './Escena1/Scene1'
import { Escena2Contenido } from './Escena2/Scene2'
import { Escena3Contenido } from './Escena3/Scene3'

const MAPA_CONTENIDO = {
  escena_1: Escena1Contenido,
  escena_2: Escena2Contenido,
  escena_3: Escena3Contenido,
}

export function EscenaActiva({ escenaId }: { escenaId: string }) {
  const Contenido = MAPA_CONTENIDO[escenaId as keyof typeof MAPA_CONTENIDO]
  if (!Contenido) return null
  return <Contenido />
}
```

**1c. Actualiza cada componente de escena** para exportar dos cosas:
- `export function Escena1Contenido()` — solo el JSX Three.js sin Canvas
- `export default function Scene1()` — con Canvas (para uso standalone)

Aplicar este patrón a Scene1, Scene2, Scene3.

**1d. Añadir transición suave entre escenas:**

En `SceneWrapper.tsx`, añadir un overlay negro que hace fade in/out
durante el cambio de escena usando una ref y useEffect:

```tsx
// Overlay de transición — fondo negro que aparece 200ms y desaparece
// Se activa cuando escena_actual cambia en el store
```

---

## TAREA 2 — HUD superior con métricas en tiempo real

Crea `components/ui/HudSuperior.tsx` — panel fijo en la parte superior
que muestra el estado del worldState en tiempo real.

**Diseño:** fondo oscuro semitransparente, compacto, no invasivo.
Referencia visual: barra tipo HUD de videojuego, no de app de escritorio.

**Métricas a mostrar:**

```tsx
'use client'
import { motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/simulatorStore'

export function HudSuperior() {
  const { worldState } = useSimulatorStore()
  const { fuga_pct, radio_peligro_m, errores_criticos, tiempo_escena_actual_seg } = worldState

  // Calcular litros derramados estimados
  // Tanque estándar = 10,000L. Litros = fuga_pct * 100
  const litrosDerramados = Math.round(fuga_pct * 100)

  // Color de la barra de fuga según nivel
  const colorFuga = fuga_pct > 60 ? '#ef4444'
                  : fuga_pct > 30 ? '#f97316'
                  : '#22c55e'

  // Nivel de alerta según errores críticos
  const nivelAlerta = errores_criticos >= 2 ? 'CRÍTICO'
                    : errores_criticos === 1 ? 'ALERTA'
                    : 'ESTABLE'

  const colorAlerta = errores_criticos >= 2 ? '#ef4444'
                    : errores_criticos === 1 ? '#f97316'
                    : '#22c55e'

  // Tiempo formateado
  const min = Math.floor(tiempo_escena_actual_seg / 60)
  const seg = tiempo_escena_actual_seg % 60
  const tiempoFormato = `${min}:${seg.toString().padStart(2, '0')}`

  return (
    <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-3 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/70 backdrop-blur-sm border border-white/10
                        rounded-2xl px-5 py-3 flex items-center gap-6">

          {/* Líquido derramado */}
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Derramado
            </span>
            <motion.span
              key={litrosDerramados}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-white font-mono"
            >
              {litrosDerramados.toLocaleString()}L
            </motion.span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Barra de fuga */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Nivel de fuga
              </span>
              <span className="text-[10px] font-mono" style={{ color: colorFuga }}>
                {fuga_pct}%
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: colorFuga }}
                animate={{ width: `${fuga_pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Radio de peligro */}
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Radio
            </span>
            <span className="text-lg font-bold text-orange-400 font-mono">
              {radio_peligro_m}m
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Barras de errores críticos — 3 indicadores */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
              Errores
            </span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: i < errores_criticos ? '#ef4444' : '#374151',
                    scale: i < errores_criticos ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-3 h-3 rounded-sm"
                />
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Estado de alerta */}
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Estado
            </span>
            <motion.span
              animate={{ color: colorAlerta }}
              className="text-xs font-bold uppercase tracking-wide"
            >
              {nivelAlerta}
            </motion.span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Tiempo */}
          <div className="flex flex-col items-center min-w-[50px]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Tiempo
            </span>
            <span className="text-sm font-mono text-white">
              {tiempoFormato}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
```

Añadir `<HudSuperior />` en `app/simulador/page.tsx` encima del Canvas,
con `pointer-events-none` para que no bloquee los clicks en la escena 3D.

Añadir `pt-20` al contenedor del PanelAcciones para que no quede debajo del HUD.

---

## TAREA 3 — Eliminar v0 del proyecto y el AGENTS.md

**3a. Actualiza `AGENTS.md`:**

En la sección "Rol de Codex", reemplaza cualquier mención a v0 con:

```
Codex genera TODAS las escenas 3D. No se usa v0.
Para crear una escena nueva, Codex lee los componentes existentes en
components/scene/Escena1/ como referencia y mantiene la misma estructura,
patrones de código y estilo visual, mejorando colores y detalles.
```

En la sección de Skills, eliminar referencias a v0 en:
- skills/r3f-scene-builder.md → eliminar la mención "llevar a v0"
- GUIA-V0.md → ya no se usa, añadir comentario al inicio: "DEPRECATED — no usar"

**3b. Actualiza `skills/r3f-scene-builder.md`:**

Añadir al inicio de la sección "Cuando usar esta skill":
```
- Al crear CUALQUIER escena 3D nueva — Codex las genera todas
- Siempre leer components/scene/Escena1/Scene1.tsx como referencia base
- Mantener consistencia visual: mismos patrones de iluminación, mismos
  helpers de Drei, misma conexión con worldState
```

---

## TAREA 4 — Sistema de testing automatizado

Crea `lib/simulator-test.ts` — un runner de tests que verifica el
comportamiento del simulador antes de entregarlo.

```typescript
// lib/simulator-test.ts
// Ejecutar con: npx tsx lib/simulator-test.ts

import { initialWorldState, applyAction, evaluarTransicion } from '../engine/worldState'
import { seleccionarDosOpciones } from '../engine/decisionSelector'
import escena1 from '../data/decisions/escena1.json'
import escena2 from '../data/decisions/escena2.json'
import escena3 from '../data/decisions/escena3.json'

type TestResult = { nombre: string; ok: boolean; detalle?: string }
const resultados: TestResult[] = []

function test(nombre: string, fn: () => boolean, detalle?: string) {
  try {
    const ok = fn()
    resultados.push({ nombre, ok, detalle })
  } catch (e) {
    resultados.push({ nombre, ok: false, detalle: String(e) })
  }
}

// ── TEST 1: Selección aleatoria ──────────────────────────────────
test('Siempre selecciona exactamente 2 opciones', () => {
  const [a, b] = seleccionarDosOpciones(escena1.pool_decisiones as any)
  return !!a && !!b && a.id !== b.id
})

test('Nunca selecciona 2 opciones graves juntas', () => {
  // Correr 100 veces para cubrir aleatoriedad
  for (let i = 0; i < 100; i++) {
    const [a, b] = seleccionarDosOpciones(escena1.pool_decisiones as any)
    if (a.nivel_error === 'grave' && b.nivel_error === 'grave') return false
  }
  return true
})

test('Opciones cambian entre runs (aleatoriedad real)', () => {
  const resultadosSets = new Set<string>()
  for (let i = 0; i < 20; i++) {
    const [a, b] = seleccionarDosOpciones(escena1.pool_decisiones as any)
    resultadosSets.add(`${a.id}-${b.id}`)
  }
  return resultadosSets.size > 1  // al menos 2 combinaciones diferentes
})

// ── TEST 2: WorldState ───────────────────────────────────────────
test('worldState inicial tiene fuga_pct = 5', () => {
  return initialWorldState.fuga_pct === 5
})

test('Error grave incrementa errores_criticos', () => {
  const accionGrave = escena1.pool_decisiones.find(d => d.nivel_error === 'grave')!
  const siguiente = applyAction(initialWorldState, accionGrave as any)
  return siguiente.errores_criticos > initialWorldState.errores_criticos
})

test('Error leve incrementa fuga_pct', () => {
  const accionLeve = escena1.pool_decisiones.find(d => d.nivel_error === 'leve')!
  const siguiente = applyAction(initialWorldState, accionLeve as any)
  return siguiente.fuga_pct > initialWorldState.fuga_pct
})

test('Acción correcta no penaliza worldState', () => {
  const accionOk = escena1.pool_decisiones.find(d => d.nivel === 'optima')!
  const siguiente = applyAction(initialWorldState, accionOk as any)
  return siguiente.errores_criticos === 0 && siguiente.fuga_pct <= initialWorldState.fuga_pct
})

test('3 errores críticos activa trigger_fallo', () => {
  let estado = { ...initialWorldState, errores_criticos: 2 }
  const accionGrave = escena1.pool_decisiones.find(d => d.nivel_error === 'grave')!
  estado = applyAction(estado, accionGrave as any)
  return estado.trigger_fallo !== null
})

// ── TEST 3: Transiciones ─────────────────────────────────────────
test('Timeout en escena_1 activa escena_F_A', () => {
  const estado = { ...initialWorldState, escena_actual: 'escena_1' as const }
  const destino = evaluarTransicion(estado, 301)
  return destino === 'escena_F_A'
})

test('llamo_116=true permite avanzar a escena_3', () => {
  const estado = {
    ...initialWorldState,
    escena_actual: 'escena_2' as const,
    llamo_116: true
  }
  const destino = evaluarTransicion(estado, 0)
  return destino === 'escena_3'
})

// ── TEST 4: JSON de decisiones ───────────────────────────────────
test('Cada escena tiene al menos 4 opciones en el pool', () => {
  return escena1.pool_decisiones.length >= 4 &&
         escena2.pool_decisiones.length >= 4 &&
         escena3.pool_decisiones.length >= 4
})

test('Todas las opciones tienen feedback_contextual si son error leve', () => {
  const todas = [
    ...escena1.pool_decisiones,
    ...escena2.pool_decisiones,
    ...escena3.pool_decisiones
  ]
  return todas.every(d =>
    d.nivel_error !== 'leve' || (d.nivel_error === 'leve' && !!d.feedback_contextual)
  )
})

test('Ninguna opción grave tiene feedback_contextual', () => {
  const todas = [
    ...escena1.pool_decisiones,
    ...escena2.pool_decisiones,
    ...escena3.pool_decisiones
  ]
  return todas.every(d => d.nivel_error !== 'grave' || d.feedback_contextual === null)
})

// ── REPORTE ──────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════')
console.log('  ChemSim Perú — Test Suite')
console.log('═══════════════════════════════════════\n')

let pasaron = 0
let fallaron = 0

resultados.forEach(r => {
  const icono = r.ok ? '✅' : '❌'
  console.log(`${icono}  ${r.nombre}`)
  if (!r.ok && r.detalle) console.log(`    → ${r.detalle}`)
  r.ok ? pasaron++ : fallaron++
})

console.log('\n───────────────────────────────────────')
console.log(`  ${pasaron} pasaron  |  ${fallaron} fallaron`)
console.log('═══════════════════════════════════════\n')

if (fallaron > 0) process.exit(1)
```

Añadir al `package.json` en scripts:
```json
"test": "npx tsx lib/simulator-test.ts"
```

Ejecutar `npm test` y confirmar que todos los tests pasan.
Si alguno falla, arreglarlo antes de continuar.

---

## TAREA 5 — Escenas nuevas generadas por Codex (sin v0)

Lee `components/scene/Escena1/Scene1.tsx` completo como referencia.
Crea las escenas 2 y 3 siguiendo exactamente la misma estructura.

**Escena 2 — Zona de derrame activo:**
- Misma carretera andina de Escena1
- La fuga es ahora más visible y grande (más partículas, radio mayor)
- Añadir: dos triángulos de seguridad ya colocados en la vía a 30m
- Añadir: kit de EPP abierto en el suelo cerca del camión
- Añadir: teléfono visible en el dashboard del camión (objeto clickable)
- La intensidad de GasParticles usa worldState.fuga_pct directamente
- Misma iluminación de atardecer que Escena1
- Exportar: `Escena2Contenido` y `default Scene2`

**Escena 3 — Espera y coordinación:**
- Misma carretera pero con luz más oscura (dusk — casi noche)
- Añadir: luces de sirena a lo lejos (esferas rojas/azules parpadeando)
  usando useFrame para el parpadeo alternado
- Añadir: figura simple de civil a 40m (CapsuleGeometry o cilindro + esfera)
  solo visible cuando worldState.civil_en_peligro === true
- La fuga es mínima (ya parcialmente contenida) — GasParticles intensidad baja
- Añadir: zona verde en el suelo marcando el área segura
- Exportar: `Escena3Contenido` y `default Scene3`

Para ambas escenas:
- Mismos patrones de ObjetoClickable que Escena1
- Conectar clicks con elegirDecision() del store
- Misma lógica de objetosBloqueados según worldState
- GasParticles reactivo a worldState.fuga_pct

---

## VERIFICACIÓN FINAL

Después de las 5 tareas:

1. `npm test` — todos los tests pasan
2. `npx tsc --noEmit` — 0 errores
3. `npm run dev` — verificar en browser:
   - No hay pantalla negra al cambiar de escena
   - HUD superior visible con métricas actualizándose
   - Escena 2 y 3 cargan con sus objetos propios
   - Al reiniciar pueden aparecer opciones diferentes

Lista los archivos creados o modificados con su ruta exacta.
