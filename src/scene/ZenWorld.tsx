import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WaterSurface } from './WaterSurface';
import { Terrain } from './Terrain';
import { SteppingStones } from './SteppingStones';
import { Pavilion } from './Pavilion';
import { StoneLantern } from './StoneLantern';
import { MoonBridge } from './MoonBridge';
import { MapleTree } from './MapleTree';
import { KoiFishGroup } from './KoiFish';
import { Atmosphere } from './Atmosphere';
import { SkyAndClouds } from './SkyAndClouds';
import { ToriiGate, SakuraTree, PineTree, CyberMonolith, ContactShrine } from './OpenWorldAssets';
import { PlayerController } from './PlayerController';
import type { LandmarkTarget } from './PlayerController';
import { CableCarSystem } from './CableCarSystem';
import type { CableCarSpeed, StationArrivalInfo } from './CableCarSystem';
import { TraditionalCobbleLanterns } from './TraditionalCobbleLanterns';
import { ZoneSignboards } from './ZoneSignboards';

export interface CameraViewpoint {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

// Spaciously calibrated cinematic viewpoints for each distinct world section
export const VIEWPOINTS: Record<string, CameraViewpoint> = {
  sanctuary: {
    position: new THREE.Vector3(0.0, 2.7, 49.5),
    target: new THREE.Vector3(0.0, 2.3, 42.0)
  },
  about: {
    position: new THREE.Vector3(32.0, 3.8, 18.0),
    target: new THREE.Vector3(42.0, 1.8, 8.0)
  },
  projects: {
    position: new THREE.Vector3(-10.0, 4.8, 12.0),
    target: new THREE.Vector3(-18.0, 0.6, 0.0)
  },
  skills: {
    position: new THREE.Vector3(26.0, 3.6, 48.0),
    target: new THREE.Vector3(36.0, 1.2, 42.0)
  },
  experience: {
    position: new THREE.Vector3(0.0, 5.2, -26.0),
    target: new THREE.Vector3(0.0, 2.0, -40.0)
  },
  education: {
    position: new THREE.Vector3(34.0, 6.5, -26.0),
    target: new THREE.Vector3(45.0, 4.2, -38.0)
  },
  labs: {
    position: new THREE.Vector3(-30.0, 4.2, -22.0),
    target: new THREE.Vector3(-42.0, 2.0, -34.0)
  },
  contact: {
    position: new THREE.Vector3(-28.0, 3.4, 44.0),
    target: new THREE.Vector3(-38.0, 1.2, 38.0)
  }
};

interface ZenWorldProps {
  activeZone: string;
  timeOfDay: 'day' | 'twilight' | 'night';
  reducedMotion: boolean;
  isFreeRoam: boolean;
  onSelectZone: (zoneId: string) => void;
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string | null;
  onNearLandmark?: (landmark: LandmarkTarget | null) => void;
  onPlayerPositionChange?: (pos: { x: number; z: number; heading: number }) => void;
  virtualInput?: { x: number; y: number; isSprinting?: boolean; isJumping?: boolean };
  isRidingCableCar?: boolean;
  onToggleRideCableCar?: (riding: boolean) => void;
  onCableCarStationName?: (name: string) => void;
  cableCarSpeed?: CableCarSpeed;
  isStationPromptActive?: boolean;
  onStationArrival?: (info: StationArrivalInfo) => void;
  continueNudge?: number;
  teleportTarget?: [number, number, number] | null;
}

export const ZenWorld = ({
  activeZone,
  timeOfDay,
  reducedMotion,
  isFreeRoam,
  onSelectZone,
  onSelectProject,
  selectedProjectId,
  onNearLandmark,
  onPlayerPositionChange,
  virtualInput,
  isRidingCableCar = false,
  onToggleRideCableCar,
  onCableCarStationName,
  cableCarSpeed = 1,
  isStationPromptActive = false,
  onStationArrival,
  continueNudge = 0,
  teleportTarget
}: ZenWorldProps) => {
  const [cabinPos, setCabinPos] = useState<THREE.Vector3 | null>(null);

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [0.0, 2.7, 49.5], fov: 46, near: 0.1, far: 380 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: timeOfDay === 'night' ? 1.15 : timeOfDay === 'twilight' ? 1.05 : 1.2,
          powerPreference: 'high-performance'
        }}
      >
        {/* Sky, Drifting Clouds, Stars, Sun and Moon */}
        <SkyAndClouds timeOfDay={timeOfDay} />

        {/* Dynamic Sunlight / Moonlight & Environmental Radiance */}
        <EnvironmentLights timeOfDay={timeOfDay} />

        {/* Guided Cinematic Camera (Active when NOT in Free Roam) */}
        {!isFreeRoam && (
          <CameraController
            activeZone={activeZone}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Free Roam Open World Player Avatar & Controller */}
        <PlayerController
          isFreeRoam={isFreeRoam}
          onNearLandmark={onNearLandmark}
          onInteractLandmark={(id) => onSelectZone(id)}
          onPlayerPositionChange={onPlayerPositionChange}
          virtualInput={virtualInput}
          isRidingCableCar={isRidingCableCar}
          onToggleRideCableCar={onToggleRideCableCar}
          cableCarPos={cabinPos}
          teleportTarget={teleportTarget}
          isStationPromptActive={isStationPromptActive}
        />

        {/* Scenic Aerial Cable Car System (Welcome Plaza -> About Me -> Experience) */}
        <CableCarSystem
          isRiding={isRidingCableCar}
          onToggleRide={(riding) => onToggleRideCableCar?.(riding)}
          onCabinPositionUpdate={(pos, stationName) => {
            setCabinPos(pos.clone());
            onCableCarStationName?.(stationName);
          }}
          playerNearStation={activeZone}
          speedMultiplier={cableCarSpeed}
          isStationPromptActive={isStationPromptActive}
          onStationArrival={onStationArrival}
          continueNudge={continueNudge}
        />

        {/* Expansive 160-Unit Open World Terrain */}
        <Terrain timeOfDay={timeOfDay} />

        {/* Traditional Land Lights Full Cobblestones (Pagoda Lanterns & Ground Lights) */}
        <TraditionalCobbleLanterns timeOfDay={timeOfDay} />

        {/* 3D Information Signboards Outside Each Zone Detailing What is There */}
        <ZoneSignboards onSelectZone={onSelectZone} activeZone={activeZone} />

        {/* Large Reflective Central Lake & River Surface */}
        <WaterSurface timeOfDay={timeOfDay} />

        {/* Swimming Koi Fish in the Lake */}
        <KoiFishGroup />

        {/* Section 01: Grand Welcome Plaza (South Gateway) */}
        <ToriiGate
          position={[0, 0.38, 42]}
          isActive={activeZone === 'sanctuary'}
          onClick={() => onSelectZone('sanctuary')}
        />

        {/* Section 02: The Lakeside Pavilion (East Shore Terrace) */}
        <Pavilion
          position={[42, 0.45, 8]}
          isActive={activeZone === 'about'}
          onClick={() => onSelectZone('about')}
        />

        {/* Section 03: The Project Archipelago (Waterfront Boardwalk Islands) */}
        <SteppingStones
          activeStoneId={selectedProjectId}
          onSelectStone={(id) => {
            onSelectProject(id);
            onSelectZone('projects');
          }}
        />

        {/* Section 04: The Grand Valley Bridge (North River Canyon) */}
        <MoonBridge
          position={[0, 0.7, -40]}
          rotation={[0, 0, 0]}
          isActive={activeZone === 'experience'}
          onClick={() => onSelectZone('experience')}
        />

        {/* Section 05: Cybersecurity Bastion & Fortress (Northwest Elevated Plateau) */}
        <CyberMonolith
          position={[-42, 1.5, -34]}
          isActive={activeZone === 'labs'}
          onClick={() => onSelectZone('labs')}
        />
        <StoneLantern
          position={[-36, 1.2, -28]}
          isActive={activeZone === 'labs'}
          onClick={() => onSelectZone('labs')}
        />

        {/* Section 06: Communications Outpost (Southwest Hub) */}
        <ContactShrine
          position={[-38, 0.38, 38]}
          isActive={activeZone === 'contact'}
          onClick={() => onSelectZone('contact')}
        />

        {/* Section 07: Knowledge Summit Observatory (Northeast Mountain Bluff) */}
        <KnowledgeSummit
          position={[45, 3.8, -38]}
          isActive={activeZone === 'education'}
          onClick={() => onSelectZone('education')}
        />

        {/* Section 08: Innovation Meadow Monoliths (Southeast Skill Grove) */}
        <InnovationGrove
          position={[36, 0.5, 42]}
          isActive={activeZone === 'skills'}
          onClick={() => onSelectZone('skills')}
        />

        {/* Natural Forest & Flora Spread Across the Spacious Landscape */}
        {/* Sakura Trees along the Eastern Pavilion & Welcome Avenue */}
        <SakuraTree position={[34, 0.4, 6]} scale={1.2} />
        <SakuraTree position={[50, 0.5, 14]} scale={1.1} rotation={[0, 0.6, 0]} />
        <SakuraTree position={[8, 0.35, 46]} scale={1.15} />
        <SakuraTree position={[-8, 0.35, 46]} scale={1.15} rotation={[0, -0.4, 0]} />

        {/* Japanese Autumn Maple Trees in Innovation Grove & Lake Borders */}
        <MapleTree position={[30, 0.4, 38]} scale={1.2} />
        <MapleTree position={[42, 0.5, 46]} scale={1.1} rotation={[0, 0.8, 0]} />
        <MapleTree position={[-12, 0.2, 28]} scale={1.1} />
        <MapleTree position={[-24, 0.3, 4]} scale={1.2} rotation={[0, -0.5, 0]} />

        {/* Evergreen Pines along the Mountains & Northwest Bastion */}
        <PineTree position={[-52, 1.8, -38]} scale={1.4} />
        <PineTree position={[-36, 1.4, -44]} scale={1.3} />
        <PineTree position={[-20, 0.8, -46]} scale={1.2} />
        <PineTree position={[20, 0.8, -46]} scale={1.2} />
        <PineTree position={[38, 2.2, -44]} scale={1.35} />
        <PineTree position={[54, 3.6, -34]} scale={1.5} />
        <PineTree position={[-48, 1.2, 12]} scale={1.3} />
        <PineTree position={[-54, 1.8, -10]} scale={1.4} />

        {/* Atmospheric particles: falling autumn leaves & low mist */}
        <Atmosphere timeOfDay={timeOfDay} />
      </Canvas>
    </div>
  );
};

