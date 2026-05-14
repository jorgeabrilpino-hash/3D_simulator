# PROMPT V2-POLISH — Mejoras profesionales basadas en análisis visual real
> Ejecutar en orden. npx tsc --noEmit = 0 errores después de cada tarea.
> Al terminar: navega localhost:3000, completa flujo completo, corrige lo que encuentres.
> REGLA PERMANENTE: actualiza AGENTS.md al terminar cada tarea significativa.

---

Lee AGENTS.md completo antes de empezar.
Lee components/scene/Escena1/Scene1.tsx como referencia visual base.

---

## TAREA 1 — Recortar todos los textos de feedback_contextual en los JSON

Los textos de feedback son demasiado largos para un simulador de emergencias.
El usuario está en medio de una crisis — textos largos rompen la inmersión.

Regla: máximo 2 líneas, máximo 120 caracteres por decisión incorrecta leve.
Formato: [Consecuencia directa]. [Principio normativo en una frase].

Abre los 3 archivos (escena1.json, escena2.json, escena3.json) y
reescribe TODOS los feedback_contextual siguiendo esta regla.

Ejemplos de cómo acortar:

ANTES (malo):
"Mientras revisabas la cabina, la fuga continuó activa sin supervisión.
En una emergencia química, la primera prioridad es identificar visualmente
la fuente del problema desde una posición segura. El tiempo es un factor
crítico en estos escenarios."

DESPUÉS (correcto):
"La fuga creció sin control mientras revisabas la cabina. Prioridad: identificar
la fuente desde posición segura."

ANTES (malo):
"Regresar a la zona de peligro por razones no operativas expone innecesariamente
al conductor y puede interferir con la escena de emergencia. Una vez establecida
la zona segura, el protocolo indica permanecer fuera del perímetro hasta
autorización expresa de los servicios de emergencia."

DESPUÉS (correcto):
"Zona activa. Prohibido reingresar sin autorización de bomberos — DS 021 Art.164°."

Aplicar a TODOS los feedback_contextual de los 3 JSON.

---

## TAREA 2 — Mejorar materiales y iluminación de todas las escenas

Sin cambiar la geometría, mejorar drásticamente la calidad visual
actualizando materiales e iluminación.

### Materiales mejorados (aplicar a CamionCisterna.tsx):

```tsx
// Tanque cisterna — material metálico real
<meshStandardMaterial
  color="#C8C8C8"
  metalness={0.9}
  roughness={0.15}
  envMapIntensity={1.5}
/>

// Cabina del camión
<meshStandardMaterial
  color="#8B1A1A"
  metalness={0.4}
  roughness={0.6}
/>

// Parabrisas
<meshStandardMaterial
  color="#4488BB"
  transparent
  opacity={0.55}
  metalness={0.1}
  roughness={0.05}
/>

// Charco de ácido derramado — más realista
<meshStandardMaterial
  color="#88AA00"
  transparent
  opacity={0.7}
  roughness={0.02}
  metalness={0.3}
/>
```

### Suelo mejorado — reemplazar el plano marrón plano:

```tsx
// En cada escena, reemplazar el suelo existente con esto:

{/* Asfalto de carretera */}
<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
  <planeGeometry args={[100, 100]} />
  <meshStandardMaterial color="#1a1a1a" roughness={0.95} metalness={0} />
</mesh>

{/* Líneas de carretera — franjas blancas */}
{[-12, -4, 4, 12].map((z, i) => (
  <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
    <planeGeometry args={[40, 0.15]} />
    <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent />
  </mesh>
))}

{/* Berma derecha */}
<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 8]}>
  <planeGeometry args={[100, 6]} />
  <meshStandardMaterial color="#5C4A1E" roughness={1} />
</mesh>

{/* Berma izquierda */}
<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -8]}>
  <planeGeometry args={[100, 6]} />
  <meshStandardMaterial color="#5C4A1E" roughness={1} />
</mesh>

{/* Pasto/tierra al costado */}
<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 16]}>
  <planeGeometry args={[100, 20]} />
  <meshStandardMaterial color="#3D5A1E" roughness={1} />
</mesh>
```

