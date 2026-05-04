"use client"

import type React from "react"
import { useRef, useMemo, useState, useCallback } from "react"
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Sky, Text } from "@react-three/drei"
import * as THREE from "three"

type ObjectId = "triangulos" | "telefono" | "indicador-viento" | "valvula" | "extintor"

interface Scene1AProps {
  onObjectClick?: (id: string) => void
  activeObjectId?: string | null
  disabled?: boolean
}

type SceneInteractionProps = Pick<Scene1AProps, "onObjectClick" | "activeObjectId" | "disabled">

interface InteractiveProps {
  id: ObjectId
  onObjectClick?: (id: string) => void
  activeObjectId?: string | null
  disabled?: boolean
  children: (hovered: boolean) => React.ReactNode
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * Wraps a 3D object so it reports hover state and clicks back to the parent.
 * The hovered flag is passed to the render-prop so each child can apply
 * its own emissive highlight (orange) where it makes sense.
 */
function Interactive({ id, onObjectClick, activeObjectId, disabled, children, position, rotation }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  const isActive = !disabled && (activeObjectId === undefined || activeObjectId === id)

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!isActive) return
    setHovered(true)
    document.body.style.cursor = "pointer"
  }, [isActive])

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = "auto"
  }, [])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (isActive) onObjectClick?.(id)
    },
    [id, isActive, onObjectClick],
  )

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children(hovered && isActive)}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*                              ENVIRONMENT                                   */
/* -------------------------------------------------------------------------- */

