import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getTerrainHeight } from './terrainUtils';

export type CableCarSpeed = 1 | 2 | 4;

export interface CableCarWaypoint {
  name: string;
  stationId: string;
  position: [number, number, number];
  stationPlatform: [number, number, number];
  description: string;
  t: number;
}

export interface StationArrivalInfo {
  stationIndex: number;
  currentStation: CableCarWaypoint;
  nextStation: CableCarWaypoint;
}

/**
 * 8 Connected Stations along the aerial cable encircling all 8 garden zones:
 * 1. Sanctuary Gate (Torii Portal)
 * 2. Lakeside Pavilion (About Me)
 * 3. Project Archipelago (Featured Works)
 * 4. Innovation Meadow (Core Skills)
 * 5. Moonlit Bridge (Career Experience)
 * 6. Knowledge Summit (Education)
 * 7. Cybersecurity Bastion (Security Labs)
 * 8. Communications Outpost (Connect Hub)
 */
export const CABLE_CAR_STATIONS: CableCarWaypoint[] = [
  {
    name: "01. FADHI'S WORLD Station",
    stationId: 'sanctuary',
    position: [5, 7.5, 40],
    stationPlatform: [5, 0.4, 40],
    description: "Welcome Gateway Portal • Main entry into Fadhi's World",
    t: 0.0
  },
  {
    name: '02. Lakeside Pavilion Station',
    stationId: 'about',
    position: [36, 8.0, 22],
    stationPlatform: [36, 0.5, 22],
    description: 'About Abdulla • Physics roots, developer background & vision',
    t: 0.125
  },
  {
    name: '03. Project Archipelago Station',
    stationId: 'projects',
    position: [36, 7.8, 0],
    stationPlatform: [36, 0.4, 0],
    description: 'Featured Works • Live web platforms, Tagspot, and live demos',
    t: 0.250
  },
  {
    name: '04. Innovation Meadow Station',
    stationId: 'skills',
    position: [26, 8.2, -22],
    stationPlatform: [26, 0.6, -22],
    description: 'Technical Matrix • Full-stack engineering & cybersecurity',
    t: 0.375
  },
  {
    name: '05. Valley Bridge Station',
    stationId: 'experience',
    position: [4, 9.0, -36],
    stationPlatform: [4, 1.4, -36],
    description: 'Career & Experience • Milestones, leadership & tech achievements',
    t: 0.500
  },
  {
    name: '06. Knowledge Summit Station',
    stationId: 'education',
    position: [-28, 9.2, -24],
    stationPlatform: [-28, 1.5, -24],
    description: 'Academic Background • Master of Computer Applications & Physics',
    t: 0.625
  },
  {
    name: '07. Cyber Bastion Station',
    stationId: 'labs',
    position: [-38, 8.5, 0],
    stationPlatform: [-38, 1.2, 0],
    description: 'Security Labs • Penetration testing, CTFs & isolated rigs',
    t: 0.750
  },
  {
    name: '08. Communications Outpost Station',
    stationId: 'contact',
    position: [-30, 7.8, 28],
    stationPlatform: [-30, 0.4, 28],
    description: 'Direct Contact • Inquiries, social profiles & verified resume',
    t: 0.875
  }
];

interface CableCarSystemProps {
  isRiding: boolean;
  onToggleRide: (riding: boolean) => void;
  onCabinPositionUpdate?: (pos: THREE.Vector3, currentStationName: string, headingY?: number) => void;
  playerNearStation: string | null;
  speedMultiplier?: CableCarSpeed;
  isStationPromptActive?: boolean;
  onStationArrival?: (info: StationArrivalInfo) => void;
  continueNudge?: number;
}

