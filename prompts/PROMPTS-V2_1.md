# PROMPTS v2 — ChemSim Perú
> Reemplaza los PROMPTS-CODEX.md anteriores para la v2
> Enviar EN ESTE ORDEN a Codex desktop (modelo o3/o4)

---

## 🚀 PROMPT V2-1 — Migración de tipos y motor central
**Cuándo:** primero de todo, sobre el proyecto existente

---
Lee AGENTS.md y la skill `skills/worldstate-engine-v2.md` completas.

El proyecto pasa de v1 a v2. El cambio central es el worldState.

**1. Reemplaza `src/engine/types.ts`** con el contenido del archivo
`src-engine-types.ts` que ya existe en el proyecto. No modificar nada.

**2. Crea `src/engine/worldState.ts`** con el contenido del archivo
`src-engine-worldState.ts` que ya existe en el proyecto. No modificar nada.

**3. Reemplaza `src/store/simulatorStore.ts`** con el contenido del archivo
`src-store-simulatorStore.ts` que ya existe en el proyecto.

**4. Elimina estos archivos que ya no se usan:**
- `src/engine/gameEngine.ts`
- `src/engine/feedbackEngine.ts`
- `src/engine/scoreCalculator.ts`
- `src/data/scenarios/` (toda la carpeta)

**5. Crea la carpeta `src/data/decisions/`** y copia dentro el archivo
`decisions-escena1.json` que ya existe en el proyecto,
renombrándolo a `escena1.json`.

**6. Ejecuta `npx tsc --noEmit`.** Resuelve TODOS los errores antes de continuar.
Los errores más probables son imports rotos de los archivos eliminados —
buscar y actualizar cada import que referencie gameEngine, feedbackEngine
o scoreCalculator.

---
**Verificar:** `npx tsc --noEmit` = 0 errores

---

## 🚀 PROMPT V2-2 — JSON de decisiones escenas 2 y 3
**Cuándo:** después de V2-1 con 0 errores

---
Lee la skill `skills/worldstate-engine-v2.md`, PASO 2 (schema del decisions.json).
Lee también `src/data/decisions/escena1.json` como referencia de formato.

Crea `src/data/decisions/escena2.json` — Identificación y primera respuesta.
Escena: zona del derrame con la fuga activa. El worldState viene de E1.
Incluir exactamente estas acciones (id, tipo, efecto, puntos, feedback normativo):

Acciones correctas:
- e2_consultar_sds: Consultar Hoja SDS del vehículo | correcto | +7pts | leyo_kemler debe ser true para desbloquear esta acción
- e2_llamar_116: Llamar al 116 e informar N°ONU 1830 | correcto | +15pts | efecto: llamo_116=true | trigger: null (no navega aún)
- e2_poner_senalizacion: Colocar triángulos de seguridad | correcto | +10pts | efecto: senalizacion_puesta=true
- e2_verificar_epp: Confirmar EPP nivel B puesto | correcto | +5pts | efecto: epp_puesto=true
- e2_avanzar_escena3: Confirmar acciones completadas y esperar bomberos | correcto | +0pts | trigger: escena_3 | SOLO disponible si llamo_116=true

Acciones de error:
- e2_tocar_valvula_sin_epp: Intentar cerrar válvula sin EPP | error_critico | -15pts | efecto: fuga_pct_delta=+15, radio_peligro_m=8
- e2_usar_extintor: Usar extintor CO2 sobre ácido | error_critico | -10pts | efecto: fuga_pct_delta=+10
- e2_llamar_jefe_primero: Llamar al jefe antes que al 116 | error_leve | -5pts | efecto: tiempo_perdido_seg=60, fuga_pct_delta=+3
- e2_usar_agua: Echar agua sobre el derrame de ácido | error_critico | -15pts | efecto: fuga_pct_delta=+20, radio_peligro_m=12

Para cada acción: feedback_texto explicando el riesgo real + articulo_normativo exacto.