function Mountains() {
  // Generate a few mountain peaks using cone geometry so we don't hand-roll SVG/landscape data.
  const peaks = useMemo(
    () => [
      { pos: [-25, 4, -30] as [number, number, number], scale: [12, 14, 12] as [number, number, number] },
      { pos: [-10, 5, -38] as [number, number, number], scale: [14, 18, 14] as [number, number, number] },
      { pos: [8, 6, -36] as [number, number, number], scale: [16, 20, 16] as [number, number, number] },
      { pos: [25, 4, -32] as [number, number, number], scale: [13, 15, 13] as [number, number, number] },
      { pos: [38, 3, -28] as [number, number, number], scale: [11, 12, 11] as [number, number, number] },
      { pos: [-35, 3, -25] as [number, number, number], scale: [10, 11, 10] as [number, number, number] },
    ],
    [],
  )

  return (
    <group>
      {peaks.map((peak, i) => (
        <mesh key={i} position={peak.pos} scale={peak.scale} castShadow receiveShadow>
          <coneGeometry args={[1, 1, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#8a6a4a" : "#6b4f3a"} flatShading roughness={1} />
        </mesh>
      ))}
      {/* Snow caps on the tallest peaks */}
      {peaks
        .filter((p) => p.scale[1] > 14)
        .map((peak, i) => (
          <mesh
            key={`cap-${i}`}
            position={[peak.pos[0], peak.pos[1] + peak.scale[1] * 0.35, peak.pos[2]]}
            scale={[peak.scale[0] * 0.45, peak.scale[1] * 0.25, peak.scale[2] * 0.45]}
          >
            <coneGeometry args={[1, 1, 6]} />
            <meshStandardMaterial color="#f5e9d8" flatShading roughness={1} />
          </mesh>
        ))}
    </group>
  )
}

function Road() {
  return (
    <group>
      {/* Ground / cliff side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#7a5a3e" roughness={1} />
      </mesh>

      {/* Asphalt road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial color="#2b2b2e" roughness={0.9} />
      </mesh>

      {/* Center dashed line */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -50 + i * 5]}>
          <planeGeometry args={[0.2, 1.5]} />
          <meshBasicMaterial color="#f3d76b" />
        </mesh>
      ))}

      {/* Road shoulder lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.9, 0.01, 0]}>
        <planeGeometry args={[0.15, 200]} />
        <meshBasicMaterial color="#f5f5f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.9, 0.01, 0]}>
        <planeGeometry args={[0.15, 200]} />
        <meshBasicMaterial color="#f5f5f0" />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*                                TANKER TRUCK                                */
/* -------------------------------------------------------------------------- */

function TankerTruck() {
  return (
    <group position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Cab */}
      <mesh position={[3.5, 1.6, 0]} castShadow>
        <boxGeometry args={[2.2, 2.2, 2.4]} />
        <meshStandardMaterial color="#c43a2c" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Cab windshield */}
      <mesh position={[4.55, 2, 0]} castShadow>
        <boxGeometry args={[0.15, 1.1, 2.0]} />
        <meshStandardMaterial color="#1a2e3a" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Chassis between cab and tank */}
      <mesh position={[1.8, 1.0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* Tank cylinder */}
      <mesh position={[-1.2, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 5.5, 32]} />
        <meshStandardMaterial color="#dadcd8" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Tank end caps */}
      <mesh position={[-3.95, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <sphereGeometry args={[1.3, 24, 16]} />
        <meshStandardMaterial color="#c8cac6" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[1.55, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <sphereGeometry args={[1.3, 24, 16]} />
        <meshStandardMaterial color="#c8cac6" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Hazard band */}
      <mesh position={[-1.2, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.31, 1.31, 0.6, 32]} />
        <meshStandardMaterial color="#e87a1f" emissive="#e87a1f" emissiveIntensity={0.15} />
      </mesh>

      {/* Hazard diamond placard */}
      <mesh position={[-1.2, 1.8, 1.31]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshStandardMaterial color="#f0c419" />
      </mesh>

      {/* Wheels */}
      {[
        [3.3, 0.5, 1.25],
        [3.3, 0.5, -1.25],
        [0.2, 0.5, 1.25],
        [0.2, 0.5, -1.25],
        [-2.4, 0.5, 1.25],
        [-2.4, 0.5, -1.25],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh position={[4.61, 1.4, 0.7]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#fff5c2" emissive="#fff0a8" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[4.61, 1.4, -0.7]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#fff5c2" emissive="#fff0a8" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*                              GAS PARTICLES                                 */
/* -------------------------------------------------------------------------- */

interface GasLeakProps {
  origin: [number, number, number]
  count?: number
}

function GasLeak({ origin, count = 400 }: GasLeakProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // Initial buffers
  const { positions, velocities, lifetimes, maxLife } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifetimes = new Float32Array(count)
    const maxLife = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = origin[0]
      positions[i * 3 + 1] = origin[1]
      positions[i * 3 + 2] = origin[2]

      // Emit roughly toward +X (the leaking side) plus rising drift
      velocities[i * 3 + 0] = 0.6 + Math.random() * 0.6
      velocities[i * 3 + 1] = 0.3 + Math.random() * 0.5
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.6

      const life = 1.5 + Math.random() * 2.0
      lifetimes[i] = Math.random() * life
      maxLife[i] = life
    }
    return { positions, velocities, lifetimes, maxLife }
  }, [count, origin])

  // Soft circular sprite texture so points look like gas puffs, not squares
  const spriteTexture = useMemo(() => {
    const size = 64
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, "rgba(255,180,80,1)")
    grad.addColorStop(0.4, "rgba(230,120,40,0.6)")
    grad.addColorStop(1, "rgba(120,60,20,0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])

  useFrame((_, delta) => {
    const points = pointsRef.current
    if (!points) return
    const posAttr = points.geometry.getAttribute("position") as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      lifetimes[i] += delta
      if (lifetimes[i] >= maxLife[i]) {
        // Respawn at the leak origin
        lifetimes[i] = 0
        arr[i * 3 + 0] = origin[0]
        arr[i * 3 + 1] = origin[1]
        arr[i * 3 + 2] = origin[2]
        velocities[i * 3 + 0] = 0.6 + Math.random() * 0.6
        velocities[i * 3 + 1] = 0.3 + Math.random() * 0.5
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.6
      } else {
        arr[i * 3 + 0] += velocities[i * 3 + 0] * delta
        arr[i * 3 + 1] += velocities[i * 3 + 1] * delta
        arr[i * 3 + 2] += velocities[i * 3 + 2] * delta
        // Wind drift + buoyancy
        velocities[i * 3 + 0] += delta * 0.1
        velocities[i * 3 + 1] += delta * 0.15
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.45}
        map={spriteTexture}
        color="#ff8a3c"
        transparent
        opacity={0.7}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* -------------------------------------------------------------------------- */
/*                            CLICKABLE OBJECTS                               */
/* -------------------------------------------------------------------------- */

const HIGHLIGHT = "#ff7a1a"

function SafetyTriangles({ onObjectClick, activeObjectId, disabled }: SceneInteractionProps) {
  return (
    <Interactive
      id="triangulos"
      onObjectClick={onObjectClick}
      activeObjectId={activeObjectId}
      disabled={disabled}
    >
      {(hovered) => (
        <group>
          {[
            [-1.5, 0, 4] as [number, number, number],
            [1.5, 0, 6] as [number, number, number],
          ].map((pos, i) => (
            <group key={i} position={pos}>
              {/* Triangle base stand */}
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.6, 0.08, 0.15]} />
                <meshStandardMaterial color="#222" />
              </mesh>
              {/* Triangle face */}
              <mesh position={[0, 0.55, 0]}>
                <cylinderGeometry args={[0.55, 0.55, 0.05, 3]} />
                <meshStandardMaterial
                  color="#e02828"
                  emissive={hovered ? HIGHLIGHT : "#a31818"}
                  emissiveIntensity={hovered ? 1.2 : 0.4}
                />
              </mesh>
              {/* Inner reflective triangle */}
              <mesh position={[0, 0.55, 0.03]}>
                <cylinderGeometry args={[0.32, 0.32, 0.02, 3]} />
                <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </Interactive>
  )
}

function Phone({ onObjectClick, activeObjectId, disabled }: SceneInteractionProps) {
  return (
    <Interactive
      id="telefono"
      onObjectClick={onObjectClick}
      activeObjectId={activeObjectId}
      disabled={disabled}
      position={[-3, 0.9, 3]}
      rotation={[0, 0.4, 0]}
    >
      {(hovered) => (
        <group>
          {/* Phone body */}
          <mesh castShadow>
            <boxGeometry args={[0.55, 1.05, 0.08]} />
            <meshStandardMaterial
              color="#1a1a1a"
              emissive={hovered ? HIGHLIGHT : "#000000"}
              emissiveIntensity={hovered ? 0.7 : 0}
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.48, 0.95]} />
            <meshStandardMaterial color="#0e1a2e" emissive="#0e1a2e" emissiveIntensity={0.6} />
          </mesh>
          {/* Emergency number */}
          <Text
            position={[0, 0.05, 0.05]}
            fontSize={0.28}
            color="#ff3b30"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.005}
            outlineColor="#ffffff"
          >
            116
          </Text>
          <Text position={[0, -0.25, 0.05]} fontSize={0.07} color="#ffffff" anchorX="center" anchorY="middle">
            EMERGENCIA
          </Text>
        </group>
      )}
    </Interactive>
  )
}

function WindIndicator({ onObjectClick, activeObjectId, disabled }: SceneInteractionProps) {
  const flagRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (flagRef.current) {
      // Subtle flag wave
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })

  return (
    <Interactive
      id="indicador-viento"
      onObjectClick={onObjectClick}
      activeObjectId={activeObjectId}
      disabled={disabled}
      position={[-4.5, 0, -2]}
    >
      {(hovered) => (
        <group>
          {/* Pole */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Pole base */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 12]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          {/* Windsock cone (orange/white stripes simulated with two cones) */}
          <mesh ref={flagRef} position={[0.6, 2.7, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.18, 1.0, 16, 1, true]} />
            <meshStandardMaterial
              color="#ff7a1a"
              emissive={hovered ? HIGHLIGHT : "#ff7a1a"}
              emissiveIntensity={hovered ? 1.0 : 0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* White stripe near tip */}
          <mesh position={[1.0, 2.7, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.05, 0.18, 16, 1, true]} />
            <meshStandardMaterial color="#f5f5f0" side={THREE.DoubleSide} />
          </mesh>
          {/* Small directional arrow on top */}
          <mesh position={[0, 3.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.25, 8]} />
            <meshStandardMaterial color="#e02828" emissive="#a31818" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
    </Interactive>
  )
}

function Valve({ onObjectClick, activeObjectId, disabled }: SceneInteractionProps) {
  // The valve sits on the side of the tank facing +X (toward the road shoulder area)
  const valvePos: [number, number, number] = [3.8, 1.4, 0]

  return (
    <Interactive
      id="valvula"
      onObjectClick={onObjectClick}
      activeObjectId={activeObjectId}
      disabled={disabled}
      position={valvePos}
    >
      {(hovered) => (
        <group>
          {/* Warning glow halo */}
          <mesh>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshBasicMaterial color={hovered ? "#ffae5c" : "#ff7a1a"} transparent opacity={0.18} />
          </mesh>
          {/* Valve flange against the tank */}
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Pipe stub */}
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Valve body */}
          <mesh position={[0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshStandardMaterial
              color="#c43a2c"
              emissive={hovered ? HIGHLIGHT : "#ff5a1a"}
              emissiveIntensity={hovered ? 1.4 : 0.6}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Valve handwheel */}
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.18, 0.03, 8, 24]} />
            <meshStandardMaterial color="#e02828" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Spokes */}
          {[0, Math.PI / 2].map((r, i) => (
            <mesh key={i} position={[0.5, 0, 0]} rotation={[r, 0, Math.PI / 2]}>
              <boxGeometry args={[0.03, 0.36, 0.03]} />
              <meshStandardMaterial color="#e02828" />
            </mesh>
          ))}
          {/* Point light to sell the warning glow */}
          <pointLight color="#ff7a1a" intensity={hovered ? 3 : 1.5} distance={4} decay={2} />
        </group>
      )}
    </Interactive>
  )
}

function FireExtinguisher({ onObjectClick, activeObjectId, disabled }: SceneInteractionProps) {
  return (
    <Interactive
      id="extintor"
      onObjectClick={onObjectClick}
      activeObjectId={activeObjectId}
      disabled={disabled}
      position={[-3, 0, -0.5]}
    >
      {(hovered) => (
        <group>
          {/* Main red cylinder body */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 1.0, 24]} />
            <meshStandardMaterial
              color="#c4231a"
              emissive={hovered ? HIGHLIGHT : "#5a0e08"}
              emissiveIntensity={hovered ? 1.2 : 0.25}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          {/* Bottom rim */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.08, 24]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Top dome */}
          <mesh position={[0, 1.08, 0]}>
            <sphereGeometry args={[0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#c4231a" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 1.18, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 1.28, 0]}>
            <boxGeometry args={[0.28, 0.06, 0.1]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Pressure gauge */}
          <mesh position={[0.18, 1.22, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
            <meshStandardMaterial color="#dcdcdc" />
          </mesh>
          {/* Hose */}
          <mesh position={[-0.18, 1.0, 0]} rotation={[0, 0, 0.6]}>
            <torusGeometry args={[0.18, 0.025, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Nozzle */}
          <mesh position={[-0.36, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.15, 12]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* White label */}
          <mesh position={[0, 0.55, 0.221]}>
            <planeGeometry args={[0.28, 0.35]} />
            <meshStandardMaterial color="#f5f5f0" />
          </mesh>
          <Text position={[0, 0.55, 0.222]} fontSize={0.08} color="#c4231a" anchorX="center" anchorY="middle">
            ABC
          </Text>
        </group>
      )}
    </Interactive>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  SCENE                                     */
/* -------------------------------------------------------------------------- */

function SceneContents({ onObjectClick, activeObjectId, disabled }: Scene1AProps) {
  return (
    <>
      {/* Sunset sky */}
      <Sky
        distance={450000}
        sunPosition={[-10, 1.5, -20]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={8}
        rayleigh={4}
        mieCoefficient={0.012}
        mieDirectionalG={0.85}
      />

      {/* Lighting (no shadows - keeps GPU load low and avoids context loss) */}
      <ambientLight intensity={0.5} color="#ffd1a3" />
      <directionalLight position={[-15, 8, -10]} intensity={1.4} color="#ffb072" />
      <hemisphereLight args={["#ffb27a", "#3a2a1a", 0.5]} />

      {/* Static environment */}
      <Mountains />
      <Road />
      <TankerTruck />

      {/* Particle gas leak originates at the valve position */}
      <GasLeak origin={[3.95, 1.4, 0]} count={180} />

      {/* Clickable objects */}
      <SafetyTriangles
        onObjectClick={onObjectClick}
        activeObjectId={activeObjectId}
        disabled={disabled}
      />
      <Phone onObjectClick={onObjectClick} activeObjectId={activeObjectId} disabled={disabled} />
      <WindIndicator
        onObjectClick={onObjectClick}
        activeObjectId={activeObjectId}
        disabled={disabled}
      />
      <Valve onObjectClick={onObjectClick} activeObjectId={activeObjectId} disabled={disabled} />
      <FireExtinguisher
        onObjectClick={onObjectClick}
        activeObjectId={activeObjectId}
        disabled={disabled}
      />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.5, 0]}
      />

      {/* Subtle distance fog blends mountains into sunset */}
      <fog attach="fog" args={["#d98a4a", 25, 80]} />
    </>
  )
}

export default function Scene1A({ onObjectClick, activeObjectId, disabled }: Scene1AProps) {
  const handleCreated = useCallback((state: { gl: THREE.WebGLRenderer }) => {
    const canvas = state.gl.domElement
    const handleLost = (e: Event) => {
      e.preventDefault()
      console.log("[v0] WebGL context lost - will attempt restore")
    }
    const handleRestored = () => {
      console.log("[v0] WebGL context restored")
    }
    canvas.addEventListener("webglcontextlost", handleLost as EventListener, false)
    canvas.addEventListener("webglcontextrestored", handleRestored as EventListener, false)
  }, [])

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [9, 4.5, 9], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={handleCreated}
      >
        <SceneContents
          onObjectClick={onObjectClick}
          activeObjectId={activeObjectId}
          disabled={disabled}
        />
      </Canvas>
    </div>
  )
}
