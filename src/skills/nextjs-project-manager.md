# Skill: Next.js Project Manager
## Descripción
Gestiona la inicialización, estructura y configuración del proyecto
ChemSim Perú en Next.js 14 con App Router, TypeScript y Tailwind.
Define convenciones de archivos, imports, configuración de bundler
para Three.js, y reglas de organización del código.

## Cuándo usar esta skill
- Al inicializar el proyecto por primera vez
- Al crear nuevos archivos o directorios
- Cuando el prompt mencione: "configurar", "instalar", "package.json",
  "tsconfig", "next.config", "nueva ruta", "nuevo componente"
- Al resolver errores de imports o configuración de bundler
- Al configurar variables de entorno

## Instrucciones para el agente

### PASO 1 — Configuración next.config.js (crítica para Three.js)

```javascript
// next.config.js — OBLIGATORIO para R3F + Next.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Three.js necesita transpilación en Next.js
  transpilePackages: ['three'],

  webpack: (config) => {
    // Permite importar archivos .glb y .gltf
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: { loader: 'file-loader', options: { publicPath: '/_next/static/', outputPath: 'static/' } }
    })
    return config
  },

  // Optimización de imágenes para texturas
  images: {
    formats: ['image/webp'],
  },

  // Headers de seguridad para SharedArrayBuffer (necesario para algunos workers de Three.js)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### PASO 2 — package.json con versiones fijas

```json
{
  "name": "chemsim-peru",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.167.0",
    "@react-three/fiber": "^8.17.5",
    "@react-three/drei": "^9.108.3",
    "@react-three/postprocessing": "^2.16.2",
    "zustand": "^4.5.4",
    "framer-motion": "^11.3.17"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "@types/node": "^20.14.11",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.167.0",
    "tailwindcss": "^3.4.7",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5",
    "file-loader": "^6.2.0"
  }
}
```

### PASO 3 — tsconfig.json con paths alias

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/engine/*": ["./src/engine/*"],
      "@/store/*": ["./src/store/*"],
      "@/data/*": ["./src/data/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### PASO 4 — Convenciones de archivos (reglas obligatorias)

**Nomenclatura:**
- Componentes React: `PascalCase.tsx` → `SceneWrapper.tsx`, `PanelDecision.tsx`
- Hooks: `camelCase.ts` con prefijo `use` → `useGameTimer.ts`
- Stores: `camelCase.ts` con sufijo `Store` → `simulatorStore.ts`
- Datos JSON: `kebab-case.json` → `modo1a.json`, `clase3-inflamables.json`
- Utilidades: `camelCase.ts` → `scoreCalculator.ts`

**Estructura de imports (orden obligatorio en cada archivo):**
```typescript
// 1. React y Next
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Librerías externas
import { Canvas } from '@react-three/fiber'
import { create } from 'zustand'

// 3. Imports internos con alias @/
import { useSimulatorStore } from '@/store/simulatorStore'
import type { Escenario } from '@/engine/types'

// 4. Imports relativos (solo para archivos muy cercanos)
import { ObjetoClickable } from './ObjetoClickable'
```

### PASO 5 — Variables de entorno

```bash
# .env.local (NO commitear)
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_NAME=ChemSim Perú

# .env.example (sí commitear — plantilla vacía)
NEXT_PUBLIC_APP_VERSION=
NEXT_PUBLIC_APP_NAME=
```

### PASO 6 — Resolución de errores comunes

**Error: "Cannot use import statement" con Three.js en Next.js:**
→ Verificar que `transpilePackages: ['three']` está en next.config.js
→ Si persiste: añadir el paquete problemático al array de transpilePackages

**Error: "document is not defined" en componentes 3D:**
→ El componente debe tener `'use client'` al inicio
→ Si es un import dinámico, usar: `const Scene = dynamic(() => import('./Scene'), { ssr: false })`

**Error: módulos GLB no resueltos:**
→ Verificar la regla de file-loader en next.config.js
→ Los modelos deben estar en `/public/models/` y referenciarse como `/models/archivo.glb`

## Ejemplo de uso aplicado al proyecto
Al crear una nueva ruta para el Modo 2A:
1. Crear `src/app/simulador/modo2a/page.tsx` con `'use client'`
2. Usar `dynamic(() => import('@/components/scene/Modo2A/Scene2A'), { ssr: false })`
3. El archivo de datos ya existe en `src/data/scenarios/modo2a.json`
4. El store ya maneja el estado — solo llamar `loadEscenario(modo2aData)` en `useEffect`

## Restricciones
- NUNCA usar `pages/` router — este proyecto usa App Router exclusivamente
- NUNCA importar Three.js directamente en Server Components
- TODOS los componentes que usen R3F deben tener `'use client'`
- Canvas de Three.js SIEMPRE debe cargarse con `dynamic` y `ssr: false`
- NO usar `require()` — solo `import` ES modules
- Variables de entorno públicas SIEMPRE con prefijo `NEXT_PUBLIC_`