// Section 07: Knowledge Summit 3D Monument (Northeast High Peak)
const KnowledgeSummit = ({
  position,
  isActive,
  onClick
}: {
  position: [number, number, number];
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Stone Foundation Terrace */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.2, 4.8, 0.4, 8]} />
        <meshStandardMaterial color="#383d3a" roughness={0.88} />
      </mesh>

      {/* Classical Stone Pillars */}
      {[-2.2, 2.2].map((x, i) =>
        [-2.2, 2.2].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 1.8, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.28, 3.2, 12]} />
            <meshStandardMaterial color="#505652" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Summit Architrave Beam */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[5.2, 0.35, 5.2]} />
        <meshStandardMaterial color="#3a3f3c" roughness={0.8} />
      </mesh>

      {/* Physics & Computing Sphere (Armillary Globe) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={isActive ? 2.0 : 1.2}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* 3D Badge */}
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.01, 4, 4]} />
      </mesh>
    </group>
  );
};

// Section 08: Innovation Grove Monoliths (Southeast Skills Meadow)
const InnovationGrove = ({
  position,
  isActive,
  onClick
}: {
  position: [number, number, number];
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Central Skill Monolith Pillar */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.8, 1.2]} />
        <meshStandardMaterial
          color="#2e3431"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Glowing Tech Inset */}
      <mesh position={[0, 1.4, 0.62]}>
        <planeGeometry args={[0.8, 2.2]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={isActive ? 2.2 : 1.4}
        />
      </mesh>

      {/* Radiance Light */}
      <pointLight position={[0, 2.2, 0]} color="#38bdf8" intensity={1.5} distance={6} />
    </group>
  );
};