### Iluminación por escena (aplicar individualmente):

**Escena 1 — Atardecer cálido:**
```tsx
<ambientLight intensity={0.35} color="#ffcc88" />
<directionalLight
  position={[-10, 8, -5]}
  intensity={1.8}
  color="#ff8844"
  castShadow
  shadow-mapSize={[2048, 2048]}
/>
<pointLight position={[-1.5, 1.5, -0.9]} color="#ffaa00" intensity={3} distance={6} />
```

**Escena 2 — Dorado oscureciendo:**
```tsx
<ambientLight intensity={0.25} color="#ff9944" />
<directionalLight position={[-15, 6, -8]} intensity={1.4} color="#ff6622" castShadow />
<pointLight position={[-1.5, 1.5, -0.9]} color="#ffcc00" intensity={4} distance={8} />
<fog attach="fog" args={['#1a0800', 20, 70]} />
```

**Escena 3 — Noche con sirenas:**
```tsx
<ambientLight intensity={0.08} color="#112244" />
<directionalLight position={[0, 10, 0]} intensity={0.3} color="#4466aa" />
<pointLight position={[-1.5, 1.5, -0.9]} color="#ffcc00" intensity={2} distance={5} />
<fog attach="fog" args={['#050510', 15, 50]} />
<Stars radius={60} depth={15} count={800} factor={4} />
```

Aplicar el patrón correcto a cada escena según su momento del día.

---

## TAREA 3 — Pantalla final rediseñada

La pantalla "Simulación Finalizada" actual es texto gris sobre negro ilegible.
Reemplazar completamente el contenido del componente de pantalla final.

```tsx
// Reemplazar el contenido de PantallaPuntaje.tsx (o como se llame)
// con este diseño mejorado:

'use client'
import { motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/simulatorStore'

const COLORES_ESCENA: Record<string, string> = {
  escena_1: '#f97316',   // naranja
  escena_2: '#eab308',   // amarillo
  escena_3: '#8b5cf6',   // violeta
  escena_4: '#3b82f6',   // azul
  escena_5: '#f43f5e',   // rosa
  escena_6: '#22c55e',   // verde
  fin_exitoso: '#22c55e',
  escena_F_A: '#ef4444',
  escena_F_B: '#ef4444',
  escena_F_C: '#ef4444',
}

const NOMBRES_ESCENA: Record<string, string> = {
  escena_1: 'Detección de la fuga',
  escena_2: 'Identificación y respuesta',
  escena_3: 'Espera y coordinación',
  escena_4: 'Llegada de autoridades',
  escena_5: 'Control del derrame',
  escena_6: 'Cierre y documentación',
  fin_exitoso: 'Simulación completada',
  escena_F_A: 'Fallo — Timeout de detección',
  escena_F_B: 'Fallo — Errores acumulados',
  escena_F_C: 'Fallo — Acción crítica',
}

export function PantallaPuntaje() {
  const { resultado, worldState, resetSimulador } = useSimulatorStore()

  const esFallo = resultado?.trigger_fallo !== null && resultado?.trigger_fallo !== undefined
  const camino = resultado?.camino_tomado ?? worldState.historial_escenas

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center
                    justify-center px-6 py-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-orange-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Simulación finalizada
        </p>
        <h1 className={`text-4xl font-bold mb-2 ${esFallo ? 'text-red-400' : 'text-white'}`}>
          {esFallo ? 'Protocolo incumplido' : 'Protocolo completado'}
        </h1>
        <p className="text-gray-400 text-sm">
          {esFallo
            ? 'Tu camino de decisiones derivó en un fallo catastrófico'
            : 'Completaste el simulador de emergencias DS 021-2008-MTC'}
        </p>
      </motion.div>

      {/* Camino de decisiones — visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl mb-10"
      >
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-4 text-center">
          Camino tomado
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {camino.map((escena, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className="px-3 py-2 rounded-lg text-xs font-medium border"
                style={{
                  borderColor: COLORES_ESCENA[escena] + '66',
                  color: COLORES_ESCENA[escena],
                  backgroundColor: COLORES_ESCENA[escena] + '11',
                }}
              >
                {NOMBRES_ESCENA[escena] ?? escena}
              </div>
              {i < camino.length - 1 && (
                <span className="text-gray-700 text-xs">→</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Métricas finales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-10"
      >
        {[
          {
            label: 'Líquido derramado',
            value: `${(worldState.fuga_pct * 100).toLocaleString()}L`,
            color: worldState.fuga_pct > 50 ? '#ef4444' : '#f97316'
          },
          {
            label: 'Errores críticos',
            value: `${worldState.errores_criticos} / 3`,
            color: worldState.errores_criticos >= 2 ? '#ef4444' : '#22c55e'
          },
          {
            label: 'Tiempo total',
            value: resultado
              ? `${Math.floor(resultado.tiempo_total_seg / 60)}m ${resultado.tiempo_total_seg % 60}s`
              : '--',
            color: '#94a3b8'
          },
        ].map((m, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{m.label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Botones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-4"
      >
        <button
          onClick={resetSimulador}
          className="px-8 py-4 bg-orange-500 hover:bg-orange-400
                     text-white font-bold rounded-xl text-base
                     transition-all duration-200 hover:scale-105"
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => { window.location.href = '/' }}
          className="px-8 py-4 bg-white/10 hover:bg-white/15
                     text-white font-bold rounded-xl text-base
                     border border-white/20 transition-all duration-200"
        >
          Volver al inicio
        </button>
      </motion.div>
    </div>
  )
}
```

