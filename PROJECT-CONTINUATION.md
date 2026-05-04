# ChemSim Peru - Continuidad del proyecto

## Estado actual

- Prompts 1 a 9 ejecutados.
- `npm run build` termina sin errores.
- `npm run start` responde en `localhost:3000`.
- Verificado:
  - `/` devuelve HTTP 200.
  - `/simulador/modo1a` devuelve HTTP 200.
- La escena 3D de v0 fue integrada desde `C:\Users\HAPPY TEC\Downloads\b_bAe4bh39bC4.zip`.
- No se copio el proyecto completo de v0 ni sus dependencias Next 16/React 19; solo se adapto `components/scene-1a.tsx`.

## Siguiente paso manual

Deploy manual en Vercel:

1. Revisar visualmente `http://localhost:3000/simulador/modo1a`.
2. Confirmar que el flujo 3D acepta clicks en objetos:
   - Paso 2: `triangulos`
   - Paso 3: `valvula`
   - Paso 4: `telefono`
   - Paso 5: `indicador-viento`
3. Ejecutar manualmente:
   - `git add .`
   - `git commit -m "feat: ChemSim Peru MVP completo"`
   - `git push origin main`
4. Importar el repo en Vercel.

## Archivos del proyecto

`.gitignore` - Ignora dependencias, build de Next y variables locales.
`AGENTS.md` - Reglas del agente, arquitectura y restricciones del proyecto.
`PROMPTS-CODEX.md` - Bateria de prompts usados para construir el MVP.
`PROJECT-CONTINUATION.md` - Estado de continuidad para retomar el trabajo.
`README.md` - Documento inicial de create-next-app.
`next-env.d.ts` - Tipos generados por Next.js.
`next.config.js` - Configuracion Next para R3F, Three.js, GLB/GLTF y headers COOP/COEP.
`package.json` - Scripts y dependencias del proyecto.
`package-lock.json` - Lockfile de npm.
`postcss.config.mjs` - Configuracion PostCSS para Tailwind.
`tailwind.config.ts` - Configuracion Tailwind y paleta ChemSim.
`tsconfig.json` - Configuracion TypeScript estricta con alias `@/`.
`tsconfig.tsbuildinfo` - Cache incremental de TypeScript.
`vercel.json` - Headers de seguridad para deploy en Vercel.

`public/next.svg` - Logo placeholder de Next.js.
`public/vercel.svg` - Logo placeholder de Vercel.

`src/app/favicon.ico` - Icono de la app movido desde create-next-app.
`src/app/globals.css` - Estilos globales y directivas Tailwind.
`src/app/layout.tsx` - Layout raiz App Router con metadata en espanol.
`src/app/page.tsx` - Pantalla de inicio y selector de modos.
`src/app/resultados/.gitkeep` - Mantiene carpeta de resultados.
`src/app/simulador/.gitkeep` - Mantiene carpeta de simulador.
`src/app/simulador/[modo]/.gitkeep` - Mantiene ruta dinamica.
`src/app/simulador/[modo]/page.tsx` - Ruta dinamica del simulador, timer, escena 3D y overlays.

`src/components/ui/.gitkeep` - Mantiene carpeta UI.
`src/components/ui/BarraProgreso.tsx` - Barra de progreso de 5 pasos.
`src/components/ui/FeedbackNormativo.tsx` - Modal de feedback correcto/incorrecto con cita normativa.
`src/components/ui/PanelDecision.tsx` - Panel de pregunta y opciones.
`src/components/ui/PantallaPuntaje.tsx` - Resultado animado con reporte JSON y compartir.

`src/components/scene/.gitkeep` - Mantiene carpeta de escenas.
`src/components/scene/SceneWrapper.tsx` - Canvas base reutilizable para escenas R3F.
`src/components/scene/Modo1A/.gitkeep` - Mantiene carpeta Modo 1A.
`src/components/scene/Modo1A/Scene1A.tsx` - Wrapper conectado a Zustand para la escena Modo 1A.
`src/components/scene/Modo1A/Scene1ABase.tsx` - Escena 3D generada por v0 y adaptada.
`src/components/scene/Modo1B/.gitkeep` - Mantiene carpeta Modo 1B.
`src/components/scene/Modo2A/.gitkeep` - Mantiene carpeta Modo 2A.
`src/components/scene/Modo2B/.gitkeep` - Mantiene carpeta Modo 2B.
`src/components/scene/shared/.gitkeep` - Mantiene carpeta compartida 3D.
`src/components/scene/shared/GasParticles.tsx` - Sistema de particulas por clase ONU.
`src/components/scene/shared/IndicadorViento.tsx` - Indicador 3D de direccion del viento.
`src/components/scene/shared/ObjetoClickable.tsx` - Wrapper 3D reutilizable para objetos clickables.

`src/data/scenarios/.gitkeep` - Mantiene carpeta de escenarios.
`src/data/scenarios/modo1a.json` - Escenario Modo 1A, fuga en ruta Clase 3.
`src/data/scenarios/modo1b.json` - Escenario Modo 1B, terminal de carga GLP Clase 2.
`src/data/scenarios/modo2a.json` - Escenario Modo 2A, tanque estatico Clase 8.
`src/data/scenarios/modo2b.json` - Escenario Modo 2B, emergencia mayor con amoniaco.
`src/data/sustancias/.gitkeep` - Mantiene carpeta de sustancias.

`src/engine/.gitkeep` - Mantiene carpeta engine.
`src/engine/feedbackEngine.ts` - Generador de feedback normativo.
`src/engine/gameEngine.ts` - Evaluacion de respuestas, resultado y objeto activo.
`src/engine/types.ts` - Interfaces TypeScript del simulador.

`src/lib/.gitkeep` - Mantiene carpeta lib.
`src/lib/constants.ts` - Puntaje, contactos y distancias de seguridad.
`src/lib/normativa.ts` - Referencias normativas base.
`src/lib/reportUtils.ts` - Exportacion JSON, texto de compartir y formato de tiempo.

`src/store/.gitkeep` - Mantiene carpeta store.
`src/store/simulatorStore.ts` - Estado global Zustand del simulador.

`src/skills/nextjs-project-manager.md` - Skill local de configuracion Next.js.
`src/skills/normativa-game-engine.md` - Skill local de normativa y game engine.
`src/skills/particle-system-gas.md` - Skill local de particulas de gas.
`src/skills/r3f-scene-builder.md` - Skill local de escenas React Three Fiber.
