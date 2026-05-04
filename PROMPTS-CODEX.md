# BATERÍA DE PROMPTS — ChemSim Perú
> Enviar a Codex desktop (modelo o3/o4) EN ESTE ORDEN
> No enviar el siguiente prompt hasta que Codex confirme que terminó el anterior
>
> FLUJO DE HERRAMIENTAS:
>   Codex → escribe TODO el código del proyecto
>   v0.dev → solo para las 4 escenas 3D (llevar el prompt manualmente, copiar el resultado)
>   Codex → integra lo que v0 generó al proyecto

---

## 🚀 PROMPT 1 — Inicialización y configuración
**Cuándo enviarlo:** Primero de todos, con el proyecto y estructura src/ ya creados
**Tiempo estimado:** 10-15 minutos

---
Lee el archivo AGENTS.md en la raíz del proyecto y los 4 archivos dentro de la carpeta skills/ antes de hacer cualquier cosa.

Luego ejecuta estas tareas en orden:

1. Crea `next.config.js` en la raíz siguiendo exactamente el PASO 1 de la skill `nextjs-project-manager.md`

2. Reemplaza el contenido de `tsconfig.json` con la configuración del PASO 3 de esa misma skill (incluye los paths alias @/)

3. Crea `tailwind.config.ts` con esta paleta de colores:
   - background: '#0a0a0a'
   - foreground: '#ffffff'
   - accent: '#f97316'
   - success: '#22c55e'
   - error: '#ef4444'
   - warning: '#eab308'
   - muted: '#374151'

4. Instala todas las dependencias del PASO 2 de la skill ejecutando:
   npm install three@0.167.0 @react-three/fiber@8.17.5 @react-three/drei@9.108.3 @react-three/postprocessing@2.16.2 zustand@4.5.4 framer-motion@11.3.17
   npm install -D @types/three@0.167.0 file-loader@6.2.0

5. Crea `vercel.json` en la raíz:
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
           { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
         ]
       }
     ]
   }

6. Crea `.gitignore` si no existe, asegurándote de que incluye: node_modules/, .next/, .env.local

7. Ejecuta `npm run dev` y confirma que arranca en localhost:3000 sin errores.

---
**Verificar:** `npm run dev` corre sin errores en localhost:3000

---

## 🚀 PROMPT 2 — Data Layer y tipos TypeScript
**Cuándo enviarlo:** Después de que PROMPT 1 termine exitosamente

---
Lee la skill `skills/normativa-game-engine.md` completa antes de empezar.

Crea estos 4 archivos en orden:

**1. src/engine/types.ts**
Implementa todas las interfaces del PASO 2 de la skill: Opcion, Paso, Escenario, RespuestaUsuario, ResultadoSimulacion. Sin agregar interfaces adicionales todavía.

**2. src/data/scenarios/modo1a.json**
Crea el JSON completo siguiendo el schema exacto del PASO 1 de la skill.
Los 5 pasos del Modo 1A son:
- Paso 1: Detener vehículo y apagar motor | objeto_3d_asociado: null
- Paso 2: Colocar triángulos de seguridad | objeto_3d_asociado: "triangulos"
- Paso 3: Identificar N° ONU en la etiqueta | objeto_3d_asociado: "valvula"
- Paso 4: Llamar al 116 bomberos | objeto_3d_asociado: "telefono"
- Paso 5: Posicionarse a favor del viento a 50m | objeto_3d_asociado: "indicador-viento"

Cada paso: 3 opciones (1 correcta + 2 incorrectas), feedback con cita exacta DS 021-2008-MTC, puntaje 20 por paso correcto (total 100).

