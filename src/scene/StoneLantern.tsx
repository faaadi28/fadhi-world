import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface StoneLanternProps {
  position?: [number, number, number];
  onClick?: () => void;
  isActive?: boolean;
}

export const StoneLantern = ({ position = [-3.8, 0.05, -1.2], onClick, isActive }: StoneLanternProps) => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime();
      // Natural candlelight flame flicker
      lightRef.current.intensity = 1.6 + Math.sin(t * 4.3) * 0.2 + Math.cos(t * 9.1) * 0.12;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Base Pedestal (Kiso) */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.2, 6]} />
        <meshStandardMaterial color="#4d504c" roughness={0.9} />
      </mesh>

      {/* 2. Shaft (Sao) */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.6, 6]} />
        <meshStandardMaterial color="#545854" roughness={0.88} />
      </mesh>

      {/* 3. Middle Platform (Chudai) */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.32, 0.14, 6]} />
        <meshStandardMaterial color="#4a4d49" roughness={0.9} />
      </mesh>

      {/* 4. Firebox (Hibukuro) with open windows */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.4, 0.38, 6]} />
        <meshStandardMaterial color="#3a3d39" roughness={0.85} wireframe={false} />
      </mesh>

      {/* Glowing fire inside */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial
          color="#ffdd99"
          emissive="#ff9922"
          emissiveIntensity={isActive ? 2.5 : 1.8}
        />
      </mesh>

      {/* Warm point light reflecting on water & moss */}
      <pointLight
        ref={lightRef}
        position={[0, 1.15, 0]}
        color="#ffa338"
        intensity={1.8}
        distance={7.0}
        decay={2}
        castShadow
      />

      {/* 5. Umbrella Roof (Kasa) */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[0.62, 0.24, 6]} />
        <meshStandardMaterial color="#3b3f3b" roughness={0.9} />
      </mesh>

      {/* 6. Jewel Finial (Hoju) */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#555a55" roughness={0.85} />
      </mesh>

      {/* Floating 3D Badge */}
      <Html position={[0, 2.1, 0]} center distanceFactor={20}>
        <div className={`scene-badge ${isActive ? 'active' : ''}`}>
          <span className="badge-tag">LABS</span>
          <span className="badge-en">Lantern Terminal — Tools</span>
        </div>
      </Html>
    </group>
  );
};
