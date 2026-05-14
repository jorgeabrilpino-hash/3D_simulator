'use client'

import { OrbitControls, Sky } from '@react-three/drei'
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
      <directionalLight position={[10, 15, 8]} intensity={2} color="#fff5e0" castShadow />
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

function CleanZone({ fugaPct }: { fugaPct: number }) {
  return (
    <group>
      <mesh position={[1.7, 0.025, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.18, fugaPct * 0.0035), 24]} />
        <meshStandardMaterial color="#aadd00" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[1.7, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.55, 48]} />
        <meshStandardMaterial color="#22c55e" emissive="#166534" emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function CloseSign() {
  return (
    <group position={[-3.2, 0.2, -2.5]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.08, 1.1, 0.08]} />
        <meshStandardMaterial color="#374151" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[1.3, 0.55, 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.25, 0.05]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.02]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  )
}

export function Escena6Contenido() {
  const worldState = useSimulatorStore((state) => state.worldState)

  return (
    <>
      <DayLighting />
      <Road />
      <CamionCisterna fugaPct={0} mostrarFuga={false} />
      <CleanZone fugaPct={worldState.fuga_pct} />
      <CloseSign />
      <OrbitControls enablePan={false} minDistance={6} maxDistance={24} target={[0, 0.8, 0]} />
    </>
  )
}

export default function Scene6() {
  return (
    <SceneWrapper>
      <Escena6Contenido />
    </SceneWrapper>
  )
}
