# AGENTS.md — ChemSim Perú
> Simulador web 3D de capacitación para emergencias con materiales peligrosos
> Marco normativo: DS 021-2008-MTC (Perú) + Libro Naranja ONU

---

## 🎯 Objetivo del Proyecto

Construir un simulador web 3D interactivo que permita a conductores, acompañantes
y supervisores de planta certificarse en respuesta a emergencias con materiales
peligrosos, según exige el DS 021-2008-MTC peruano.

El simulador presenta escenas 3D de situaciones reales donde el usuario toma
5 decisiones secuenciales evaluadas con el estándar normativo peruano.
Puntaje mínimo aprobatorio: 70% (igual que el examen teórico-práctico oficial).

**Usuarios objetivo:** conductores de camiones cisterna, supervisores de planta
de empresas como Repsol, Petroperú y transportistas independientes de la
franja minera sur de Perú (Arequipa, Moquegua, Puno).

---

## 🏗️ Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 14.2.5 (App Router) | Framework web + deploy |
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.3 | Tipado estricto |
| @react-three/fiber | 8.17.5 | Motor 3D |
| @react-three/drei | 9.108.3 | Helpers 3D |
| @react-three/postprocessing | 2.16.2 | Efectos visuales |
| Three.js | 0.167.0 | Motor 3D base |
| Zustand | 4.5.4 | Estado global del simulador |
| Framer Motion | 11.3.17 | Animaciones de UI 2D |
| Tailwind CSS | 3.4.7 | Estilos de UI |
| Supabase | Free Tier | Base de datos (fase admin panel) |
| Vercel | Free | Deploy |

**Herramientas de desarrollo (externas al código):**
- **Codex desktop (o3/o4):** el agente que escribe TODO el código de este proyecto
- **v0.dev ($30 créditos):** generación de escenas React Three Fiber — uso quirúrgico,
  solo para los 4 componentes de escena 3D con specs exactos ya definidos

**Lo que NO usa este proyecto:**
- ❌ OpenAI API en runtime — el feedback normativo es texto estático en JSON
- ❌ Ninguna IA generativa en producción — el simulador es determinístico
- ❌ APIs de pago en el MVP

---

## 📁 Estructura del Proyecto

```
chemsim-peru/
│
├── AGENTS.md
├── .env.example
├── .env.local                         ← NO commitear (en .gitignore)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vercel.json
│
├── public/
│   ├── models/
│   │   ├── tanker-truck.glb
│   │   └── storage-tank.glb
│   ├── textures/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── simulador/
│   │   │   └── [modo]/
│   │   │       └── page.tsx
│   │   └── resultados/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ModoSelector.tsx
│   │   │   ├── PanelDecision.tsx
│   │   │   ├── FeedbackNormativo.tsx
│   │   │   ├── PantallaPuntaje.tsx
│   │   │   └── BarraProgreso.tsx
│   │   │
│   │   └── scene/
│   │       ├── SceneWrapper.tsx
│   │       ├── Modo1A/
│   │       │   ├── Scene1A.tsx
│   │       │   ├── CamionCisterna.tsx
│   │       │   ├── CarreteraAndina.tsx
│   │       │   └── ObjetosInteractivos1A.tsx
│   │       ├── Modo1B/
│   │       │   ├── Scene1B.tsx
│   │       │   └── TerminalCarga.tsx
│   │       ├── Modo2A/
│   │       │   ├── Scene2A.tsx
│   │       │   └── TanqueEstatico.tsx
│   │       ├── Modo2B/
│   │       │   ├── Scene2B.tsx
│   │       │   └── PlantaIndustrial.tsx
│   │       └── shared/
│   │           ├── GasParticles.tsx
│   │           ├── ObjetoClickable.tsx
│   │           └── IndicadorViento.tsx
│   │
│   ├── data/
│   │   ├── scenarios/
│   │   │   ├── modo1a.json
│   │   │   ├── modo1b.json
│   │   │   ├── modo2a.json
│   │   │   └── modo2b.json
│   │   └── sustancias/
│   │       ├── clase3-inflamables.json
│   │       ├── clase2-gases.json
│   │       ├── clase8-corrosivos.json
│   │       └── clase6-toxicos.json
│   │
│   ├── engine/
│   │   ├── gameEngine.ts
│   │   ├── scoreCalculator.ts
│   │   ├── feedbackEngine.ts
│   │   └── types.ts
│   │
│   ├── store/
│   │   └── simulatorStore.ts
│   │
│   └── lib/
│       ├── constants.ts
│       ├── normativa.ts
│       └── reportUtils.ts
│
└── skills/
    ├── r3f-scene-builder.md
    ├── normativa-game-engine.md
    ├── particle-system-gas.md
    └── nextjs-project-manager.md
```

---

## 🤖 Instrucciones para el Agente Codex

### Rol de Codex en este proyecto

**Codex es el único agente que escribe código.** No hay ninguna IA generativa
corriendo en producción. Codex desktop (modelo o3/o4) recibe prompts del usuario
y construye el proyecto módulo por módulo usando las skills de la carpeta `skills/`.