// Guided Camera Controller for Cinematic Tour Mode
interface CameraControllerProps {
  activeZone: string;
  reducedMotion: boolean;
}

const CameraController = ({ activeZone, reducedMotion }: CameraControllerProps) => {
  const pointerPos = useRef({ x: 0, y: 0 });
  const currentLookAt = useRef(new THREE.Vector3(0.0, 1.4, 36.0));

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerPos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerPos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((state) => {
    const targetViewpoint = VIEWPOINTS[activeZone] || VIEWPOINTS.sanctuary;
    const lerpSpeed = reducedMotion ? 0.08 : 0.038;

    const parallaxX = reducedMotion ? 0 : pointerPos.current.x * 0.35;
    const parallaxY = reducedMotion ? 0 : pointerPos.current.y * 0.25;

    const targetPos = new THREE.Vector3(
      targetViewpoint.position.x + parallaxX,
      targetViewpoint.position.y + parallaxY,
      targetViewpoint.position.z
    );

    state.camera.position.lerp(targetPos, lerpSpeed);
    currentLookAt.current.lerp(targetViewpoint.target, lerpSpeed);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
};

// Atmospheric Lighting & Shadows depending on time of day
const EnvironmentLights = ({ timeOfDay }: { timeOfDay: 'day' | 'twilight' | 'night' }) => {
  const lighting = useMemo(() => {
    switch (timeOfDay) {
      case 'twilight':
        return {
          ambientColor: '#2b2233',
          ambientIntensity: 0.8,
          sunColor: '#f7935a',
          sunIntensity: 2.4,
          sunPos: [35, 20, -25] as [number, number, number],
          fillColor: '#537a8c',
          fillIntensity: 0.65
        };
      case 'night':
        return {
          ambientColor: '#243b60',
          ambientIntensity: 1.35,
          sunColor: '#d6eaff',
          sunIntensity: 3.5,
          sunPos: [-55, 78, -45] as [number, number, number],
          fillColor: '#3c5f94',
          fillIntensity: 0.95
        };
      default: // day - BRIGHT VIBRANT SUNSHINE
        return {
          ambientColor: '#d6ecfa', // Soft sky blue ambient
          ambientIntensity: 1.1,
          sunColor: '#fff9ea',     // Warm golden sunlight
          sunIntensity: 2.9,
          sunPos: [45, 60, 35] as [number, number, number],
          fillColor: '#8ec5f5',    // Blue sky bounce light
          fillIntensity: 0.85
        };
    }
  }, [timeOfDay]);

  return (
    <>
      <ambientLight color={lighting.ambientColor} intensity={lighting.ambientIntensity} />

      {/* Primary directional sun/moon light with shadows */}
      <directionalLight
        position={lighting.sunPos}
        color={lighting.sunColor}
        intensity={lighting.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={180}
        shadow-camera-left={-65}
        shadow-camera-right={65}
        shadow-camera-top={65}
        shadow-camera-bottom={-65}
        shadow-bias={-0.0003}
      />

      {/* Sky fill bounce light */}
      <directionalLight
        position={[-lighting.sunPos[0], 24, -lighting.sunPos[2]]}
        color={lighting.fillColor}
        intensity={lighting.fillIntensity}
      />
    </>
  );
};
