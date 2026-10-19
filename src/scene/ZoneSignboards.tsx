import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { getTerrainHeight } from './terrainUtils';

export interface ZoneSignboardData {
  zoneId: string;
  badge: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  rotationY: number;
}

export const ZONE_SIGNBOARDS: ZoneSignboardData[] = [
  {
    zoneId: 'sanctuary',
    badge: 'ZONE 01 • FIRST GATE',
    title: "FADHI'S WORLD",
    subtitle: 'Grand Entrance & Welcome Hub',
    position: [4.2, 0, 42.0],
    rotationY: -0.35
  },
  {
    zoneId: 'about',
    badge: 'ZONE 02 • ABOUT ME',
    title: 'THE LAKESIDE PAVILION',
    subtitle: 'About Abdulla & Philosophy',
    position: [36.0, 0, 23.0],
    rotationY: -0.60
  },
  {
    zoneId: 'projects',
    badge: 'ZONE 03 • FEATURED WORKS',
    title: 'PROJECT ARCHIPELAGO',
    subtitle: 'Live Platforms & Web3',
    position: [36.5, 0, 3.0],
    rotationY: -1.50
  },
  {
    zoneId: 'skills',
    badge: 'ZONE 04 • CORE SKILLS',
    title: 'THE INNOVATION MEADOW',
    subtitle: 'Technical Matrix & Tooling',
    position: [26.5, 0, -20.0],
    rotationY: 2.30
  },
  {
    zoneId: 'experience',
    badge: 'ZONE 05 • EXPERIENCE',
    title: 'THE GRAND VALLEY BRIDGE',
    subtitle: 'Career & Milestones',
    position: [3.8, 0, -36.0],
    rotationY: 0.15
  },
  {
    zoneId: 'education',
    badge: 'ZONE 06 • EDUCATION',
    title: 'THE KNOWLEDGE SUMMIT',
    subtitle: 'MCA & Physics Foundations',
    position: [-24.0, 0, -22.0],
    rotationY: 0.75
  },
  {
    zoneId: 'labs',
    badge: 'ZONE 07 • SECURITY LABS',
    title: 'CYBERSECURITY BASTION',
    subtitle: 'CTFs & Isolated Labs',
    position: [-34.0, 0, 3.0],
    rotationY: 1.55
  },
  {
    zoneId: 'contact',
    badge: 'ZONE 08 • CONNECT',
    title: 'COMMUNICATIONS OUTPOST',
    subtitle: 'Direct Contact & Resume',
    position: [-26.0, 0, 30.0],
    rotationY: 2.40
  }
];

interface ZoneSignboardsProps {
  onSelectZone: (zoneId: string) => void;
  activeZone: string;
}

export const ZoneSignboards = ({ onSelectZone, activeZone }: ZoneSignboardsProps) => {
  return (
    <group>
      {ZONE_SIGNBOARDS.map((data) => (
        <SingleZoneSignboard
          key={data.zoneId}
          data={data}
          isActive={activeZone === data.zoneId}
          onSelect={() => onSelectZone(data.zoneId)}
        />
      ))}
    </group>
  );
};

interface SingleSignboardProps {
  data: ZoneSignboardData;
  isActive: boolean;
  onSelect: () => void;
}

const SingleZoneSignboard = ({ data, isActive, onSelect }: SingleSignboardProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const groundY = useMemo(
    () => getTerrainHeight(data.position[0], data.position[2]),
    [data.position]
  );

  return (
    <group
      ref={groupRef}
      position={[data.position[0], groundY, data.position[2]]}
      rotation={[0, data.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Stone Foundation Footing Blocks */}
      <mesh position={[-0.75, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.16, 8]} />
        <meshStandardMaterial color="#444a46" roughness={0.9} />
      </mesh>
      <mesh position={[0.75, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.16, 8]} />
        <meshStandardMaterial color="#444a46" roughness={0.9} />
      </mesh>

      {/* Two Dark Timber Vertical Posts */}
      <mesh position={[-0.75, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 1.9, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.85} />
      </mesh>
      <mesh position={[0.75, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 1.9, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.85} />
      </mesh>

      {/* Crossbeams Behind Board */}
      <mesh position={[0, 0.8, -0.04]} castShadow>
        <boxGeometry args={[1.7, 0.08, 0.06]} />
        <meshStandardMaterial color="#261c16" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, -0.04]} castShadow>
        <boxGeometry args={[1.7, 0.08, 0.06]} />
        <meshStandardMaterial color="#261c16" roughness={0.85} />
      </mesh>

      {/* Backing Wooden Board Plaque */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.68, 1.05, 0.07]} />
        <meshStandardMaterial color={isActive ? '#453225' : '#362921'} roughness={0.78} />
      </mesh>

      {/* Golden Frame Border on Signboard */}
      <mesh position={[0, 1.15, 0.04]}>
        <boxGeometry args={[1.56, 0.94, 0.02]} />
        <meshStandardMaterial
          color={isActive ? '#ffd700' : '#b89456'}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Inner Inscribed Wooden Center Plate */}
      <mesh position={[0, 1.15, 0.055]}>
        <boxGeometry args={[1.46, 0.84, 0.02]} />
        <meshStandardMaterial color="#1a1410" roughness={0.85} />
      </mesh>

      {/* Glowing Zone Emblem Crest in Center */}
      <mesh position={[0, 1.25, 0.07]}>
        <circleGeometry args={[0.18, 16]} />
        <meshBasicMaterial color={isActive ? '#ffea75' : '#d4af37'} />
      </mesh>

      {/* Traditional Protective Angled Rooflet */}
      <mesh position={[0, 1.76, 0]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.9, 0.06, 0.42]} />
        <meshStandardMaterial color="#1b2126" roughness={0.8} />
      </mesh>
      {/* Roof Ridge Cap */}
      <mesh position={[0, 1.82, -0.05]} castShadow>
        <boxGeometry args={[1.94, 0.06, 0.08]} />
        <meshStandardMaterial color="#14181c" roughness={0.85} />
      </mesh>

      {/* Small Lantern Lamp under Roof */}
      <pointLight
        position={[0, 1.62, 0.15]}
        color={isActive ? '#ffea75' : '#ffecd1'}
        intensity={isActive ? 1.5 : 0.8}
        distance={3.0}
      />
    </group>
  );
};