export const CableCarSystem = ({
  isRiding,
  onToggleRide,
  onCabinPositionUpdate,
  playerNearStation,
  speedMultiplier = 1,
  isStationPromptActive = false,
  onStationArrival,
  continueNudge = 0
}: CableCarSystemProps) => {
  const cabinRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0); // 0 to 1 loop along the spline
  const pauseTimerRef = useRef(0);
  const lastStationTriggeredRef = useRef<number | null>(null);
  const wasRidingRef = useRef(isRiding);

  // 16 3D points forming a closed aerial cable circuit connecting all 8 stations with towers
  const { cableCurve, cableTubeGeometry, pylonTowers } = useMemo(() => {
    const points = [
      new THREE.Vector3(5, 7.5, 40),     // Station 1: First Gate
      new THREE.Vector3(22, 11.5, 33),   // Tower 1-2
      new THREE.Vector3(36, 8.0, 22),    // Station 2: Pavilion
      new THREE.Vector3(38, 11.0, 11),   // Tower 2-3
      new THREE.Vector3(36, 7.8, 0),     // Station 3: Projects
      new THREE.Vector3(32, 11.5, -12),  // Tower 3-4
      new THREE.Vector3(26, 8.2, -22),   // Station 4: Skills
      new THREE.Vector3(16, 12.0, -32),  // Tower 4-5
      new THREE.Vector3(4, 9.0, -36),    // Station 5: Bridge
      new THREE.Vector3(-14, 12.5, -32), // Tower 5-6
      new THREE.Vector3(-28, 9.2, -24),  // Station 6: Summit
      new THREE.Vector3(-35, 12.0, -12), // Tower 6-7
      new THREE.Vector3(-38, 8.5, 0),    // Station 7: Bastion
      new THREE.Vector3(-36, 11.5, 15),  // Tower 7-8
      new THREE.Vector3(-30, 7.8, 28),   // Station 8: Outpost
      new THREE.Vector3(-16, 11.0, 36),  // Tower 8-1
    ];

    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.15);
    const tubeGeo = new THREE.TubeGeometry(curve, 240, 0.05, 8, true);

    const towers = [
      { pos: [22, 0, 33] as [number, number, number], height: 11.8 },
      { pos: [38, 0, 11] as [number, number, number], height: 11.2 },
      { pos: [32, 0, -12] as [number, number, number], height: 11.8 },
      { pos: [16, 0, -32] as [number, number, number], height: 12.2 },
      { pos: [-14, 0, -32] as [number, number, number], height: 12.8 },
      { pos: [-35, 0, -12] as [number, number, number], height: 12.2 },
      { pos: [-36, 0, 15] as [number, number, number], height: 11.8 },
      { pos: [-16, 0, 36] as [number, number, number], height: 11.2 },
    ];

    return { cableCurve: curve, cableTubeGeometry: tubeGeo, pylonTowers: towers };
  }, []);

  // When passenger clicks "Continue to Next Destination", nudge safely past current station
  useEffect(() => {
    if (continueNudge > 0) {
      progressRef.current = (progressRef.current + 0.02) % 1.0;
    }
  }, [continueNudge]);

  // When player freshly boards from ground, position cabin at their station
  useEffect(() => {
    if (!wasRidingRef.current && isRiding) {
      const stIdx = CABLE_CAR_STATIONS.findIndex((s) => s.stationId === playerNearStation);
      if (stIdx !== -1) {
        const stationT = CABLE_CAR_STATIONS[stIdx].t;
        progressRef.current = (stationT + 0.005) % 1.0;
        lastStationTriggeredRef.current = stIdx;
      }
    }
    wasRidingRef.current = isRiding;
  }, [isRiding, playerNearStation]);

  const handleDirectBoard = (idx: number) => {
    const stationT = CABLE_CAR_STATIONS[idx].t;
    progressRef.current = (stationT + 0.005) % 1.0;
    lastStationTriggeredRef.current = idx;
    onToggleRide(true);
  };

  // Frame tick: smoothly animate cable car cabin along the aerial cable
  useFrame((_, delta) => {
    if (!cabinRef.current) return;

    // A. If Riding and Station Arrival Prompt is active, hold cabin steady at station platform
    if (isRiding && isStationPromptActive) {
      const currentT = progressRef.current;
      const pos = cableCurve.getPointAt(currentT);
      const tangent = cableCurve.getTangentAt(currentT).normalize();
      cabinRef.current.position.set(pos.x, pos.y - 2.05, pos.z);
      const headingY = Math.atan2(tangent.x, tangent.z);
      cabinRef.current.rotation.set(0, headingY, 0);

      const stIdx = lastStationTriggeredRef.current ?? 0;
      const stationName = CABLE_CAR_STATIONS[stIdx]?.name || "Cable Car Station";
      if (onCabinPositionUpdate) {
        onCabinPositionUpdate(cabinRef.current.position, stationName);
      }
      return;
    }

    // B. If Empty/Scenic and pausing at station:
    if (!isRiding && pauseTimerRef.current > 0) {
      pauseTimerRef.current -= delta;
      return;
    }

    // Traverse speed scaled by rider's speed multiplier (1x, 2x, or 4x)
    const baseSpeed = 0.012 * (speedMultiplier || 1);
    const step = delta * baseSpeed;
    const prevT = progressRef.current;
    let nextT = (prevT + step) % 1.0;

    // Station Arrival Detection along the 8-station circuit:
    // Check if movement from prevT to nextT crossed any station's t
    let arrivedStationIdx: number | null = null;

    for (let i = 0; i < CABLE_CAR_STATIONS.length; i++) {
      const stT = CABLE_CAR_STATIONS[i].t;
      let crossed = false;

      if (stT === 0.0) {
        // Wrap around 1.0 -> 0.0
        if (nextT < prevT && (prevT > 0.96 || nextT >= 0.0)) {
          crossed = true;
        }
      } else {
        if (prevT < stT && nextT >= stT) {
          crossed = true;
        }
      }

      if (crossed && lastStationTriggeredRef.current !== i) {
        arrivedStationIdx = i;
        nextT = stT; // Snap precisely to station position
        break;
      }
    }

    progressRef.current = nextT;

    const currentT = progressRef.current;
    const pos = cableCurve.getPointAt(currentT);
    const tangent = cableCurve.getTangentAt(currentT).normalize();

    // Position cabin so the roller pulley clamp at y=2.05 sits precisely on the cable
    cabinRef.current.position.set(pos.x, pos.y - 2.05, pos.z);

    // Keep cabin strictly upright with gravity - rotate yaw along cable path without inversion
    const headingY = Math.atan2(tangent.x, tangent.z);
    cabinRef.current.rotation.set(0, headingY, 0);

    let stationName = 'En Route Aerial Circuit';

    if (arrivedStationIdx !== null) {
      const station = CABLE_CAR_STATIONS[arrivedStationIdx];
      stationName = station.name;
      lastStationTriggeredRef.current = arrivedStationIdx;

      if (isRiding) {
        // Passenger in transit has arrived at a station!
        const nextIdx = (arrivedStationIdx + 1) % CABLE_CAR_STATIONS.length;
        onStationArrival?.({
          stationIndex: arrivedStationIdx,
          currentStation: station,
          nextStation: CABLE_CAR_STATIONS[nextIdx]
        });
      } else {
        // Empty cabin pauses for 3.5 seconds
        pauseTimerRef.current = 3.5;
      }
    } else {
      // Clear trigger lock once cabin has moved away from the triggered station
      const lastIdx = lastStationTriggeredRef.current;
      if (lastIdx !== null) {
        const lastT = CABLE_CAR_STATIONS[lastIdx].t;
        const dist = Math.min(Math.abs(currentT - lastT), 1.0 - Math.abs(currentT - lastT));
        if (dist > 0.035) {
          lastStationTriggeredRef.current = null;
        }
      }
    }

    // Notify player controller of cabin position and heading when riding
    if (onCabinPositionUpdate) {
      onCabinPositionUpdate(cabinRef.current.position, stationName, headingY);
    }
  });

  return (
    <group name="cable-car-system">
      {/* 1. Heavy Aerial Steel Cable Loop */}
      <mesh geometry={cableTubeGeometry}>
        <meshStandardMaterial color="#2d3339" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* 2. Steel Suspension Pylon Towers placed between stations */}
      {pylonTowers.map((tower, idx) => (
        <CableTower key={idx} position={tower.pos} height={tower.height} />
      ))}

      {/* 3. 8 Station Boarding Platforms at All 8 Zones */}
      {CABLE_CAR_STATIONS.map((station, idx) => (
        <StationPlatform
          key={station.stationId}
          position={station.stationPlatform}
          name={station.name}
          subtitle={station.description}
          isNear={playerNearStation === station.stationId}
          isRiding={isRiding}
          onBoard={() => handleDirectBoard(idx)}
        />
      ))}

      {/* 4. The 3D Cable Car Gondola Cabin */}
      <group ref={cabinRef}>
        <CableCarCabin isRiding={isRiding} onExit={() => onToggleRide(false)} />
      </group>
    </group>
  );
};