---

## TAREA 4 — Ampliar pool de decisiones a 8 opciones por escena

Los pools actuales tienen 6 opciones. Con solo 6, eligiendo 2, hay alta
probabilidad de repetir combinaciones en runs consecutivos.

Añadir 2 opciones nuevas a cada JSON (escena1, escena2, escena3):

**escena1.json — añadir:**
```json
{
  "id": "e1_G",
  "texto_opcion": "Encender las luces de emergencia del camión y esperar",
  "nivel": "correcta",
  "nivel_error": null,
  "efecto_worldstate": { "fuga_pct_delta": 0 },
  "puntos": 10,
  "feedback_contextual": null,
  "trigger_escena": "escena_2",
  "objeto_3d_id": "cabina_motor"
},
{
  "id": "e1_H",
  "texto_opcion": "Tomar fotos del incidente para documentarlo antes de actuar",
  "nivel": "incorrecta_leve",
  "nivel_error": "leve",
  "efecto_worldstate": { "fuga_pct_delta": 6, "tiempo_perdido_seg": 40 },
  "puntos": 0,
  "feedback_contextual": "La documentación va después de la seguridad. La fuga creció mientras fotografiabas.",
  "trigger_escena": "escena_2",
  "objeto_3d_id": null
}
```

**escena2.json — añadir:**
```json
{
  "id": "e2_H",
  "texto_opcion": "Revisar el manual del vehículo para el procedimiento de emergencia",
  "nivel": "incorrecta_leve",
  "nivel_error": "leve",
  "efecto_worldstate": { "fuga_pct_delta": 10, "tiempo_perdido_seg": 60 },
  "puntos": 0,
  "feedback_contextual": "El protocolo de emergencia debe memorizarse antes del viaje, no consultarse durante el incidente.",
  "trigger_escena": "escena_3",
  "objeto_3d_id": null
},
{
  "id": "e2_I",
  "texto_opcion": "Pedir ayuda a conductores que pasan para que llamen al 116",
  "nivel": "correcta",
  "nivel_error": null,
  "efecto_worldstate": { "llamo_116": true },
  "puntos": 10,
  "feedback_contextual": null,
  "trigger_escena": "escena_3",
  "objeto_3d_id": null
}
```

