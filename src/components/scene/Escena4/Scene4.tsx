'use client'

import { useRef } from 'react'

import { OrbitControls, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { SceneWrapper } from '@/components/scene/SceneWrapper'
import { CamionCisterna } from '@/components/scene/shared/CamionCisterna'
import { useSimulatorStore } from '@/store/simulatorStore'

function DayLighting() {
  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <Sky sunPosition={[100, 40, 10]} turbidity={2} rayleigh={0.5} />
      <fog attach="fog" args={['#87ceeb', 60, 200]} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={2}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-8, 8, -5]} intensity={0.8} color="#c8e0ff" />
    </>
  )
}

function Road() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>
      {[-12, -4, 4, 12].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[40, 0.15]} />
          <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 8]}>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial color="#6b8e3e" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -8]}>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial color="#6b8e3e" roughness={1} />
      </mesh>
    </group>
  )
}

function EmergencyLights() {
  const redRef = useRef<THREE.Mesh>(null)
  const blueRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const redOn = Math.sin(state.clock.elapsedTime * 8) > 0
    if (redRef.current) redRef.current.visible = redOn
    if (blueRef.current) blueRef.current.visible = !redOn
  })

  return (
    <group position={[0, 1.02, 0]}>
      <mesh ref={redRef} position={[-0.45, 0, -0.8]}>
        <boxGeometry args={[0.28, 0.16, 0.18]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={blueRef} position={[0.45, 0, -0.8]}>
        <boxGeometry args={[0.28, 0.16, 0.18]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

function FireTruck({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <group position={[0, 0.2, -18]}>
      <mesh castShadow>
        <boxGeometry args={[3, 1.5, 1.5]} />
        <meshStandardMaterial color="#d71920" metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh position={[1.2, 0.2, 0.55]} castShadow>
        <boxGeometry args={[0.7, 0.55, 0.18]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.65} roughness={0.05} />
      </mesh>
      <EmergencyLights />
    </group>
  )
}

function Firefighter() {
  return (
    <group position={[-2.4, 0.05, -4.2]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.6, 18]} />
        <meshStandardMaterial color="#facc15" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.24, 18, 12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.45} />
      </mesh>
    </group>
  )
}

function SafetyCones() {
  return (
    <group>
      {[
        [-3, 0.28, 3],
        [3, 0.28, 3],
        [-3, 0.28, -3],
        [3, 0.28, -3],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <coneGeometry args={[0.25, 0.55, 18]} />
          <meshStandardMaterial color="#f97316" emissive="#7c2d12" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function Escena4Contenido() {
  const worldState = useSimulatorStore((state) => state.worldState)

  return (
    <>
      <DayLighting />
      <Road />
      <CamionCisterna fugaPct={worldState.fuga_pct} />
      <FireTruck visible={worldState.llamo_116} />
      <Firefighter />
      <SafetyCones />
      <OrbitControls enablePan={false} minDistance={6} maxDistance={24} target={[0, 0.8, -2]} />
    </>
  )
}

export default function Scene4() {
  return (
    <SceneWrapper>
      <Escena4Contenido />
    </SceneWrapper>
  )
}