Luego crea `src/data/decisions/escena3.json` — Espera y coordinación con bomberos.
Acciones:
- e3_tener_documentos: Preparar Hoja SDS + plano de rutas para bomberos | correcto | +5pts | efecto: documentos_listos=true
- e3_llamar_dgaam: Notificar a DGAAM (01)411-1000 | correcto | +5pts | efecto: notifico_dgaam=true
- e3_alejar_civil: Alertar y alejar al civil en peligro (si civil_en_peligro=true) | correcto | +5pts | efecto: civil_en_peligro=false
- e3_esperar_correctamente: Mantenerse en posición segura a favor del viento | correcto | +0pts | trigger: fin_exitoso
- e3_reparar_valvula: Intentar reparar válvula mientras espera | error_critico | -20pts | efecto: fuga_pct_delta=+20 | trigger: escena_F_C
- e3_abandonar_camion: Alejarse más de 50m sin supervisión | error_critico | -20pts | trigger: escena_F_C

Ejecuta `npx tsc --noEmit` al terminar. Cero errores.

---
**Verificar:** 3 archivos JSON en decisions/ + `npx tsc --noEmit` = 0 errores

---

## 🚀 PROMPT V2-3 — UI 2D con worldState activo (sin 3D)
**Cuándo:** después de V2-2

---
Lee la skill `skills/worldstate-engine-v2.md`, PASO 5 y 6.

El simulador debe funcionar completamente en 2D con el worldState activo
entre escenas ANTES de añadir cualquier 3D.

**1. Crea `src/components/ui/BarraEstado.tsx`**
Reemplaza BarraProgreso. Muestra en tiempo real:
- Barra de fuga: porcentaje con color (verde < 20%, amarillo 20-50%, rojo > 50%)
- Errores críticos: íconos de ⚠️ (máx 3, color rojo cuando llega a 3)
- Tiempo de escena: reloj en formato mm:ss
- Escena actual: "Escena 1 / 2 / 3"

**2. Actualiza `src/components/ui/PanelAcciones.tsx`** (antes PanelDecision)
Ya no muestra opciones predefinidas. Muestra los botones de acciones
disponibles en la escena actual, cargados desde el JSON de decisions.
Cada botón llama a `ejecutarAccion(accion)` del store.
Botones bloqueados (color gris, cursor-not-allowed) si:
- `isLocked` es true
- La acción requiere leyo_kemler=true pero worldState.leyo_kemler=false
- La acción es e2_avanzar_escena3 pero worldState.llamo_116=false

**3. Actualiza `src/components/ui/FeedbackNormativo.tsx`**
Recibe el `ultimoFeedback` del store. Muestra:
- ✅ o ❌ o ⚠️ según tipo de acción
- Texto del feedback
- Cita normativa
- Puntos obtenidos/perdidos
- Botón "Continuar" que llama a `cerrarFeedback()` del store
- Componente PanelTutor debajo (streaming IA)

**4. Actualiza `src/app/simulador/page.tsx`**
Ruta única `/simulador` (ya no es `/simulador/[modo]`).
Lógica de renderizado:
```
si escena_actual empieza con 'escena_F' → mostrar EscenaF (placeholder 2D por ahora)
si resultado existe y no hay trigger_fallo → mostrar PantallaPuntaje
si no → mostrar BarraEstado + PanelAcciones + FeedbackNormativo superpuesto
```
Incluir el useEffect con setInterval para tickTiempo() cada 1 segundo.
Llamar a `iniciarSimulacion()` en el primer useEffect al montar.

**5. Actualiza `src/app/page.tsx`**
El botón de inicio ahora enlaza a `/simulador` (sin modo en la URL).
Mostrar solo el escenario principal (Ácido Sulfúrico, Clase 8, Ruta Lima-Ica).

Probar el flujo completo en localhost:3000:
- Iniciar simulación → ver BarraEstado activa
- Hacer click en acciones → ver feedback normativo
- Cometer 3 errores críticos → verificar que worldState.errores_criticos llega a 3
- Verificar que la fuga crece con el reloj cada 30 segundos

---
**Verificar:** flujo 2D completo funciona, worldState se actualiza en tiempo real

---

## 🚀 PROMPT V2-4 — EscenaF con 3 versiones
**Cuándo:** después de V2-3 funcionando

---
Lee la skill `skills/worldstate-engine-v2.md`, PASO 4.

