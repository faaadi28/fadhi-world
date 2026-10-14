import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

// ==========================================
// 1. Vermilion Torii Gate (Sanctuary / Gate)
// ==========================================
interface ToriiGateProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export const ToriiGate = ({
  position = [0, 0, 7.5],
  rotation = [0, 0, 0],
  scale = 1.0,
  isActive,
  onClick
}: ToriiGateProps) => {
  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
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
      {/* Base Foundation Stones */}
      <mesh position={[-1.8, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#333835" roughness={0.9} />
      </mesh>
      <mesh position={[1.8, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#333835" roughness={0.9} />
      </mesh>

      {/* Main Two Vertical Columns (Hashira) */}
      <mesh position={[-1.8, 2.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 3.8, 16]} />
        <meshStandardMaterial color="#bd3224" roughness={0.7} />
      </mesh>
      <mesh position={[1.8, 2.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 3.8, 16]} />
        <meshStandardMaterial color="#bd3224" roughness={0.7} />
      </mesh>

      {/* Lower Crossbeam (Nuki) */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[4.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#ba3123" roughness={0.7} />
      </mesh>

      {/* Central Plaque (Gakuzuka) with FADHI'S WORLD */}
      <mesh position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[2.8, 0.54, 0.14]} />
        <meshStandardMaterial color="#14171a" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Gold Gilded Border Frame */}
      <mesh position={[0, 3.45, 0.08]} castShadow>
        <boxGeometry args={[2.86, 0.6, 0.02]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Carved Gilded Title Plate on First Gate */}
      <Html position={[0, 3.45, 0.1]} center distanceFactor={14}>
        <div className="gate-title-plate">
          <span className="gate-title-text">FADHI'S WORLD</span>
        </div>
      </Html>

      {/* Upper Curved Crossbeam (Kasagi & Shimaki) */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[4.8, 0.24, 0.32]} />
        <meshStandardMaterial color="#1a1d1e" roughness={0.85} />
      </mesh>
      {/* Top curved roof lip */}
      <mesh position={[0, 3.96, 0]} castShadow>
        <boxGeometry args={[5.2, 0.1, 0.38]} />
        <meshStandardMaterial color="#111314" roughness={0.85} />
      </mesh>

      {/* Floating 3D Badge */}
      <Html position={[0, 4.45, 0]} center distanceFactor={22}>
        <div className={`scene-badge ${isActive ? 'active' : ''}`}>
          <span className="badge-tag">FIRST GATE</span>
          <span className="badge-en">FADHI'S WORLD</span>
        </div>
      </Html>
    </group>
  );
};

// ==========================================
// 2. Sakura Cherry Blossom Tree
// ==========================================
interface SakuraTreeProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export const SakuraTree = ({ position, scale = 1.0, rotation = [0, 0, 0] }: SakuraTreeProps) => {
  const foliageRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!foliageRef.current) return;
    const t = state.clock.getElapsedTime();
    foliageRef.current.rotation.y = Math.sin(t * 0.8) * 0.02;
    foliageRef.current.rotation.z = Math.cos(t * 0.7) * 0.015;
  });

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Curved Dark Trunk */}
      <mesh position={[0, 1.4, 0]} rotation={[0.08, 0, 0.15]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.38, 2.8, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.9} />
      </mesh>
      {/* Upper trunk split */}
      <mesh position={[-0.2, 2.8, 0]} rotation={[-0.2, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, 1.8, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 2.9, 0.1]} rotation={[0.2, 0.3, 0.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.2, 1.6, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.9} />
      </mesh>

      {/* Fluffy Pink Sakura Canopies */}
      <group ref={foliageRef}>
        <mesh position={[-0.6, 3.8, 0]} scale={[2.0, 1.2, 1.8]} castShadow>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#f7a8b8" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0.8, 3.9, 0.2]} scale={[1.8, 1.1, 1.7]} castShadow>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#ffc2d1" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0.1, 4.4, -0.2]} scale={[1.9, 1.3, 1.7]} castShadow>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#e8899e" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[-1.2, 3.2, 0.4]} scale={[1.2, 0.8, 1.1]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#f9b3c4" roughness={0.7} flatShading />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// 3. Cyber Security Monolith & Lab Node
// ==========================================
interface CyberMonolithProps {
  position?: [number, number, number];
  isActive?: boolean;
  onClick?: () => void;
}

export const CyberMonolith = ({
  position = [-5.5, 0.2, -4.5],
  isActive,
  onClick
}: CyberMonolithProps) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.position.y = 1.9 + Math.sin(t * 1.8) * 0.12;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.3;
      ringRef.current.rotation.z = t * 0.25;
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
      {/* Stepped Granite Altar Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.3, 8]} />
        <meshStandardMaterial color="#262b30" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.4, 0.3, 8]} />
        <meshStandardMaterial color="#1a1e22" roughness={0.8} />
      </mesh>

      {/* Floating Glowing Cyber Octahedron Core */}
      <mesh ref={coreRef} position={[0, 1.9, 0]} castShadow>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={isActive ? 2.5 : 1.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Cybernetic Ring */}
      <group ref={ringRef} position={[0, 1.9, 0]}>
        <mesh>
          <torusGeometry args={[1.1, 0.03, 8, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* Blue Atmospheric Aura Point Light */}
      <pointLight
        position={[0, 2.0, 0]}
        color="#38bdf8"
        intensity={2.2}
        distance={7.0}
        decay={2}
      />

      {/* Floating 3D Badge */}
      <Html position={[0, 3.2, 0]} center distanceFactor={22}>
        <div className={`scene-badge ${isActive ? 'active' : ''}`}>
          <span className="badge-tag">ZONE 07</span>
          <span className="badge-en">Cyber Bastion — CTFs & Labs</span>
        </div>
      </Html>
    </group>
  );
};