**3. src/lib/constants.ts**
```typescript
export const PUNTAJE_APROBATORIO = 70

export const DISTANCIAS_SEGURIDAD_METROS: Record<number, number> = {
  2: 100,  // Gases
  3: 50,   // Líquidos inflamables
  6: 75,   // Tóxicos
  8: 50    // Corrosivos
}

export const CONTACTOS_EMERGENCIA = {
  bomberos: '116',
  policia: '105',
  dgaam: '(01) 411-1000',
  indeci: '(01) 225-9898'
} as const

export const CLASES_ONU_NOMBRES: Record<number, string> = {
  2: 'Gases',
  3: 'Líquidos inflamables',
  6: 'Sustancias tóxicas',
  8: 'Sustancias corrosivas',
  9: 'Materiales peligrosos varios'
}
```

**4. src/lib/normativa.ts**
```typescript
export const NORMATIVA = {
  DS021: 'DS 021-2008-MTC — Reglamento Nacional de Transporte Terrestre de Materiales y Residuos Peligrosos',
  LIBRO_NARANJA: 'Recomendaciones de las Naciones Unidas relativas al Transporte de Mercancías Peligrosas',
  GRE: 'Guía de Respuesta a Emergencias 2020 (ONU)',
  INDECI: 'Plan Nacional de Contingencia — INDECI Perú'
} as const
```

Al terminar ejecuta `npx tsc --noEmit`. Debe mostrar 0 errores.

---
**Verificar:** `npx tsc --noEmit` = 0 errores

---

## 🚀 PROMPT 3 — Game Engine y Store Zustand
**Cuándo enviarlo:** Después de que PROMPT 2 termine con 0 errores TypeScript

---
Lee la skill `skills/normativa-game-engine.md`, secciones PASO 3 y PASO 4.

Crea estos 3 archivos:

**1. src/engine/gameEngine.ts**
Implementa las funciones del PASO 3 de la skill. Agrega también:
- `obtenerPasoPorOrden(escenario: Escenario, orden: number): Paso | undefined`
- `obtenerObjetoActivo(escenario: Escenario, pasoIndex: number): string | null`
  que devuelve el objeto_3d_asociado del paso actual (o null si no tiene)

**2. src/engine/feedbackEngine.ts**
```typescript
import type { Paso, Opcion } from './types'

export interface FeedbackResult {
  texto: string
  normativa: string
  esCorrecta: boolean
  puntosPerdidos: number
}

export function generarFeedback(paso: Paso, opcionElegida: Opcion): FeedbackResult {
  return {
    texto: opcionElegida.es_correcta ? paso.feedback_correcto : paso.feedback_incorrecto,
    normativa: paso.normativa_ref,
    esCorrecta: opcionElegida.es_correcta,
    puntosPerdidos: opcionElegida.es_correcta ? 0 : (20 - opcionElegida.puntaje)
  }
}
```

**3. src/store/simulatorStore.ts**
Implementa el store completo del PASO 4 de la skill.
La función `selectObject(opcion_id: string)` debe:
1. Obtener el paso actual con `escenario.pasos[currentStep]`
2. Buscar la opción elegida por opcion_id
3. Llamar a `evaluarRespuesta()` del gameEngine
4. Llamar a `generarFeedback()` del feedbackEngine
5. Guardar la respuesta en el array `respuestas`
6. Poner `showFeedback: true` e `isLocked: true`
7. Si `currentStep === escenario.pasos.length - 1` (último paso): calcular resultado con `calcularResultado()` y guardarlo en `resultado`

Ejecuta `npx tsc --noEmit`. Debe ser 0 errores.

---
**Verificar:** `npx tsc --noEmit` = 0 errores

---

## 🚀 PROMPT 4 — UI Shell (simulador 2D funcional)
**Cuándo enviarlo:** Después de que PROMPT 3 termine con 0 errores
**OBJETIVO:** El juego debe funcionar completamente en 2D antes de tocar 3D

---
Construye la interfaz 2D completa. Usa exclusivamente Tailwind CSS con la paleta del proyecto: fondo #0a0a0a, acento #f97316, texto #ffffff, verde #22c55e para correcto, rojo #ef4444 para incorrecto.

