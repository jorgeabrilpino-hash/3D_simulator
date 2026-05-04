# Skill: Gas Particle System
## Descripción
Construye sistemas de partículas 3D para simular fugas de gas y vapores
químicos en ChemSim Perú usando React Three Fiber. Implementa efectos
visuales diferenciados por clase ONU: gas naranja (Clase 3 inflamable),
vapor blanco (Clase 2 GLP), nube verde-amarilla (Clase 6.1 tóxico),
niebla corrosiva (Clase 8). Optimizado para funcionar a 60fps en mobile.

## Cuándo usar esta skill
- Al crear o modificar `src/components/scene/shared/GasParticles.tsx`
- Cuando el prompt mencione: "partículas", "fuga visible", "gas", "vapor", "efecto visual", "humo"
- Al configurar el tipo de fuga según la clase ONU del escenario
- Al animar la dirección del viento en la escena

## Instrucciones para el agente

### PASO 1 — Componente base de partículas

```tsx
// src/components/scene/shared/GasParticles.tsx
'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GasParticlesProps {
  position: [number, number, number]
  claseONU: 2 | 3 | 6 | 8          // clase ONU determina color y comportamiento
  intensidad?: 'baja' | 'media' | 'alta'
  direccionViento?: [number, number, number]
  activo?: boolean
}

// Configuración por clase ONU
const CONFIG_CLASES = {
  2: { color: '#ffffff', opacidadMax: 0.6, velocidad: 0.015, spread: 0.8 },  // GLP - blanco
  3: { color: '#ff6600', opacidadMax: 0.5, velocidad: 0.012, spread: 0.6 },  // Inflamable - naranja
  6: { color: '#aaff00', opacidadMax: 0.7, velocidad: 0.008, spread: 0.4 },  // Tóxico - verde
  8: { color: '#ffff00', opacidadMax: 0.5, velocidad: 0.010, spread: 0.5 },  // Corrosivo - amarillo
}

const CONTEOS_INTENSIDAD = { baja: 150, media: 300, alta: 500 }

export function GasParticles({
  position,
  claseONU,
  intensidad = 'media',
  direccionViento = [1, 0, 0],
  activo = true
}: GasParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const config = CONFIG_CLASES[claseONU]
  const count = CONTEOS_INTENSIDAD[intensidad]

  // Generar posiciones iniciales — solo una vez con useMemo
  const { positions, velocities, opacities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const opacities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Posición inicial: spray desde el punto de fuga
      positions[i * 3]     = (Math.random() - 0.5) * 0.3
      positions[i * 3 + 1] = Math.random() * 0.2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      // Velocidad base + dirección del viento
      velocities[i * 3]     = direccionViento[0] * config.velocidad + (Math.random() - 0.5) * 0.005
      velocities[i * 3 + 1] = config.velocidad * (0.5 + Math.random() * 0.5)  // sube
      velocities[i * 3 + 2] = direccionViento[2] * config.velocidad + (Math.random() - 0.5) * 0.005

      opacities[i] = Math.random()
    }

    return { positions, velocities, opacities }
  }, [count, config.velocidad, direccionViento])

  // Geometría con buffer attributes
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return geo
  }, [positions])

  // Animación frame-by-frame
  useFrame(() => {
    if (!pointsRef.current || !activo) return
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      posArray[i * 3]     += velocities[i * 3]
      posArray[i * 3 + 1] += velocities[i * 3 + 1]
      posArray[i * 3 + 2] += velocities[i * 3 + 2]

      // Dispersión: agrandar spread con la altura
      const altura = posArray[i * 3 + 1]
      if (altura > config.spread * 3) {
        // Reset: volver al punto de origen
        posArray[i * 3]     = (Math.random() - 0.5) * 0.3
        posArray[i * 3 + 1] = Math.random() * 0.2
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.3
      }
    }
    posAttr.needsUpdate = true
  })

  if (!activo) return null

  return (
    <points ref={pointsRef} position={position} geometry={geometry}>
      <pointsMaterial
        color={config.color}
        size={0.04}
        transparent
        opacity={config.opacidadMax}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
```

### PASO 2 — Indicador de dirección de viento

```tsx
// src/components/scene/shared/IndicadorViento.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface IndicadorVientoProps {
  position: [number, number, number]
  direccion: number  // ángulo en grados desde norte
  isInteractable?: boolean
  onSelect?: () => void
}

export function IndicadorViento({ position, direccion, isInteractable, onSelect }: IndicadorVientoProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Animación suave de la bandera
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 +
                                   THREE.MathUtils.degToRad(direccion)
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Mástil */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* Bandera */}
      <mesh position={[0.15, 0.9, 0]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#ff4444" side={THREE.DoubleSide} />
      </mesh>
      {isInteractable && (
        <Html center position={[0, 1.2, 0]} distanceFactor={6}>
          <button
            onClick={onSelect}
            className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
          >
            Dirección del viento
          </button>
        </Html>
      )}
    </group>
  )
}
```

### PASO 3 — Integración con escena
```tsx
// Dentro de Scene1A.tsx, usando el estado para mostrar partículas
const { currentStep } = useSimulatorStore()

// Las partículas siempre visibles (la fuga ya ocurrió)
<GasParticles
  position={[-1.5, 0.8, 0]}
  claseONU={3}
  intensidad="media"
  direccionViento={[1, 0.2, 0]}
  activo={true}
/>

<IndicadorViento
  position={[3, 0, 2]}
  direccion={45}
  isInteractable={currentStep === 4}  // solo interactable en paso 5
  onSelect={() => selectObject('indicador-viento')}
/>
```

## Ejemplo de uso aplicado al proyecto
- Modo 1A (Clase 3 - gasolina): `claseONU={3}` → partículas naranjas de la válvula lateral del camión
- Modo 1B (Clase 2 - GLP): `claseONU={2}` → vapor blanco denso desde manguera de carga
- Modo 2A (Clase 8 - corrosivo): `claseONU={8}` → niebla amarilla alrededor del tanque estático
- Modo 2B (multi-clase): múltiples instancias de GasParticles con intensidad='alta'

## Restricciones
- NUNCA usar más de 500 partículas por escena (performance en mobile)
- NUNCA usar `THREE.AdditiveBlending` con más de 2 sistemas simultáneos (artifacts visuales)
- NO modificar `positions` directamente desde fuera del componente
- La dirección del viento en la escena y en `GasParticles` DEBEN ser consistentes
- En mobile: reducir automáticamente count al 40% detectando `window.innerWidth < 768`
