import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface PavilionProps {
  position?: [number, number, number];
  onClick?: () => void;
  isActive?: boolean;
}

export const Pavilion = ({ position = [5.5, 0.4, -2.8], onClick, isActive }: PavilionProps) => {
  const lanternLightRef = useRef<THREE.PointLight>(null);

  // Subtle flicker for the pavilion lantern
  useFrame((state) => {
    if (lanternLightRef.current) {
      const t = state.clock.getElapsedTime();
      lanternLightRef.current.intensity = 1.2 + Math.sin(t * 3.7) * 0.15 + Math.cos(t * 7.1) * 0.08;
    }
  });

  return (
    <group
      position={position}
      rotation={[0, -0.4, 0]}
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
      {/* Stone Foundation Base */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.24, 3.8]} />
        <meshStandardMaterial color="#4f524e" roughness={0.88} />
      </mesh>

      {/* Wooden Engawa Veranda Deck */}
      <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.1, 0.1, 3.5]} />
        <meshStandardMaterial color="#36281e" roughness={0.7} />
      </mesh>

      {/* 4 Corner Cedar Columns */}
      <Column position={[-1.7, 1.4, -1.4]} />
      <Column position={[1.7, 1.4, -1.4]} />
      <Column position={[-1.7, 1.4, 1.4]} />
      <Column position={[1.7, 1.4, 1.4]} />

      {/* Intermediate Timber Beams (Nuki) */}
      <mesh position={[0, 2.5, -1.4]} castShadow>
        <boxGeometry args={[3.6, 0.12, 0.14]} />
        <meshStandardMaterial color="#2c1e15" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.5, 1.4]} castShadow>
        <boxGeometry args={[3.6, 0.12, 0.14]} />
        <meshStandardMaterial color="#2c1e15" roughness={0.75} />
      </mesh>
      <mesh position={[-1.7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2.9, 0.12, 0.14]} />
        <meshStandardMaterial color="#2c1e15" roughness={0.75} />
      </mesh>
      <mesh position={[1.7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2.9, 0.12, 0.14]} />
        <meshStandardMaterial color="#2c1e15" roughness={0.75} />
      </mesh>

      {/* Shoji Screen Backdrop (Rear and Left walls) */}
      <mesh position={[0, 1.4, -1.35]}>
        <boxGeometry args={[3.2, 2.0, 0.04]} />
        <meshStandardMaterial color="#f0ece1" roughness={0.6} />
      </mesh>
      <mesh position={[-1.65, 1.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.6, 2.0, 0.04]} />
        <meshStandardMaterial color="#f0ece1" roughness={0.6} />
      </mesh>

      {/* Main Curved Roof Eaves (Lower Layer) */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[3.4, 1.1, 4]} />
        <meshStandardMaterial color="#2a3036" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Upper Ridge Roof (Irimoya peak) */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[2.6, 0.28, 1.4]} />
        <meshStandardMaterial color="#1a2024" roughness={0.7} />
      </mesh>

      {/* Ridge Ornament (Onigawara/Finial) */}
      <mesh position={[0, 3.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.35, 8]} />
        <meshStandardMaterial color="#c44d42" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Hanging Paper Chochin Lantern */}
      <group position={[0, 2.1, 0.6]}>
        {/* Cord */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 6]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        {/* Lantern Body */}
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial
            color="#ffeed1"
            emissive="#ffba52"
            emissiveIntensity={isActive ? 1.6 : 1.1}
            roughness={0.5}
          />
        </mesh>
        {/* Warm Point Light */}
        <pointLight
          ref={lanternLightRef}
          color="#ffb347"
          intensity={1.4}
          distance={5.5}
          decay={2}
          castShadow
        />
      </group>

      {/* Interactive Floating Label Badge */}
      <Html position={[0, 4.2, 0]} center distanceFactor={20}>
        <div className={`scene-badge ${isActive ? 'active' : ''}`}>
          <span className="badge-tag">ZONE 02</span>
          <span className="badge-en">Lakeside Pavilion — About Me</span>
        </div>
      </Html>
    </group>
  );
};

const Column = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position} castShadow receiveShadow>
    <cylinderGeometry args={[0.08, 0.09, 2.3, 8]} />
    <meshStandardMaterial color="#261a12" roughness={0.8} />
  </mesh>
);
