'use client'

import { OrbitControls, Sky } from '@react-three/drei'

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

function FireTruck() {
  return (
    <group position={[0, 0.2, -18]}>
      <mesh castShadow>
        <boxGeometry args={[3, 1.5, 1.5]} />
        <meshStandardMaterial color="#d71920" metalness={0.25} roughness={0.5} />
      </mesh>
    </group>
  )
}

function DangerTape() {
  const posts = [
    [-4, 0.55, -4],
    [4, 0.55, -4],
    [4, 0.55, 4],
    [-4, 0.55, 4],
  ] as const

  return (
    <group>
      {posts.map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color="#111111" roughness={0.5} />
        </mesh>
      ))}
      {[
        [0, 1.05, -4, 8, 0.08, 0.08],
        [0, 1.05, 4, 8, 0.08, 0.08],
        [-4, 1.05, 0, 0.08, 0.08, 8],
        [4, 1.05, 0, 0.08, 0.08, 8],
      ].map(([x, y, z, sx, sy, sz]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color="#facc15" emissive="#713f12" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

function Inspector() {
  return (
    <group position={[-3.2, 0.05, -2.2]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 1.3, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#d6a67a" roughness={0.5} />
      </mesh>
      <mesh position={[0.36, 1.05, 0.05]} rotation={[0.2, 0, -0.2]} castShadow>
        <boxGeometry args={[0.35, 0.48, 0.04]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
    </group>
  )
}

function LargeAcidPool({ fugaPct }: { fugaPct: number }) {
  return (
    <mesh position={[1.7, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[Math.max(0.8, fugaPct * 0.05), 36]} />
      <meshStandardMaterial color="#aadd00" transparent opacity={0.8} roughness={0.02} emissive="#88aa00" emissiveIntensity={0.3} />
    </mesh>
  )
}

export function Escena5Contenido() {
  const worldState = useSimulatorStore((state) => state.worldState)

  return (
    <>
      <DayLighting />
      <Road />
      <CamionCisterna fugaPct={Math.max(5, worldState.fuga_pct * 0.25)} fugaScale={0.5} />
      <LargeAcidPool fugaPct={worldState.fuga_pct} />
      <DangerTape />
      <FireTruck />
      <Inspector />
      <OrbitControls enablePan={false} minDistance={6} maxDistance={24} target={[0, 0.8, -1]} />
    </>
  )
}

export default function Scene5() {
  return (
    <SceneWrapper>
      <Escena5Contenido />
    </SceneWrapper>
  )
}