El flujo es:
```
Usuario → prompt a Codex → Codex lee AGENTS.md + skills relevante → escribe código
```

v0.dev se usa de forma manual y separada: el usuario lleva un prompt específico
a v0.dev, copia el componente generado, y Codex lo integra al proyecto.

### Comportamiento General

**Toma de decisiones técnicas:**
- Si una tarea tiene dos formas correctas, elegir siempre la más simple y legible
- Preferir componentes pequeños y composables sobre componentes grandes
- TypeScript estricto — nunca usar `any` explícito
- Antes de crear un componente, verificar si `shared/` ya tiene algo reutilizable

**Ante ambigüedad:**
- Sin especificar modo → comenzar por Modo 1A
- Sin especificar clase ONU → usar Clase 3 (más frecuente en Perú)
- Sin especificar estilo → paleta: fondo #0a0a0a, acento #f97316, texto #ffffff

**Manejo de errores:**
- Errores TypeScript: resolver antes de avanzar al siguiente módulo
- Errores Three.js/R3F: consultar `skills/r3f-scene-builder.md`
- Errores de configuración: consultar `skills/nextjs-project-manager.md`
- Import de Three.js en SSR: siempre `dynamic` con `ssr: false`

**Cuándo actuar solo vs pedir confirmación:**
- Actuar solo: crear archivos, escribir código, instalar dependencias del package.json
- Pedir confirmación: eliminar archivos existentes, modificar JSON de escenarios
  (contienen normativa verificada), cambiar estructura de carpetas de este AGENTS.md

---

### Reglas de Código

**Nomenclatura (no negociable):**
```
Componentes React:   PascalCase.tsx        → SceneWrapper.tsx
Hooks:               use + PascalCase.ts   → useGameTimer.ts
Stores Zustand:      camelCase + Store.ts  → simulatorStore.ts
JSON de datos:       kebab-case.json       → modo1a.json
Constantes:          UPPER_SNAKE_CASE      → PUNTAJE_APROBATORIO
Utilidades:          camelCase.ts          → reportUtils.ts
```

**Orden de imports obligatorio:**
```typescript
// 1. React y Next.js
import { useState } from 'react'
import dynamic from 'next/dynamic'

// 2. Librerías externas
import { Canvas } from '@react-three/fiber'
import { create } from 'zustand'

// 3. Imports internos con alias @/
import { useSimulatorStore } from '@/store/simulatorStore'
import type { Escenario } from '@/engine/types'

// 4. Imports relativos (solo archivos muy cercanos)
import { ObjetoClickable } from './ObjetoClickable'
```

**Comentarios en componentes de escena 3D (obligatorios):**
```tsx
/**
 * Scene1A — Camión cisterna en carretera andina (Modo 1A)
 * Clase ONU: 3 — Líquido inflamable (Gasolina, N° ONU 1203)
 *
 * Objetos interactivos y paso que activan:
 *   'triangulos'       → paso_2 (señalización vial)
 *   'valvula'          → paso_3 (identificar N° ONU)
 *   'telefono'         → paso_4 (llamar 116)
 *   'indicador-viento' → paso_5 (posición de seguridad)
 *   'extintor'         → distractor (no correcto en este modo)
 */
```

---

### Arquitectura del feedback normativo

**IMPORTANTE:** El feedback es 100% estático. No hay llamadas a ninguna API en runtime.

El flujo es:
```
Usuario elige opción
→ gameEngine busca en el JSON del escenario
→ devuelve feedback_correcto o feedback_incorrecto del JSON
→ FeedbackNormativo.tsx lo muestra con la cita normativa
```

Los textos de feedback ya están escritos en los archivos `src/data/scenarios/modoXX.json`
con las citas exactas del DS 021-2008-MTC. No se generan dinámicamente.

---

### Flujo de Trabajo por Módulo

#### MÓDULO 1 — Data Layer
1. Crear `src/engine/types.ts` con todas las interfaces TypeScript
2. Crear `src/data/scenarios/modo1a.json` (skill: normativa-game-engine.md)
3. Crear `src/lib/constants.ts` con PUNTAJE_APROBATORIO y distancias ONU
4. Crear `src/lib/normativa.ts` con referencias normativas
5. ✅ Verificar: `npx tsc --noEmit` = 0 errores

#### MÓDULO 2 — Game Engine
1. Crear `src/engine/gameEngine.ts` con evaluarRespuesta() y calcularResultado()
2. Crear `src/engine/feedbackEngine.ts`
3. Crear `src/store/simulatorStore.ts` con Zustand
4. ✅ Verificar: `npx tsc --noEmit` = 0 errores

#### MÓDULO 3 — UI Shell (sin 3D)
1. Crear `src/app/layout.tsx` y `src/app/page.tsx`
2. Crear todos los componentes en `src/components/ui/`
3. Crear `src/app/simulador/[modo]/page.tsx`
4. ✅ Verificar: simulador completo funciona en 2D en localhost:3000

