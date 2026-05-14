'use client'

import { useCallback, useMemo, useRef } from 'react'

import { OrbitControls, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { SceneWrapper } from '@/components/scene/SceneWrapper'
import { GasParticles } from '@/components/scene/shared/GasParticles'
import { ObjetoClickable } from '@/components/scene/shared/ObjetoClickable'
import { useSimulatorStore } from '@/store/simulatorStore'

const OBJECT_LABELS: Record<string, string> = {
  documentos_kit: 'Documentos',
  telefono_dgaam: 'DGAAM',
  civil_zona: 'Civil',
  valvula_reparacion: 'Valvula',
  zona_segura: 'Zona segura',
}

function useDecisionObjects() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const opcionesActuales = useSimulatorStore((state) => state.opcionesActuales)
  const elegirDecision = useSimulatorStore((state) => state.elegirDecision)

  const activeIds = useMemo(() => {
    return new Set(
      opcionesActuales
        ?.map((opcion) => opcion.objeto_3d_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    )
  }, [opcionesActuales])

  const isBlockedByWorldState = useCallback(
    (objectId: string) => {
      if (worldState.trigger_fallo) return true
      if (objectId === 'documentos_kit') return worldState.documentos_listos
      if (objectId === 'telefono_dgaam') return worldState.notifico_dgaam
      if (objectId === 'civil_zona') return !worldState.civil_en_peligro
      return false
    },
    [worldState],
  )

  const isActive = useCallback(
    (objectId: string) => activeIds.has(objectId) && !isBlockedByWorldState(objectId),
    [activeIds, isBlockedByWorldState],
  )

  const handleSelect = useCallback(
    (objectId: string) => {
      const decision = opcionesActuales?.find((opcion) => opcion.objeto_3d_id === objectId)
      if (decision) elegirDecision(decision.id)
    },
    [elegirDecision, opcionesActuales],
  )

  return { worldState, isActive, handleSelect }
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} metalness={0} />
      </mesh>

      {[-12, -4, 4, 12].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 16]}>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial color="#6b8e3e" roughness={1} />
      </mesh>
    </>
  )
}

function Mountains() {
  const peaks = useMemo(
    () => [
      [-36, 0, -31, 16, 9],
      [-17, 0, -37, 23, 13],
      [9, 0, -34, 18, 10],
      [35, 0, -28, 14, 8],
      [-44, 0, 25, 12, 7],
      [37, 0, 32, 16, 9],
    ] as const,
    [],
  )

  return (
    <group>
      {peaks.map(([x, y, z, height, radius], index) => (
        <mesh key={`${x}-${z}`} position={[x, y + height / 2 - 0.5, z]}>
          <coneGeometry args={[radius, height, 6]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#2f332b' : '#3b3c31'} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function TankerTruck() {
  return (
    <group position={[0, 0.08, 0]}>
      <mesh position={[-1.7, 0.65, -0.05]} castShadow>
        <boxGeometry args={[1.35, 1.25, 1.45]} />
        <meshStandardMaterial color="#cc2200" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.35, 0.95, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 3.9, 32]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.85} roughness={0.15} />
      </mesh>
      {[-1.95, -0.55, 0.8, 1.95].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.25, -0.78]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#0f0f0f" roughness={0.85} />
          </mesh>
          <mesh position={[x, 0.25, 0.78]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#0f0f0f" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function EmergencyLights() {
  const redRef = useRef<THREE.Mesh>(null)
  const blueRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const redOn = Math.sin(state.clock.elapsedTime * 7) > 0
    if (redRef.current) redRef.current.visible = redOn
    if (blueRef.current) blueRef.current.visible = !redOn
  })

  return (
    <group position={[0, 0.4, -24]}>
      <mesh position={[-0.45, 1.2, 0]} ref={redRef}>
        <sphereGeometry args={[0.35, 18, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[-0.45, 1.2, 0]} color="#ef4444" intensity={1.4} distance={14} />
      <mesh position={[0.45, 1.2, 0]} ref={blueRef}>
        <sphereGeometry args={[0.35, 18, 12]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0.45, 1.2, 0]} color="#2563eb" intensity={1.2} distance={14} />
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.6, 0.55, 2.2]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
    </group>
  )
}

function SafeZone() {
  return (
    <group>
      <mesh position={[-5.5, 0.04, 4.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.9, 48]} />
        <meshStandardMaterial color="#22c55e" emissive="#14532d" emissiveIntensity={0.35} transparent opacity={0.65} />
      </mesh>
      <mesh position={[-5.5, 0.035, 4.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 48]} />
        <meshStandardMaterial color="#166534" transparent opacity={0.24} />
      </mesh>
    </group>
  )
}

function DocumentsKit() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.68, 0.08, 0.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.11, 0.02]} rotation={[0.02, 0.1, 0.02]} castShadow>
        <boxGeometry args={[0.52, 0.025, 0.38]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.35} />
      </mesh>
    </group>
  )
}

