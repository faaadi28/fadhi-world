import { useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SteppingStonesProps {
  onSelectStone?: (stoneId: string) => void;
  activeStoneId?: string | null;
}

interface StoneData {
  id: string;
  label: string;
  sublabel: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: number;
}

const STONES: StoneData[] = [
  { id: 'tagspot', label: 'Tagspot', sublabel: 'Travel Discovery Platform', position: [-16, 0.15, 20], scale: [1.6, 0.32, 1.6], rotation: 0.2 },
  { id: 'popular-junction', label: 'Popular Junction', sublabel: 'Business Directory Ecosystem', position: [-18, 0.15, 12], scale: [1.6, 0.32, 1.6], rotation: -0.3 },
  { id: 'connect-campus', label: 'ConnectCampus', sublabel: 'Career Gateway & R&D', position: [-19, 0.15, 4], scale: [1.6, 0.32, 1.6], rotation: 0.4 },
  { id: 'cyber-lab', label: 'Security Home Lab', sublabel: 'Isolated Network Defense', position: [-19, 0.15, -4], scale: [1.6, 0.32, 1.6], rotation: -0.2 },
  { id: 'thm-bruteit', label: 'TryHackMe Labs', sublabel: 'Recon & CTF Rooms', position: [-18, 0.15, -12], scale: [1.6, 0.32, 1.6], rotation: 0.3 },
  { id: 'cryptozombies', label: 'CryptoZombies', sublabel: 'Solidity & Web3 Contracts', position: [-16, 0.15, -20], scale: [1.6, 0.32, 1.6], rotation: -0.4 },
];

export const SteppingStones = ({ onSelectStone, activeStoneId }: SteppingStonesProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <group>
      {STONES.map((stone) => {
        const isHovered = hoveredId === stone.id;
        const isActive = activeStoneId === stone.id;

        return (
          <StoneItem
            key={stone.id}
            data={stone}
            isHovered={isHovered}
            isActive={isActive}
            onPointerOver={() => setHoveredId(stone.id)}
            onPointerOut={() => setHoveredId(null)}
            onClick={() => onSelectStone?.(stone.id)}
          />
        );
      })}
    </group>
  );
};

interface StoneItemProps {
  data: StoneData;
  isHovered: boolean;
  isActive: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}

const StoneItem = ({ data, isHovered, isActive, onPointerOver, onPointerOut, onClick }: StoneItemProps) => {
  return (
    <group position={data.position} rotation={[0, data.rotation, 0]}>
      {/* Interactive stone body */}
      <mesh
        castShadow
        receiveShadow
        scale={data.scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onPointerOut();
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <cylinderGeometry args={[0.7, 0.85, 0.7, 16]} />
        <meshStandardMaterial
          color={isActive ? "#877252" : isHovered ? "#6e6a5f" : "#4a4c49"}
          roughness={0.82}
          metalness={0.12}
        />
      </mesh>

      {/* Wet waterline rim */}
      <mesh position={[0, -0.05, 0]} scale={[data.scale[0] * 1.05, 0.08, data.scale[2] * 1.05]}>
        <cylinderGeometry args={[0.72, 0.88, 1, 16]} />
        <meshStandardMaterial
          color="#1e2422"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Soft moss cushion on top */}
      <mesh position={[0, data.scale[1] * 0.36, 0]} scale={[data.scale[0] * 0.75, 0.04, data.scale[2] * 0.75]}>
        <cylinderGeometry args={[0.65, 0.7, 1, 16]} />
        <meshStandardMaterial
          color={isActive ? "#5c6b45" : "#324433"}
          roughness={0.95}
        />
      </mesh>

      {/* Gentle interactive glowing ring when active/hovered */}
      {(isHovered || isActive) && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.86, 32]} />
          <meshBasicMaterial
            color={isActive ? "#f4d08c" : "#e8b86d"}
            transparent
            opacity={isActive ? 0.8 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Floating 3D Label hint on hover */}
      {isHovered && (
        <Html position={[0, 0.6, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="stone-tooltip">
            <span className="stone-tooltip-title">{data.label}</span>
            <span className="stone-tooltip-sub">{data.sublabel}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