**escena3.json — añadir:**
```json
{
  "id": "e3_H",
  "texto_opcion": "Contactar a la empresa para informar antes de que lleguen los medios",
  "nivel": "correcta",
  "nivel_error": null,
  "efecto_worldstate": {},
  "puntos": 8,
  "feedback_contextual": null,
  "trigger_escena": "fin_exitoso",
  "objeto_3d_id": null
},
{
  "id": "e3_I",
  "texto_opcion": "Mover el camión a un lugar más seguro antes de que lleguen bomberos",
  "nivel": "incorrecta_grave",
  "nivel_error": "grave",
  "efecto_worldstate": { "fuga_pct_delta": 30, "errores_criticos_delta": 1 },
  "puntos": -20,
  "feedback_contextual": null,
  "trigger_escena": "escena_F_C",
  "objeto_3d_id": null
}
```

---

## TAREA 5 — Sonido con Web Audio API (sin librerías)

Añadir audio ambiental y de feedback usando Web Audio API nativa.
Sin instalar nada nuevo.

Crea `lib/audioManager.ts`:

```typescript
// lib/audioManager.ts
// Web Audio API nativa — sin dependencias

class AudioManager {
  private ctx: AudioContext | null = null
  private sirenInterval: ReturnType<typeof setInterval> | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  // Sonido de click en objeto 3D
  playClick() {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  }

  // Tono de alerta para error leve (aparece con el toast)
  playWarning() {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, ctx.currentTime)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  }

  // Tono grave para error grave / EscenaF
  playDanger() {
    const ctx = this.getCtx()
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.setValueAtTime(110, ctx.currentTime + i * 0.25)
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.2)
      osc.start(ctx.currentTime + i * 0.25)
      osc.stop(ctx.currentTime + i * 0.25 + 0.2)
    }
  }

  // Sonido de transición entre escenas
  playTransition() {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(330, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  }

  // Sonido de éxito al completar
  playSuccess() {
    const ctx = this.getCtx()
    const notas = [523, 659, 784, 1047]
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.3)
    })
  }
}

export const audioManager = new AudioManager()
```

Integrar en el store — añadir calls de audio en `elegirDecision`:
```typescript
import { audioManager } from '@/lib/audioManager'

// En elegirDecision:
if (decision.nivel_error === 'leve') {
  audioManager.playWarning()
} else if (decision.nivel_error === 'grave') {
  audioManager.playDanger()
} else {
  audioManager.playClick()
}

// Al navegar a nueva escena (en cerrarFeedbackToast o navegarAEscena):
audioManager.playTransition()

// Al llegar a fin_exitoso:
audioManager.playSuccess()
```

---

## TAREA 6 — Verificación y navegación autónoma

Después de las 5 tareas, navega localhost:3000 y verifica:

1. Escena 1: materiales del camión más metálicos, suelo oscuro de asfalto
2. Toma una decisión incorrecta leve: el toast debe ser corto (máx 2 líneas)
3. Completa el flujo hasta fin_exitoso: la pantalla final debe verse clara y legible
4. Los botones "Intentar de nuevo" y "Volver al inicio" deben ser visibles
5. Reinicia: las opciones deben cambiar
6. Verifica que no hay errores en consola del browser
7. Verifica que se escuchan los sonidos al hacer decisiones

Documenta en consola del servidor qué encontraste y qué corregiste.

## TAREA 7 — Actualizar AGENTS.md

Al terminar todo, actualiza AGENTS.md reflejando:
- Pool de 8 opciones por escena
- audioManager.ts añadido en lib/
- Pantalla final rediseñada
- Materiales y iluminación mejorados por escena
- Feedback máximo 2 líneas — regla documentada para futuros JSON