function DgaamPhone() {
  return (
    <group rotation={[0, -0.45, 0.12]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.08, 0.44]} />
        <meshStandardMaterial color="#101827" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[0.18, 0.012, 0.28]} />
        <meshStandardMaterial color="#4ade80" emissive="#14532d" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function CivilFigure({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.78, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.07, 0]} castShadow>
        <sphereGeometry args={[0.2, 18, 12]} />
        <meshStandardMaterial color="#e7b98a" roughness={0.5} />
      </mesh>
      <mesh position={[0.22, 0.63, 0]} rotation={[0, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 10]} />
        <meshStandardMaterial color="#e7b98a" />
      </mesh>
      <mesh position={[-0.22, 0.63, 0]} rotation={[0, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 10]} />
        <meshStandardMaterial color="#e7b98a" />
      </mesh>
    </group>
  )
}

function ValveRepair() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.23, 0.035, 12, 24]} />
        <meshStandardMaterial color="#991b1b" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.65, 12]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
    </group>
  )
}

function ReducedLeak({ fugaPct }: { fugaPct: number }) {
  const visiblePct = Math.max(8, Math.min(35, fugaPct))

  return (
    <group>
      <mesh position={[1.7, 0.035, 0.82]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36 + visiblePct / 180, 32]} />
        <meshStandardMaterial color="#88aa00" transparent opacity={0.7} roughness={0.02} metalness={0.3} />
      </mesh>
      <GasParticles
        position={[1.7, 0.48, 0.82]}
        claseONU={8}
        intensidad={fugaPct > 70 ? 'media' : 'baja'}
        direccionViento={[0.55, 0.08, -0.2]}
        activo
      />
    </group>
  )
}

export function Escena3Contenido() {
  const { worldState, isActive, handleSelect } = useDecisionObjects()

  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 60, 200]} />
      <Sky sunPosition={[100, 40, 10]} turbidity={2} rayleigh={0.5} />
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

      <Ground />
      <Mountains />
      <TankerTruck />
      <EmergencyLights />
      <SafeZone />
      <ReducedLeak fugaPct={worldState.fuga_pct} />

      <ObjetoClickable
        position={[-3.2, 0.1, 2.5]}
        objetoId="documentos_kit"
        label={OBJECT_LABELS.documentos_kit}
        isActive={isActive('documentos_kit')}
        onSelect={handleSelect}
      >
        <DocumentsKit />
      </ObjetoClickable>

      <ObjetoClickable
        position={[-5.5, 0.12, 4.8]}
        objetoId="zona_segura"
        label={OBJECT_LABELS.zona_segura}
        isActive={isActive('zona_segura')}
        onSelect={handleSelect}
      >
        <mesh>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial color="#22c55e" emissive="#14532d" emissiveIntensity={0.35} />
        </mesh>
      </ObjetoClickable>

      <ObjetoClickable
        position={[-2.1, 1.08, -0.78]}
        objetoId="telefono_dgaam"
        label={OBJECT_LABELS.telefono_dgaam}
        isActive={isActive('telefono_dgaam')}
        onSelect={handleSelect}
      >
        <DgaamPhone />
      </ObjetoClickable>

      <ObjetoClickable
        position={[1.9, 0.82, 0.76]}
        objetoId="valvula_reparacion"
        label={OBJECT_LABELS.valvula_reparacion}
        isActive={isActive('valvula_reparacion')}
        onSelect={handleSelect}
      >
        <ValveRepair />
      </ObjetoClickable>

      <ObjetoClickable
        position={[4.6, 0.05, 10.5]}
        objetoId="civil_zona"
        label={OBJECT_LABELS.civil_zona}
        isActive={isActive('civil_zona')}
        onSelect={handleSelect}
      >
        <CivilFigure visible={worldState.civil_en_peligro} />
      </ObjetoClickable>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.08}
        target={[0.5, 0.9, 1.8]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

export default function Scene3() {
  return (
    <SceneWrapper>
      <Escena3Contenido />
    </SceneWrapper>
  )
}