#### MÓDULO 4 — Componentes 3D compartidos
1. Crear `src/components/scene/shared/ObjetoClickable.tsx`
2. Crear `src/components/scene/shared/GasParticles.tsx`
3. Crear `src/components/scene/shared/IndicadorViento.tsx`
4. Crear `src/components/scene/SceneWrapper.tsx`
5. ✅ Verificar: `npx tsc --noEmit` = 0 errores

#### MÓDULO 5 — Escena Modo 1A (MVP)
Dos opciones para obtener la escena:
- **Opción A (recomendada):** llevar el prompt de v0 a v0.dev, copiar el
  componente generado, pedirle a Codex que lo integre y conecte con el store
- **Opción B:** pedirle a Codex que construya la escena con geometrías
  primitivas (BoxGeometry, CylinderGeometry) sin GLB — funcional aunque
  menos visualmente elaborada

1. Construir o integrar Scene1A con los 5 objetos interactivos
2. Conectar cada objeto con `selectObject()` del store
3. Añadir GasParticles con claseONU={3}
4. Modificar la ruta `[modo]/page.tsx` para cargar la escena con dynamic import
5. ✅ Verificar: flujo completo 3D funciona de inicio a fin

#### MÓDULOS 6-8 — Escenas 1B, 2A, 2B
Mismo patrón. JSON de escenario primero, luego escena 3D.

#### MÓDULO 9 — Resultados y reportes
1. Crear `src/lib/reportUtils.ts`
2. Mejorar `PantallaPuntaje.tsx` con animaciones Framer Motion
3. Crear `src/app/resultados/page.tsx`
4. ✅ Verificar: descarga de reporte JSON funciona

#### MÓDULO 10 — Deploy
1. Ejecutar `npm run build` y resolver errores
2. Crear `vercel.json` con headers CORS
3. ✅ Verificar: build sin errores → deploy en Vercel

---

### Instrucciones para integrar componentes de v0

Cuando el usuario traiga un componente generado por v0.dev:

1. Guardar el componente en la ruta correspondiente (`src/components/scene/ModoXX/SceneXX.tsx`)
2. Verificar que tiene `'use client'` al inicio
3. Instalar cualquier dependencia nueva que requiera: `npm install [paquete]`
4. Reemplazar cualquier estado local (`useState`) por el store de Zustand:
   - `const [step, setStep] = useState(0)` → `const { currentStep } = useSimulatorStore()`
5. Conectar los handlers de click a `selectObject()` del store
6. Verificar que la escena carga con `dynamic(() => import(...), { ssr: false })`
7. Ejecutar `npx tsc --noEmit`

---

### Skills Configuradas

| Skill | Cuándo usar |
|---|---|
| `skills/r3f-scene-builder.md` | Cualquier componente en `src/components/scene/` |
| `skills/normativa-game-engine.md` | JSON de datos, engine, store, tipos TypeScript |
| `skills/particle-system-gas.md` | GasParticles.tsx y efectos visuales de fuga |
| `skills/nextjs-project-manager.md` | Configuración, imports, rutas, errores de build |

**Regla:** antes de escribir código para un módulo, leer la skill relevante.
Los patrones de código en las skills son plantillas, no sugerencias opcionales.

---

### Restricciones Absolutas

**NUNCA modificar sin confirmación:**
- Los JSON de escenarios una vez aprobados (contienen normativa verificada)
- La estructura de carpetas de este AGENTS.md
- Las interfaces en `src/engine/types.ts` (rompe todos los JSON)
- El valor de PUNTAJE_APROBATORIO (está fijado por ley en 70%)

**NUNCA hacer:**
- Añadir llamadas a OpenAI API, Anthropic API, o cualquier LLM en runtime
- Usar `any` en TypeScript
- Crear Server Components que importen Three.js directamente
- Eliminar archivos sin confirmación explícita del usuario
- Hacer commits o pushes de git sin que el usuario lo pida

**Límites de autonomía:**
- Codex puede crear y editar archivos dentro de `src/` libremente
- Codex NO modifica `public/models/` — los GLB los provee el usuario o v0
- Codex NO toca variables de entorno en `.env.local`

---

## ✅ Checklist de Configuración Inicial

- [ ] Repositorio creado en GitHub
- [ ] Proyecto Next.js inicializado (`npx create-next-app@14.2.5`)
- [ ] Estructura `src/` creada manualmente o por Codex
- [ ] `AGENTS.md` en la raíz del proyecto
- [ ] Carpeta `skills/` con los 4 archivos .md
- [ ] `.env.example` en la raíz
- [ ] `.env.local` creado desde `.env.example` (no commiteado)
- [ ] `next.config.js` con transpilePackages para Three.js
- [ ] `tsconfig.json` con paths alias `@/*`
- [ ] `npm install` ejecutado sin errores
- [ ] Módulo 1 completo: `npx tsc --noEmit` = 0 errores
- [ ] Módulo 2 completo: engine y store funcionando
- [ ] Módulo 3 completo: simulador 2D funcional
- [ ] Módulo 5 completo: escena 3D Modo 1A integrada
- [ ] `npm run build` sin errores
- [ ] Deploy en Vercel activo