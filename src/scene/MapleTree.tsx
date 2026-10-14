import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface MapleTreeProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export const MapleTree = ({
  position = [-3.2, 0.1, 2.8],
  scale = 1.0,
  rotation = [0, 0.4, 0]
}: MapleTreeProps) => {
  const foliageGroupRef = useRef<THREE.Group>(null);

  // Subtle wind sway
  useFrame((state) => {
    if (foliageGroupRef.current) {
      const t = state.clock.getElapsedTime();
      foliageGroupRef.current.rotation.z = Math.sin(t * 1.1) * 0.025;
      foliageGroupRef.current.rotation.x = Math.cos(t * 0.9) * 0.02;
    }
  });

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* 1. Curved Trunk (Dark weathered bark) */}
      <mesh position={[0, 1.2, 0]} rotation={[0.1, 0, -0.22]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.38, 2.5, 10]} />
        <meshStandardMaterial color="#2b201a" roughness={0.92} />
      </mesh>
      {/* Upper arching trunk section */}
      <mesh position={[0.42, 2.6, 0.12]} rotation={[-0.1, 0.3, -0.45]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.22, 1.8, 8]} />
        <meshStandardMaterial color="#2b201a" roughness={0.92} />
      </mesh>

      {/* Main Limb Branches */}
      <mesh position={[0.9, 3.2, 0.4]} rotation={[0.3, 0.5, -0.7]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.6, 8]} />
        <meshStandardMaterial color="#2b201a" roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 3.3, -0.5]} rotation={[-0.4, -0.3, -0.3]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 1.4, 8]} />
        <meshStandardMaterial color="#2b201a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 2.3, 0.2]} rotation={[0.2, -0.6, 0.6]} castShadow>
        <cylinderGeometry args={[0.06, 0.11, 1.2, 8]} />
        <meshStandardMaterial color="#2b201a" roughness={0.9} />
      </mesh>

      {/* 2. Lush Momiji Foliage Clouds */}
      <group ref={foliageGroupRef}>
        {/* Main canopy cluster (Vibrant Crimson) */}
        <FoliageCluster position={[1.4, 3.7, 0.6]} scale={[1.8, 0.9, 1.7]} color="#b83328" />
        <FoliageCluster position={[0.4, 4.0, -0.6]} scale={[1.5, 0.85, 1.5]} color="#99261f" />
        <FoliageCluster position={[-0.7, 2.9, 0.4]} scale={[1.3, 0.7, 1.2]} color="#cf4336" />
        <FoliageCluster position={[1.8, 3.2, 0.9]} scale={[1.2, 0.65, 1.1]} color="#db5244" />
        <FoliageCluster position={[0.9, 4.3, 0.1]} scale={[1.6, 0.8, 1.4]} color="#a12820" />
        {/* Lower hanging branch dipping toward the pond */}
        <FoliageCluster position={[2.1, 2.6, 0.4]} scale={[1.1, 0.55, 1.0]} color="#b3362a" />
      </group>
    </group>
  );
};

interface FoliageClusterProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

const FoliageCluster = ({ position, scale, color }: FoliageClusterProps) => (
  <mesh position={position} scale={scale} castShadow receiveShadow>
    <dodecahedronGeometry args={[1, 1]} />
    <meshStandardMaterial
      color={color}
      roughness={0.7}
      metalness={0.05}
      flatShading
    />
  </mesh>
);
