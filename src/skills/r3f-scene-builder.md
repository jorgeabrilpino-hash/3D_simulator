# Skill: R3F Scene Builder
## Descripción
Construye escenas 3D completas con React Three Fiber (@react-three/fiber) y Drei
para el simulador ChemSim Perú. Incluye iluminación, geometría, interactividad
y efectos visuales usando el stack: Next.js 14 + R3F 8.x + Drei 9.x + TypeScript.

## Cuándo usar esta skill
- Cuando el prompt menciona: "crear escena", "Scene3D", "componente 3D", "Canvas"
- Al construir cualquier archivo dentro de `src/components/scene/`
- Al añadir objetos interactivos 3D (camión, tanque, válvulas, EPP)
- Al configurar iluminación, cámara o entorno de una escena
- Al conectar una escena 3D con el estado de Zustand del simulador

## Instrucciones para el agente

### PASO 1 — Estructura base de toda escena
Cada escena DEBE tener este esqueleto exacto:

```tsx
// src/components/scene/ModoXX/SceneXX.tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Sky } from '@react-three/drei'
import { Suspense } from 'react'
import { useSimulatorStore } from '@/store/simulatorStore'

export default function SceneXX() {
  const { currentStep, isLocked } = useSimulatorStore()

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Iluminación */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />

          {/* Entorno */}
          <Sky sunPosition={[100, 20, 100]} />
          <fog attach="fog" args={['#c9d5e8', 30, 100]} />

          {/* Suelo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>

          {/* Objetos de la escena */}
          {/* ... componentes específicos del modo ... */}

          {/* Controles */}
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* UI overlay 2D — fuera del Canvas */}
      {/* PanelDecision, FeedbackNormativo, etc. */}
    </div>
  )
}
```

### PASO 2 — Objetos interactivos (patrón obligatorio)
Todo objeto clickable DEBE usar este patrón:

```tsx
// src/components/scene/shared/ObjetoClickable.tsx
import { useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'

interface ObjetoClickableProps {
  position: [number, number, number]
  objetoId: string
  label: string
  isActive: boolean
  onSelect: (id: string) => void
  children: React.ReactNode
}

export function ObjetoClickable({
  position, objetoId, label, isActive, onSelect, children
}: ObjetoClickableProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (isActive) onSelect(objetoId)
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      {hovered && isActive && (
        <Html center distanceFactor={8}>
          <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded
                          font-bold whitespace-nowrap pointer-events-none">
            {label}
          </div>
        </Html>
      )}
      {/* Indicador visual de seleccionable */}
      {isActive && (
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={hovered ? '#ff6600' : '#ffcc00'}
                             transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
```

### PASO 3 — Iluminación por tipo de escena
- **Modo 1A (carretera andina, atardecer):** Sky sunPosition={[50, 5, 50]}, luz cálida
- **Modo 1B (terminal de carga, día):** HDR environment="warehouse", luz neutra
- **Modo 2A (planta, interior):** pointLights distribuidas, sin Sky
- **Modo 2B (emergencia, noche):** AmbientLight baja + spotlights de emergencia rojos

### PASO 4 — Conexión con Zustand (obligatorio)
```tsx
// SIEMPRE leer el estado así, nunca props drilling:
const { currentStep, selectObject, lockScene } = useSimulatorStore()

// Al registrar una decisión:
onSelect={(id) => selectObject(id, stepIndex)}
```

### PASO 5 — Performance (reglas obligatorias)
- Usar `useMemo` para geometrías que no cambian
- No crear materiales inline dentro del render (definirlos fuera)
- Máximo 3 luces dinámicas por escena
- Texturas: máximo 1024x1024px, formato .webp
- Modelos GLB: máximo 2MB por archivo

## Ejemplo de uso aplicado al proyecto
Para construir `Scene1A.tsx` (camión en carretera andina):
1. Usar esqueleto base del PASO 1
2. Añadir `<CamionCisterna position={[0, 0, 0]} />` con geometría básica BoxGeometry simulando el camión hasta tener el .glb
3. Añadir 5 `<ObjetoClickable>` con IDs: 'triangulos', 'telefono', 'indicador-viento', 'valvula', 'extintor'
4. Añadir `<GasParticles position={[-1.5, 0.8, 0]} />` en la válvula lateral
5. Conectar cada click a `selectObject()` del store

## Restricciones
- NUNCA usar `useFrame` para lógica de negocio (solo animaciones visuales)
- NUNCA colocar lógica de decisiones normativas dentro de componentes 3D
- NUNCA usar `drei/Html` para los paneles principales de UI (solo tooltips)
- NO importar Three.js directamente si existe equivalente en Drei
- Los componentes de escena NO deben tener más de 200 líneas; dividir en sub-componentes