// ==========================================
// 4. Evergreen Pine Tree
// ==========================================
export const PineTree = ({
  position,
  scale = 1.0,
  rotation = [0, 0, 0]
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Straight Bark Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.35, 3.0, 8]} />
        <meshStandardMaterial color="#2e2118" roughness={0.9} />
      </mesh>

      {/* Layered Conical Needle Tiers */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[1.8, 1.6, 7]} />
        <meshStandardMaterial color="#1a3823" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <coneGeometry args={[1.4, 1.5, 7]} />
        <meshStandardMaterial color="#21422b" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 4.3, 0]} castShadow>
        <coneGeometry args={[1.0, 1.4, 7]} />
        <meshStandardMaterial color="#284e34" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 5.1, 0]} castShadow>
        <coneGeometry args={[0.6, 1.1, 7]} />
        <meshStandardMaterial color="#305a3d" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
};

// ==========================================
// 5. Contact Shrine & Messenger Bell
// ==========================================
interface ContactShrineProps {
  position?: [number, number, number];
  isActive?: boolean;
  onClick?: () => void;
}

export const ContactShrine = ({
  position = [1.2, 0.2, 7.8],
  isActive,
  onClick
}: ContactShrineProps) => {
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
      {/* Base */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.45, 0.7, 8]} />
        <meshStandardMaterial color="#3a3c39" roughness={0.9} />
      </mesh>
      {/* Shrine box */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.45]} />
        <meshStandardMaterial color="#4a2e1f" roughness={0.8} />
      </mesh>
      {/* Gable Roof */}
      <mesh position={[0, 1.25, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.6, 0.3, 4]} />
        <meshStandardMaterial color="#1a1c1d" roughness={0.7} />
      </mesh>
      {/* Golden bell */}
      <mesh position={[0, 0.8, 0.26]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.8} />
      </mesh>

      <Html position={[0, 2.1, 0]} center distanceFactor={20}>
        <div className={`scene-badge ${isActive ? 'active' : ''}`}>
          <span className="badge-tag">ZONE 08</span>
          <span className="badge-en">Communications Outpost — Contact</span>
        </div>
      </Html>
    </group>
  );
};