Construye la Escena F completa — es la escena nueva más importante de v2.

**1. Crea `src/components/scene/EscenaF/EscenaF.tsx`**
Dispatcher que lee `worldState.escena_actual` y renderiza la versión correcta.

**2. Crea `src/components/scene/EscenaF/EscenaFVersionA.tsx`**
Trigger: timeout de detección (no detectó en 5 min).
Mensaje principal: "La fuga estuvo activa durante 5 minutos sin ser detectada..."
Muestra: narrativa, impacto (volumen estimado 2,400L, área 140m²), normativa violada.

**3. Crea `src/components/scene/EscenaF/EscenaFVersionB.tsx`**
Trigger: 3 errores críticos o fuga ≥ 70% sin llamar.
Mensaje: "Las acciones tomadas sin equipo adecuado convirtieron la fuga en derrame incontrolable..."
Highlight de la acción específica que desencadenó el fallo (de `resultado.acciones_ejecutadas`).

**4. Crea `src/components/scene/EscenaF/EscenaFVersionC.tsx`**
Trigger: abandono o civil afectado.
Mensaje: "El camión quedó sin supervisión con una fuga activa..."

**Cada versión incluye obligatoriamente:**
- Título: "SIMULACIÓN FALLIDA — Derrame masivo activo"
- Causa directa del fallo (específica al trigger)
- Decisión exacta que lo desencadenó (highlight)
- Impacto ambiental: volumen derramado, área contaminada, costo referencial educativo
- Infracciones normativas: artículos violados del DS 021-2008-MTC
- Qué debiste hacer diferente: 3 acciones con su artículo normativo
- Botón "Intentar de nuevo" → `resetSimulador()`
- Botón "Ver protocolo correcto" → muestra el flujo correcto sin simulación