// ==========================================
// 3D Cable Car Gondola Cabin Model
// ==========================================
const CableCarCabin = ({ isRiding, onExit }: { isRiding: boolean; onExit: () => void }) => {
  return (
    <group>
      {/* Cable Roller Clamp Wheels & Hanger Arm (Hanging upright from the cable at y=2.05) */}
      <group>
        {/* Dual Wheel Pulley Clamps Riding along the cable direction (Z-axis) */}
        <mesh position={[0, 2.05, 0.22]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
          <meshStandardMaterial color="#1f2429" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 2.05, -0.22]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
          <meshStandardMaterial color="#1f2429" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* Roller Housing Carrier Bracket */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.62]} />
          <meshStandardMaterial color="#2c333a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Vertical Structural Steel Suspension Hanger Beam */}
        <mesh position={[0, 1.48, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.05, 10]} />
          <meshStandardMaterial color="#2c333a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Roof Mounting Base Plaque */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.34, 0.08, 0.52]} />
          <meshStandardMaterial color="#1a2026" roughness={0.7} />
        </mesh>
      </group>

      {/* 2. Main Cabin Lower Hull Shell */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.58, 2.48]} />
        <meshStandardMaterial
          color="#ba2e20"
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* Lower Protective Trim Rub-Strip */}
      <mesh position={[0, -0.58, 0]} castShadow>
        <boxGeometry args={[1.78, 0.06, 2.54]} />
        <meshStandardMaterial color="#222830" roughness={0.8} />
      </mesh>

      {/* 3. Solid Structural Metal Corner Pillars */}
      {[-0.84, 0.84].map((x, i) =>
        [-1.21, 1.21].map((z, j) => (
          <mesh key={`pillar-${i}-${j}`} position={[x, 0.35, z]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#1f252d" roughness={0.7} metalness={0.5} />
          </mesh>
        ))
      )}

      {/* Side Door & Window Divider Posts */}
      {[-0.84, 0.84].map((x, i) => (
        <group key={`divider-${i}`}>
          <mesh position={[x, 0.35, -0.4]} castShadow>
            <boxGeometry args={[0.07, 0.72, 0.07]} />
            <meshStandardMaterial color="#1f252d" roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[x, 0.35, 0.4]} castShadow>
            <boxGeometry args={[0.07, 0.72, 0.07]} />
            <meshStandardMaterial color="#1f252d" roughness={0.7} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Front & Rear Window Center Dividers */}
      {[-1.21, 1.21].map((z, i) => (
        <mesh key={`front-divider-${i}`} position={[0, 0.35, z]} castShadow>
          <boxGeometry args={[0.07, 0.72, 0.07]} />
          <meshStandardMaterial color="#1f252d" roughness={0.7} metalness={0.5} />
        </mesh>
      ))}

      {/* Window Sill Upper Rail */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[1.78, 0.05, 2.54]} />
        <meshStandardMaterial color="#1f252d" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* 4. Clear Glass Window Panes */}
      <mesh position={[-0.83, 0.35, 0]}>
        <boxGeometry args={[0.02, 0.62, 2.36]} />
        <meshStandardMaterial
          color="#d0ebff"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.2}
          depthWrite={true}
        />
      </mesh>
      <mesh position={[0.83, 0.35, 0]}>
        <boxGeometry args={[0.02, 0.62, 2.36]} />
        <meshStandardMaterial
          color="#d0ebff"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.2}
          depthWrite={true}
        />
      </mesh>
      <mesh position={[0, 0.35, -1.2]}>
        <boxGeometry args={[1.6, 0.62, 0.02]} />
        <meshStandardMaterial
          color="#d0ebff"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.2}
          depthWrite={true}
        />
      </mesh>
      <mesh position={[0, 0.35, 1.2]}>
        <boxGeometry args={[1.6, 0.62, 0.02]} />
        <meshStandardMaterial
          color="#d0ebff"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.2}
          depthWrite={true}
        />
      </mesh>

      {/* 5. Solid Opaque Roof Structure */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.82, 0.08, 2.58]} />
        <meshStandardMaterial color="#1a2026" roughness={0.8} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[1.76, 0.14, 2.52]} />
        <meshStandardMaterial color="#ba2e20" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.91, 0]} castShadow>
        <boxGeometry args={[0.3, 0.06, 2.3]} />
        <meshStandardMaterial color="#1a2026" roughness={0.7} />
      </mesh>

      {/* 6. Interior Bench Seats & Floor */}
      <mesh position={[0, -0.38, -0.85]}>
        <boxGeometry args={[1.45, 0.32, 0.45]} />
        <meshStandardMaterial color="#36251b" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.38, 0.85]}>
        <boxGeometry args={[1.45, 0.32, 0.45]} />
        <meshStandardMaterial color="#36251b" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.58, 0]}>
        <boxGeometry args={[1.4, 0.02, 2.2]} />
        <meshStandardMaterial color="#283038" roughness={0.9} />
      </mesh>

      {/* Soft Interior Warm Glow Lamp */}
      <pointLight position={[0, 0.55, 0]} color="#fff3db" intensity={1.1} distance={4.0} />

      {/* 7. Passenger Seated Inside the Cabin (Visible through panoramic glass windows) */}
      {isRiding && <SeatedPassengerAvatar />}

      {/* Interactive 3D Label & Disembark Button */}
      {isRiding ? (
        <Html position={[0, 1.25, 0]} center distanceFactor={14}>
          <div className="cable-car-floating-hud">
            <span className="cable-car-title">🚠 Aerial Cable Car</span>
            <button
              type="button"
              className="cable-car-exit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
            >
              Exit to Ground Walk [E]
            </button>
          </div>
        </Html>
      ) : (
        <Html position={[0, 1.25, 0]} center distanceFactor={18}>
          <div className="scene-badge">
            <span className="badge-tag">CABLE CAR</span>
            <span className="badge-en">Aerial Gondola</span>
          </div>
        </Html>
      )}
    </group>
  );
};

