# ChemSim Peru

Simulador web de capacitacion para emergencias con materiales peligrosos,
basado en el DS 021-2008-MTC de Peru y referencias ONU.

El MVP incluye:

- Selector de modo de entrenamiento.
- Flujo funcional del Modo 1A: fuga en ruta con camion cisterna Clase 3.
- Escena 3D React Three Fiber integrada para el Modo 1A.
- Evaluacion de 5 decisiones secuenciales.
- Feedback normativo estatico desde JSON.
- Pantalla final de puntaje y exportacion del resultado como JSON.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Three.js / React Three Fiber / Drei
- Zustand
- Framer Motion

## Requisitos

Ver [REQUIREMENTS.md](./REQUIREMENTS.md).

## Instalacion

```bash
npm ci
```

Si no tienes `package-lock.json` actualizado, usa:

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Ruta principal del simulador:

```text
http://localhost:3000/simulador/modo1a
```

## Produccion

```bash
npm run build
npm run start
```

## Variables de entorno

El MVP no requiere variables de entorno para correr localmente.

No subir archivos `.env` al repositorio.

## Archivos que no deben subirse

Este repositorio ignora archivos locales de trabajo del agente y configuracion privada:

- `.env`, `.env.*`
- `AGENTS.md`
- `PROMPTS-CODEX.md`
- `PROJECT-CONTINUATION.md`
- `skills/`
- `src/skills/`
- `.next/`
- `node_modules/`

## Deploy

El proyecto esta preparado para Vercel. El archivo `vercel.json` agrega headers
COOP/COEP necesarios para compatibilidad con ciertos flujos de Three.js.