**1. src/app/globals.css**
Asegúrate de que incluye las directivas de Tailwind y establece body { background: #0a0a0a; color: #ffffff; }

**2. src/app/layout.tsx**
Layout base con fuente Inter (Google Fonts), metadatos en español, fondo negro.
Título: "ChemSim Perú — Simulador de Capacitación DS 021-2008-MTC"

**3. src/app/page.tsx** — Pantalla de inicio
- Header con logo ⚠️ y título "ChemSim Perú"
- Subtítulo: "Simulador oficial de capacitación en materiales peligrosos"
- 4 tarjetas de modo en grid 2x2:
  - Modo 1A: "Fuga en ruta" — Clase 3 — botón "Iniciar" activo
  - Modo 1B: "Terminal de carga" — Clase 2 — badge "Próximamente" gris
  - Modo 2A: "Tanque estático" — Clase 8 — badge "Próximamente" gris
  - Modo 2B: "Emergencia mayor" — multi-clase — badge "Próximamente" gris
- Footer: "Normativa: DS 021-2008-MTC + Libro Naranja ONU"
- El botón "Iniciar" del Modo 1A enlaza a /simulador/modo1a

**4. src/components/ui/BarraProgreso.tsx**
Recibe `pasoActual: number` (0-4) y `totalPasos: number` (5).
Muestra 5 círculos numerados conectados por línea:
- Completado (índice < pasoActual): verde #22c55e con checkmark
- Actual (índice === pasoActual): naranja #f97316 pulsante
- Pendiente (índice > pasoActual): gris #374151

**5. src/components/ui/PanelDecision.tsx**
Recibe el `Paso` actual como prop. Muestra:
- Número del paso (ej: "Paso 2 de 5")
- Texto de la pregunta en grande
- 3 botones (A, B, C) con el texto de cada opción
- Al hacer clic en una opción: llama a `selectObject(opcion.id)` del store
- Deshabilita todos los botones cuando `isLocked` es true en el store

**6. src/components/ui/FeedbackNormativo.tsx**
Se muestra condicionalmente cuando `showFeedback` es true en el store. Muestra:
- ✅ "¡Correcto!" (fondo verde oscuro) o ❌ "Incorrecto" (fondo rojo oscuro)
- Texto del feedback
- Cita normativa en cursiva y color gris claro
- Si incorrecto: mostrar cuántos puntos se perdieron
- Botón "Continuar →" que llama a `nextStep()` del store

**7. src/components/ui/PantallaPuntaje.tsx**
Se muestra cuando `resultado` no es null en el store. Muestra:
- Puntaje grande centrado: "85 / 100"
- Badge de estado: "APROBADO ✅" verde (≥70) o "REPROBADO ❌" rojo (<70)
- Lista de los 5 pasos con ✅ o ❌ y la normativa citada
- Tiempo de la simulación formateado: "2m 34s"
- Dos botones: "Intentar de nuevo" (resetSimulador) y "Volver al inicio" (link a /)

**8. src/app/simulador/[modo]/page.tsx**
Ruta dinámica que:
1. Lee el parámetro `modo` de la URL
2. Importa el JSON del escenario correspondiente de `src/data/scenarios/[modo].json`
3. Llama a `loadEscenario(escenarioData)` en `useEffect` al montar
4. Muestra en pantalla: `BarraProgreso` arriba + `PanelDecision` en centro + `FeedbackNormativo` superpuesto
5. Cuando `resultado !== null`: reemplazar todo con `PantallaPuntaje`
6. Si el modo no existe o el JSON no carga: mostrar "Modo no disponible" con link al inicio

Al terminar: abre localhost:3000 y completa una simulación del Modo 1A de principio a fin. Confirma que el puntaje y el feedback normativo funcionan correctamente.

---
**Verificar:** completar el flujo completo de Modo 1A en localhost:3000/simulador/modo1a

---

## 🚀 PROMPT 5 — Componentes 3D compartidos
**Cuándo enviarlo:** Después de verificar que el simulador 2D funciona completo

---
Lee las skills `r3f-scene-builder.md` y `particle-system-gas.md` completas.

Crea los 4 componentes 3D base reutilizables:

**1. src/components/scene/SceneWrapper.tsx**
Canvas base reutilizable que recibe `children`. Configura:
- Canvas con camera={{ position: [0, 3, 8], fov: 60 }}, shadows, antialias
- Suspense con fallback: div centrado con texto "Cargando escena..." en blanco
- OrbitControls: enablePan={false}, minDistance={3}, maxDistance={15}, maxPolarAngle={Math.PI / 2}
- Luz ambiental: intensity={0.4}
- Luz direccional: position={[10, 10, 5]}, intensity={1.2}, castShadow

**2. src/components/scene/shared/ObjetoClickable.tsx**
Implementar exactamente el patrón del PASO 2 de la skill r3f-scene-builder.md.
Cursor pointer en hover, tooltip con label, esfera indicadora naranja cuando isActive.

**3. src/components/scene/shared/GasParticles.tsx**
Implementar el PASO 1 completo de particle-system-gas.md.
Incluir las 4 configuraciones de clase ONU (2, 3, 6, 8).
Optimización mobile: si window.innerWidth < 768 entonces count * 0.4.

**4. src/components/scene/shared/IndicadorViento.tsx**
Implementar el PASO 2 de particle-system-gas.md.
Bandera oscila con useFrame, botón de interacción cuando isInteractable.

Ejecuta `npx tsc --noEmit`. Cero errores.

---
**Verificar:** `npx tsc --noEmit` = 0 errores

---

## 🚀 PROMPT 6A — PAUSA: ir a v0.dev para la escena 3D
**Cuándo enviarlo:** Este NO es un prompt para Codex. Es una instrucción para ti.

---
⚠️ ANTES DE CONTINUAR CON CODEX:

Ve manualmente a https://v0.dev y pega este prompt exacto:

"""
Create a React Three Fiber scene component for a chemical emergency simulator.
Scene: a Peruvian mountain road at sunset, a chemical tanker truck stopped on the side.
There is a visible orange gas leak from a side valve with a particle system using THREE.Points.

The scene must include 5 clickable 3D objects:
1. Two red safety triangles on the road (id: "triangulos")
2. A phone showing "116" (id: "telefono")
3. A wind direction flag/indicator (id: "indicador-viento")
4. The leaking valve on the tank side with warning glow (id: "valvula")
5. A red fire extinguisher (id: "extintor")

Technical requirements:
- Use @react-three/fiber and @react-three/drei
- Include OrbitControls, Sky component for sunset atmosphere
- Each clickable object must call an onObjectClick(id: string) prop
- Highlight objects on hover with orange emissive
- Include mountain geometry in the background
- TypeScript with proper types
- Export as default function Scene1A
"""

Cuando v0 genere el componente:
1. Copia TODO el código generado
2. Guárdalo en un archivo temporal
3. Vuelve a Codex y envía el PROMPT 6B

---

## 🚀 PROMPT 6B — Integrar escena de v0 al proyecto
**Cuándo enviarlo:** Inmediatamente después de copiar el código de v0

---
Tengo el componente de escena 3D generado por v0. Voy a pegarlo a continuación.
Intégralo al proyecto siguiendo estas instrucciones:

[PEGA AQUÍ EL CÓDIGO GENERADO POR v0]

Pasos de integración:
1. Guarda el componente en `src/components/scene/Modo1A/Scene1ABase.tsx`
2. Instala cualquier dependencia nueva que el componente requiera
3. Crea `src/components/scene/Modo1A/Scene1A.tsx` que:
   - Importa Scene1ABase
   - Reemplaza cualquier estado local `useState` por el store de Zustand
   - El prop `onObjectClick(id)` debe llamar a `selectObject(id)` del store
   - Los objetos solo deben ser interactivos cuando `currentStep` del store
     coincide con el paso que tiene ese objeto en modo1a.json
     (usar la función `obtenerObjetoActivo()` del gameEngine)
   - Añade `'use client'` al inicio si no está
4. Modifica `src/app/simulador/[modo]/page.tsx`:
   - Para modo1a: cargar Scene1A con dynamic import (ssr: false)
   - Mostrar la escena 3D como fondo full-screen (position: fixed, z-index: 0)
   - El PanelDecision como overlay en la parte inferior (position: fixed, bottom: 0, z-index: 10)
   - El FeedbackNormativo como overlay centrado (z-index: 20)
5. Ejecuta `npx tsc --noEmit` y resuelve cualquier error de tipos

Al terminar: abre localhost:3000/simulador/modo1a. La escena 3D debe cargar,
el gas naranja debe ser visible, y hacer clic en cada objeto debe registrar
la decisión y mostrar el feedback normativo correspondiente.

---
**Verificar:** completar el flujo 3D completo del Modo 1A con la escena integrada

---

## 🚀 PROMPT 7 — JSON de escenarios 1B, 2A y 2B
**Cuándo enviarlo:** Después de que el Modo 1A funcione completo

---
Lee la skill `normativa-game-engine.md` PASO 1 para el schema exacto del JSON.

Crea los 3 JSON de escenarios restantes. Misma estructura que modo1a.json.

**src/data/scenarios/modo1b.json** — Fuga en terminal de carga (GLP, Clase 2)
Sustancia: GLP (Gas Licuado de Petróleo) — N° ONU 1075
5 pasos:
- Paso 1: Cerrar válvula de suministro principal | objeto: "valvula-principal"
- Paso 2: Activar ventilación de emergencia del recinto | objeto: "ventilacion"
- Paso 3: Determinar radio de evacuación según Hoja SDS | objeto: "hoja-sds"
- Paso 4: Llamar al 116 e informar N° ONU 1075 y cantidad estimada | objeto: "telefono"
- Paso 5: Establecer perímetro y no reentrar sin autorización | objeto: "zona-segura"
Normativa: DS 021-2008-MTC Art. 170°, Libro Naranja ONU Clase 2, GRE Guía 115

**src/data/scenarios/modo2a.json** — Tanque estático, fuga lenta controlable (Clase 8)
Sustancia: Ácido Sulfúrico — N° ONU 1830
5 pasos:
- Paso 1: Clasificar nivel: fuga lenta (<5L/min), contenible | objeto: "indicador-nivel"
- Paso 2: Equiparse con EPP Nivel B: traje Tyvek, guantes neopreno, máscara facial completa | objeto: "epp-kit"
- Paso 3: Contener con kit de derrames: absorbente neutralizador, dique de arena | objeto: "kit-derrame"
- Paso 4: Si supera 200L: notificar a DGAAM al (01) 411-1000 | objeto: "telefono"
- Paso 5: Registrar en bitácora de incidentes de la planta | objeto: "bitacora"
Normativa: DS 021-2008-MTC Art. 180°, Libro Naranja ONU Clase 8, GRE Guía 137

**src/data/scenarios/modo2b.json** — Emergencia mayor multi-rol (Clase 2.3)
Sustancia: Amoniaco anhidro — N° ONU 1005
5 pasos:
- Paso 1: Activar alarma general y ordenar evacuación total de planta | objeto: "alarma"
- Paso 2: Activar Plan de Contingencia y notificar a Brigada de Emergencia | objeto: "plan-contingencia"
- Paso 3: Coordinar con PNP e INDECI para establecer perímetro de 300m | objeto: "radio-comunicacion"
- Paso 4: Entregar a bomberos la Hoja SDS y plano de planta con ubicación de válvulas | objeto: "documentos"
- Paso 5: Enviar informe formal a DGAAM en máximo 2 días hábiles | objeto: "informe"
Normativa: DS 021-2008-MTC Art. 185°-192°, Plan Nacional Contingencia INDECI, GRE Guía 125

Cada paso: 3 opciones, feedback con cita normativa exacta, puntaje 20 por paso correcto.
Ejecuta `npx tsc --noEmit` al terminar.

---
**Verificar:** 3 archivos JSON creados, `npx tsc --noEmit` = 0 errores

---

## 🚀 PROMPT 8 — Pantalla de resultados y reportes
**Cuándo enviarlo:** Después de que los 4 JSON de escenarios estén listos

---
Mejora el sistema de resultados con animaciones y exportación.

**1. src/lib/reportUtils.ts**
```typescript
import type { ResultadoSimulacion } from '@/engine/types'

export function exportarResultadoJSON(resultado: ResultadoSimulacion): void {
  const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chemsim-${resultado.escenario_id}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function generarTextoCompartir(resultado: ResultadoSimulacion): string {
  const estado = resultado.aprobado ? '✅ Aprobado' : '❌ Reprobado'
  const modo = resultado.escenario_id.toUpperCase().replace('MODO', 'Modo ')
  return `ChemSim Perú — ${modo} — ${resultado.porcentaje}/100 ${estado} | Capacitación DS 021-2008-MTC`
}

export function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}
```

**2. Reemplazar src/components/ui/PantallaPuntaje.tsx**
Versión mejorada con Framer Motion:
- El número del puntaje hace count-up animado de 0 al valor real (duración 1.5s)
- Las filas de los 5 pasos aparecen en secuencia con stagger de 0.1s
- Si aprobado: mostrar confetti en CSS puro (keyframe animation con spans de colores)
- Mostrar tiempo con `formatearTiempo()` de reportUtils
- Botón "Descargar reporte" llama a `exportarResultadoJSON(resultado)`
- Botón "Compartir" copia `generarTextoCompartir(resultado)` al clipboard con navigator.clipboard.writeText()
- Mostrar mensaje "¡Copiado!" por 2 segundos después de compartir

**3. Actualizar src/app/simulador/[modo]/page.tsx**
Añadir un timer que incremente un contador en segundos (useRef + setInterval) desde que carga el escenario hasta que se genera el resultado. Pasar el tiempo al store cuando se llama `calcularResultado()`.

Al terminar: completar una simulación y verificar que el JSON se descarga correctamente con todos los datos.

---
**Verificar:** descargar el JSON de resultado y verificar que contiene escenario_id, respuestas, puntaje, tiempo y fecha

---

## 🚀 PROMPT 9 — Build de producción y preparación para Vercel
**Cuándo enviarlo:** Cuando todos los módulos anteriores funcionen correctamente

---
Prepara el proyecto para producción.

1. Ejecuta `npm run build`

2. Si hay errores de build, resuélvelos en este orden de prioridad:
   - Errores de TypeScript: corregir tipos
   - Componentes sin 'use client' que usan hooks: añadir la directiva
   - Imports de Three.js en Server Components: convertir a dynamic con ssr:false
   - Imágenes o assets no encontrados: verificar rutas en /public/

3. Cuando el build pase sin errores, ejecuta `npm run start` y verifica que funciona en localhost:3000

4. Lista todos los archivos del proyecto con su ruta relativa y una línea de descripción. Formato:
   src/engine/types.ts — Interfaces TypeScript del sistema (Escenario, Paso, Opcion, etc.)

No hagas commit ni push — eso lo hago yo manualmente.

---
**Verificar:** `npm run build` termina sin errores, `npm run start` funciona

---

## 📋 DESPUÉS DEL PROMPT 9 — Deploy manual en Vercel

Estos pasos los haces tú (no Codex):

1. `git add .`
2. `git commit -m "feat: ChemSim Perú MVP completo"`
3. `git push origin main`
4. Ve a https://vercel.com → New Project → importa tu repo
5. En "Environment Variables" añade las de tu `.env.local` que sean necesarias
6. Click "Deploy"
7. URL pública: `chemsim-peru.vercel.app` (o similar)