// ==========================================
// Seated Passenger Traveler Avatar inside Cable Car
// ==========================================
const SeatedPassengerAvatar = () => {
  return (
    <group position={[0, -0.22, -0.68]} rotation={[0, 0, 0]}>
      {/* 1. Pelvis / Seat Contact */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.28]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>

      {/* 2. Thighs / Lap extending forward towards +Z */}
      <mesh position={[-0.11, 0.06, 0.18]} castShadow>
        <boxGeometry args={[0.13, 0.13, 0.3]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>
      <mesh position={[0.11, 0.06, 0.18]} castShadow>
        <boxGeometry args={[0.13, 0.13, 0.3]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>

      {/* 3. Lower Legs / Shins descending to floor */}
      <mesh position={[-0.11, -0.16, 0.32]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>
      <mesh position={[0.11, -0.16, 0.32]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>

      {/* 4. Boots resting flat on wooden cabin floor */}
      <mesh position={[-0.11, -0.32, 0.36]} castShadow>
        <boxGeometry args={[0.13, 0.08, 0.2]} />
        <meshStandardMaterial color="#211d1a" roughness={0.8} />
      </mesh>
      <mesh position={[0.11, -0.32, 0.36]} castShadow>
        <boxGeometry args={[0.13, 0.08, 0.2]} />
        <meshStandardMaterial color="#211d1a" roughness={0.8} />
      </mesh>

      {/* 5. Upright Torso & Traveler Robe */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.38, 10]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>

      {/* 6. Crimson Chest Sash / Belt */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.21, 0.08, 10]} />
        <meshStandardMaterial color="#b83328" roughness={0.6} />
      </mesh>

      {/* 7. Crimson Shoulder Scarf / Cloak */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.16, 10]} />
        <meshStandardMaterial color="#b83328" roughness={0.7} />
      </mesh>

      {/* 8. Resting Arms & Hands on Knees */}
      <mesh position={[-0.2, 0.16, 0.14]} rotation={[0.4, 0, -0.2]} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.08]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.16, 0.14]} rotation={[0.4, 0, 0.2]} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.08]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.14, 0.1, 0.26]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#d4b595" roughness={0.6} />
      </mesh>
      <mesh position={[0.14, 0.1, 0.26]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#d4b595" roughness={0.6} />
      </mesh>

      {/* 9. Head */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#d4b595" roughness={0.6} />
      </mesh>

      {/* 10. Conical Straw Traveler Hat (Kasa) */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <coneGeometry args={[0.38, 0.15, 12]} />
        <meshStandardMaterial color="#a88b63" roughness={0.85} />
      </mesh>

      {/* 11. Hip Lantern sitting on bench beside the traveler */}
      <group position={[0.34, 0.06, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.18, 8]} />
          <meshStandardMaterial
            color="#ffeed1"
            emissive="#ffb347"
            emissiveIntensity={1.9}
            roughness={0.4}
          />
        </mesh>
        <pointLight color="#ffb347" intensity={0.9} distance={2.5} decay={2} />
      </group>
    </group>
  );
};

// ==========================================
// Steel Support Pylon Tower
// ==========================================
const CableTower = ({ position, height = 12 }: { position: [number, number, number]; height?: number }) => {
  const groundY = useMemo(() => getTerrainHeight(position[0], position[2]), [position]);

  return (
    <group position={[position[0], groundY, position[2]]}>
      {/* Concrete Foundation Base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.6, 2.4]} />
        <meshStandardMaterial color="#474d49" roughness={0.9} />
      </mesh>

      {/* Main Steel Column */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.65, height, 8]} />
        <meshStandardMaterial color="#2f373d" roughness={0.7} metalness={0.7} />
      </mesh>

      {/* Crossarm T-Bar */}
      <mesh position={[0, height - 0.2, 0]} castShadow>
        <boxGeometry args={[3.8, 0.35, 0.35]} />
        <meshStandardMaterial color="#2f373d" roughness={0.7} metalness={0.7} />
      </mesh>

      {/* Cable Pulley Wheel Assemblies */}
      <mesh position={[-1.7, height - 0.2, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.15, 12]} />
        <meshStandardMaterial color="#1a1e22" metalness={0.9} />
      </mesh>
      <mesh position={[1.7, height - 0.2, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.15, 12]} />
        <meshStandardMaterial color="#1a1e22" metalness={0.9} />
      </mesh>
    </group>
  );
};