Diseño: fondo muy oscuro (#0a0a0a), textos en rojo oscuro y gris, sin elementos de acción interactiva (es informativa).

---
**Verificar:** provocar fallo por cada trigger y verificar que aparece la versión correcta con el mensaje específico

---

## 🚀 PROMPT V2-5 — Integrar escenas 3D con worldState
**Cuándo:** después de V2-4, y después de traer los componentes de v0

---
⚠️ ANTES DE ESTE PROMPT: llevar a v0.dev el prompt de cada escena.

PROMPT para v0 — Escena 1:
"""
Create a React Three Fiber scene: Peruvian highway at sunset, chemical tanker
truck stopped on roadside with visible acid leak (yellowish mist) from side valve.
8 clickable 3D objects:
1. "zona_valvula" — leaking valve with orange warning glow
2. "panel_kemler" — orange Kemler panel on tank side showing "80/1830"
3. "kit_epp" — safety kit box near truck cab
4. "cabina_motor" — truck cab door
5. "extintor" — red fire extinguisher
6. "hoja_sds" — document holder near cab
7. "zona_confirmacion" — glowing zone to proceed
8. "triangulos" — safety triangles in storage

Each object calls onObjectClick(objetoId: string) on click.
Objects can be disabled via disabledObjects: Set<string> prop.
TypeScript, @react-three/fiber, @react-three/drei, Sky sunset atmosphere.
Export as default Scene1.
"""

Después de copiar el componente de v0:

1. Guarda en `src/components/scene/Escena1/Scene1Base.tsx`
2. Crea `src/components/scene/Escena1/Scene1.tsx` que:
   - Importa Scene1Base
   - Lee worldState del store
   - Calcula objetosBloqueados según worldState (ver PASO 3 de worldstate-engine-v2.md)
   - El prop onObjectClick busca la acción por objeto_3d_id en escena1.json y llama a ejecutarAccion()
   - Hace GasParticles reactivo a worldState.fuga_pct
3. Modifica `src/app/simulador/page.tsx` para cargar Scene1 con dynamic import (ssr: false)
4. Repetir el proceso para Escena2 y Escena3 con sus respectivos prompts v0

Ejecuta `npx tsc --noEmit` y resuelve errores.

---
**Verificar:** flujo 3D completo, fuga crece visualmente con el tiempo, objetos se bloquean según worldState

---

## 🚀 PROMPT V2-6 — Fallback IA a Anthropic
**Cuándo:** cuando los créditos de OpenRouter se agoten o como prevención

---
Lee la skill `skills/ai-tutor-reporte.md`.

Implementa el fallback del tutor a Anthropic Claude Haiku.

**1. Actualiza `.env.example`:**
```
ANTHROPIC_API_KEY=
# Obtener en: console.anthropic.com → API Keys
# Modelo fallback: claude-haiku-4-5-20251001 (más económico de Anthropic)
```

**2. Crea `src/lib/anthropicClient.ts`:**
```typescript
import Anthropic from '@anthropic-ai/sdk'
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})
export const MODELO_FALLBACK = 'claude-haiku-4-5-20251001'
```

**3. Instala:** `npm install @anthropic-ai/sdk`

**4. Crea `src/app/api/tutor-fallback/route.ts`:**
Misma lógica que /api/tutor pero usando anthropic.messages.stream()
con el modelo MODELO_FALLBACK. Mismo sistema prompt, misma respuesta streaming.
Edge Runtime.

**5. Actualiza `src/components/ui/PanelTutor.tsx`:**
Leer `modeloActivo` del store.
Si modeloActivo === 'anthropic': llamar a `/api/tutor-fallback`.
Si modeloActivo === 'openrouter': llamar a `/api/tutor`.
Si ambos fallan: mostrar solo el feedback normativo estático sin tutor.

**6. Crea `src/app/api/health/route.ts`:**
```typescript
// Verifica qué modelo está disponible
export async function GET() {
  const tieneOpenRouter = !!process.env.OPENROUTER_API_KEY
  const tieneAnthropic = !!process.env.ANTHROPIC_API_KEY
  return Response.json({ openrouter: tieneOpenRouter, anthropic: tieneAnthropic })
}
```

Al terminar: probar con `modeloActivo: 'anthropic'` forzado en el store,
verificar que el tutor sigue funcionando.

---
**Verificar:** cambiar modeloActivo a 'anthropic' en store → tutor sigue con streaming

---

## 🚀 PROMPT V2-7 — PantallaPuntaje v2 + Supabase
**Cuándo:** después de V2-5

---
Actualiza el sistema de resultados para mostrar el nuevo puntaje v2
y guardar en Supabase.

**1. Actualiza `src/components/ui/PantallaPuntaje.tsx`:**
Mostrar con Framer Motion:
- Título según nivel: "EXCELENTE ✅" / "APROBADO ✅" / "EN DESARROLLO ⚠️" / "REPROBADO ❌"
- Puntaje con count-up animado
- Desglose por categoría (las 6 del schema DesglosePuntaje)
- Camino tomado: lista de escenas visitadas con íconos
- Si hubo trigger de fallo: mostrar cuál fue con mensaje de alerta rojo
- Botón "Ver análisis IA" que llama a /api/reporte
- Botón "Intentar de nuevo"

**2. Actualiza `src/app/api/reporte/route.ts`:**
El prompt al modelo ahora incluye:
- worldState_final completo
- camino_tomado
- trigger_fallo (si aplica)
- nivel de desempeño
Para que el reporte sea específico al camino que tomó el usuario.

**3. Guarda resultado en Supabase:**
En la pantalla de puntaje, useEffect que llama a POST /api/simulaciones
guardando el ResultadoSimulacion completo.
Crear `src/app/api/simulaciones/route.ts` que inserta en la tabla simulaciones.

Ejecutar `npx tsc --noEmit`. Cero errores.

---
**Verificar:** completar simulación → ver puntaje con desglose → ver reporte IA → confirmar fila en Supabase

---

## 🚀 PROMPT V2-8 — Build y deploy final
**Cuándo:** todo lo anterior funcionando

---
Prepara para producción.

1. Ejecuta `npm run build`. Resuelve todos los errores.
2. Verifica que todas las rutas API funcionan en modo producción con `npm run start`
3. Verifica que el fallback a Anthropic funciona si OPENROUTER_API_KEY está vacía
4. Lista todos los archivos del proyecto con descripción de una línea

No hacer commit — lo hace el usuario.

---
**Verificar:** `npm run build` sin errores + `npm run start` funciona
