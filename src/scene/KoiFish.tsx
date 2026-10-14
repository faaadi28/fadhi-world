import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SingleKoiData {
  radiusX: number;
  radiusZ: number;
  speed: number;
  offset: number;
  depth: number;
  colorPattern: 'kohaku' | 'yamabuki';
}

export const KoiFishGroup = () => {
  const fishes: SingleKoiData[] = useMemo(() => [
    { radiusX: 3.2, radiusZ: 2.4, speed: 0.35, offset: 0, depth: -0.22, colorPattern: 'kohaku' },
    { radiusX: 2.1, radiusZ: 3.0, speed: -0.28, offset: 2.4, depth: -0.32, colorPattern: 'yamabuki' },
    { radiusX: 3.8, radiusZ: 1.8, speed: 0.22, offset: 4.1, depth: -0.26, colorPattern: 'kohaku' }
  ], []);

  return (
    <group position={[-1.0, 0, 0.5]}>
      {fishes.map((fish, i) => (
        <KoiFish key={i} data={fish} />
      ))}
    </group>
  );
};

const KoiFish = ({ data }: { data: SingleKoiData }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * data.speed + data.offset;

    // Elliptical swimming trajectory
    const x = Math.cos(t) * data.radiusX;
    const z = Math.sin(t) * data.radiusZ;
    groupRef.current.position.set(x, data.depth, z);

    // Tangent angle along trajectory
    const dx = -Math.sin(t) * data.radiusX * data.speed;
    const dz = Math.cos(t) * data.radiusZ * data.speed;
    const angle = Math.atan2(dx, dz);
    groupRef.current.rotation.y = angle;

    // Tail fin rhythmic waggle
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 7.0 + data.offset) * 0.45;
    }
  });

  const isKohaku = data.colorPattern === 'kohaku';

  return (
    <group ref={groupRef} scale={0.45}>
      {/* Torpedo-shaped fish body */}
      <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.1, 10]} />
        <meshStandardMaterial
          color={isKohaku ? "#f7f7f5" : "#e6a83e"}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Red dorsal patches for Kohaku */}
      {isKohaku && (
        <mesh position={[0, 0.08, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.16, 0.45, 8]} />
          <meshStandardMaterial color="#c73224" roughness={0.35} />
        </mesh>
      )}

      {/* Tapered Head */}
      <mesh position={[0, 0, 0.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.17, 0.35, 10]} />
        <meshStandardMaterial
          color={isKohaku ? "#f7f7f5" : "#f5b742"}
          roughness={0.3}
        />
      </mesh>

      {/* Articulated Tail Fin */}
      <group position={[0, 0, -0.55]}>
        <mesh ref={tailRef} position={[0, 0, -0.22]}>
          <coneGeometry args={[0.14, 0.4, 4]} />
          <meshStandardMaterial
            color={isKohaku ? "#e04838" : "#d9972b"}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* Pectoral Fins */}
      <mesh position={[-0.24, 0, 0.2]} rotation={[0, 0.4, -0.5]}>
        <boxGeometry args={[0.26, 0.02, 0.14]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.24, 0, 0.2]} rotation={[0, -0.4, 0.5]}>
        <boxGeometry args={[0.26, 0.02, 0.14]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};