// ==========================================
// Station Boarding Platform
// ==========================================
interface StationPlatformProps {
  position: [number, number, number];
  name: string;
  subtitle: string;
  isNear: boolean;
  isRiding: boolean;
  onBoard: () => void;
}

const StationPlatform = ({
  position,
  name,
  subtitle,
  isNear,
  isRiding,
  onBoard
}: StationPlatformProps) => {
  const groundY = useMemo(() => getTerrainHeight(position[0], position[2]), [position]);

  return (
    <group position={[position[0], groundY, position[2]]}>
      {/* Stone Foundation Stairs */}
      <mesh position={[0, 0.18, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.36, 4.2]} />
        <meshStandardMaterial color="#383d3b" roughness={0.88} />
      </mesh>

      {/* Wooden Boarding Deck */}
      <mesh position={[0, 0.42, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.8, 0.12, 3.8]} />
        <meshStandardMaterial color="#4a3628" roughness={0.75} />
      </mesh>

      {/* Support Posts */}
      <mesh position={[-1.7, 1.8, -1.7]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 2.8, 8]} />
        <meshStandardMaterial color="#2d221a" roughness={0.8} />
      </mesh>
      <mesh position={[1.7, 1.8, -1.7]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 2.8, 8]} />
        <meshStandardMaterial color="#2d221a" roughness={0.8} />
      </mesh>

      {/* Station Canopy Roof */}
      <mesh position={[0, 3.2, -0.6]} castShadow>
        <boxGeometry args={[4.2, 0.15, 3.2]} />
        <meshStandardMaterial color="#1e252a" roughness={0.7} />
      </mesh>

      {/* Station Lantern */}
      <mesh position={[0, 2.6, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#ffeed1" emissive="#ffb347" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0, 2.5, 0.6]} color="#ffb347" intensity={1.2} distance={5} />

      {/* Station 3D Badge & Boarding Prompt */}
      <Html position={[0, 3.8, 0]} center distanceFactor={18}>
        <div className={`scene-badge ${isNear ? 'active' : ''}`}>
          <span className="badge-tag">CABLE CAR STATION</span>
          <span className="badge-en">{name}</span>
          <span className="badge-sub" style={{ fontSize: '10px', color: '#bae6fd', display: 'block', marginTop: '2px' }}>
            {subtitle}
          </span>
          {isNear && !isRiding && (
            <button
              type="button"
              className="station-board-btn"
              onClick={(e) => {
                e.stopPropagation();
                onBoard();
              }}
            >
              Board Cable Car [C]
            </button>
          )}
        </div>
      </Html>
    </group>
  );
};
