import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

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

// 3 Connected Stations along the aerial cable:
// 1. Welcome Plaza (Start/Main Gateway)
// 2. Lakeside Pavilion (About Me)
// 3. Grand Valley Bridge (Experience)
export const CABLE_CAR_STATIONS: CableCarWaypoint[] = [
  {
    name: "FADHI'S WORLD Station",
    stationId: 'sanctuary',
    position: [6, 7.5, 36],
    stationPlatform: [6, 0.4, 36],
    description: "Welcome Gateway • Entry into Fadhi's World Zen 3D Universe",
    t: 0.0
  },
  {
    name: 'Lakeside Pavilion Station (About Me)',
    stationId: 'about',
    position: [36, 8.2, 14],
    stationPlatform: [36, 0.5, 14],
    description: "About Abdulla • Engineering mindset, skills, bio & vision",
    t: 0.3333
  },
  {
    name: 'Valley Bridge Station (Experience)',
    stationId: 'experience',
    position: [4, 9.2, -34],
    stationPlatform: [4, 1.4, -34],
    description: "Career & Experience • Milestones, leadership & tech achievements",
    t: 0.6667
  }
];

interface CableCarSystemProps {
  isRiding: boolean;
  onToggleRide: (riding: boolean) => void;
  onCabinPositionUpdate?: (pos: THREE.Vector3, currentStationName: string) => void;
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

  // Define 3D Catmull-Rom aerial cable curve through the 3 stations + towers
  const cableCurve = useMemo(() => {
    const p1 = new THREE.Vector3(6, 7.5, 36);   // Station 1: Welcome Plaza
    const t1 = new THREE.Vector3(22, 13.5, 26); // Tower 1
    const p2 = new THREE.Vector3(36, 8.2, 14);  // Station 2: About Me (Pavilion)
    const t2 = new THREE.Vector3(24, 14.2, -10);// Tower 2
    const p3 = new THREE.Vector3(4, 9.2, -34);  // Station 3: Experience (Bridge)
    const t3 = new THREE.Vector3(-14, 13.0, 0); // Tower 3 (Loop back across lake)

    // Closed loop circuit: Welcome -> About Me -> Experience -> Return
    return new THREE.CatmullRomCurve3([p1, t1, p2, t2, p3, t3], true, 'centripetal', 0.15);
  }, []);

  // Cable geometry
  const cableTubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(cableCurve, 160, 0.05, 8, true);
  }, [cableCurve]);

  // If user chooses to continue to next destination, advance past threshold
  useEffect(() => {
    if (continueNudge > 0) {
      progressRef.current = (progressRef.current + 0.014) % 1.0;
    }
  }, [continueNudge]);

  // When player freshly boards from ground, position cabin at their station
  useEffect(() => {
    if (!wasRidingRef.current && isRiding) {
      const stIdx = CABLE_CAR_STATIONS.findIndex((s) => s.stationId === playerNearStation);
      if (stIdx !== -1) {
        const stationT = CABLE_CAR_STATIONS[stIdx].t;
        progressRef.current = (stationT + 0.008) % 1.0;
        lastStationTriggeredRef.current = stIdx;
      }
    }
    wasRidingRef.current = isRiding;
  }, [isRiding, playerNearStation]);

  const handleDirectBoard = (idx: number) => {
    const stationT = CABLE_CAR_STATIONS[idx].t;
    progressRef.current = (stationT + 0.008) % 1.0;
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
    const baseSpeed = 0.014 * (speedMultiplier || 1);
    progressRef.current = (progressRef.current + delta * baseSpeed) % 1.0;

    const currentT = progressRef.current;
    const pos = cableCurve.getPointAt(currentT);
    const tangent = cableCurve.getTangentAt(currentT).normalize();

    // Position cabin so the roller pulley clamp at y=2.05 sits precisely on the cable
    cabinRef.current.position.set(pos.x, pos.y - 2.05, pos.z);

    // Keep cabin strictly upright with gravity - rotate yaw along cable path without inversion
    const headingY = Math.atan2(tangent.x, tangent.z);
    cabinRef.current.rotation.set(0, headingY, 0);

    // Station Arrival Detection along the closed loop:
    // Station 0: t ~ 0.0 (and wraps at 1.0)
    // Station 1: t ~ 0.3333
    // Station 2: t ~ 0.6667
    let arrivedStationIdx: number | null = null;
    if (currentT < 0.007 || currentT > 0.993) {
      arrivedStationIdx = 0;
    } else if (Math.abs(currentT - 0.3333) < 0.007) {
      arrivedStationIdx = 1;
    } else if (Math.abs(currentT - 0.6667) < 0.007) {
      arrivedStationIdx = 2;
    }

    let stationName = 'En Route Aerial Transit';

    if (arrivedStationIdx !== null) {
      const station = CABLE_CAR_STATIONS[arrivedStationIdx];
      stationName = station.name;

      if (lastStationTriggeredRef.current !== arrivedStationIdx) {
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
          // Empty cabin pauses for 4.2 seconds
          pauseTimerRef.current = 4.2;
        }
      }
    } else {
      // Reset trigger lock once cabin has moved away from all stations
      const dist0 = Math.min(currentT, 1.0 - currentT);
      const dist1 = Math.abs(currentT - 0.3333);
      const dist2 = Math.abs(currentT - 0.6667);
      if (dist0 > 0.025 && dist1 > 0.025 && dist2 > 0.025) {
        lastStationTriggeredRef.current = null;
      }
    }

    // Notify player controller of cabin position when riding
    if (onCabinPositionUpdate) {
      onCabinPositionUpdate(cabinRef.current.position, stationName);
    }
  });

  return (
    <group>
      {/* 1. Heavy Aerial Steel Cable Loop */}
      <mesh geometry={cableTubeGeometry}>
        <meshStandardMaterial color="#2d3339" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* 2. Steel Suspension Pylon Towers */}
      <CableTower position={[22, 0.3, 26]} height={14.5} />
      <CableTower position={[24, 0.4, -10]} height={15.2} />
      <CableTower position={[-14, 0.2, 0]} height={14.0} />

      {/* 3. Station Platforms */}
      {/* Station 1: FADHI'S WORLD Gateway */}
      <StationPlatform
        position={[6, 0.4, 36]}
        name="FADHI'S WORLD Station"
        subtitle="Route: To Lakeside Pavilion (About Me)"
        isNear={playerNearStation === 'sanctuary'}
        isRiding={isRiding}
        onBoard={() => handleDirectBoard(0)}
      />

      {/* Station 2: Lakeside Pavilion (About Me) */}
      <StationPlatform
        position={[36, 0.5, 14]}
        name="Lakeside Pavilion Station"
        subtitle="About Me • Route: To Valley Bridge (Experience)"
        isNear={playerNearStation === 'about'}
        isRiding={isRiding}
        onBoard={() => handleDirectBoard(1)}
      />

      {/* Station 3: Valley Bridge (Experience) */}
      <StationPlatform
        position={[4, 1.4, -34]}
        name="Valley Bridge Station"
        subtitle="Career & Experience • Route: Return to Welcome Plaza"
        isNear={playerNearStation === 'experience'}
        isRiding={isRiding}
        onBoard={() => handleDirectBoard(2)}
      />

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
          <boxGeometry args={[0.34, 0.08, 0.34]} />
          <meshStandardMaterial color="#ba2e20" roughness={0.5} />
        </mesh>
      </group>

      {/* Main Gondola Body Shell (Solid, Non-Transparent) */}
      {/* 1. Heavy Lower Chassis / Base Skirt */}
      <mesh position={[0, -0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.76, 0.16, 2.52]} />
        <meshStandardMaterial color="#1a2026" roughness={0.85} metalness={0.4} />
      </mesh>

      {/* 2. Solid Opaque Lower Body Walls (Vermilion / Crimson Red) */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.74, 0.62, 2.5]} />
        <meshStandardMaterial color="#ba2e20" roughness={0.45} metalness={0.25} />
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

      {/* 4. Individual Clear Glass Window Panes (Recessed inside the solid frames) */}
      {/* Left & Right Side Glass Panes */}
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
      {/* Front & Rear Window Glass Panes */}
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
      {/* Roof Eaves Beam */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.82, 0.08, 2.58]} />
        <meshStandardMaterial color="#1a2026" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Curved Aerodynamic Roof Cap */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[1.76, 0.14, 2.52]} />
        <meshStandardMaterial color="#ba2e20" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Roof Center Ridge Bar */}
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
      {/* Interior Floor Mat */}
      <mesh position={[0, -0.58, 0]}>
        <boxGeometry args={[1.4, 0.02, 2.2]} />
        <meshStandardMaterial color="#283038" roughness={0.9} />
      </mesh>

      {/* Soft Interior Warm Glow Lamp */}
      <pointLight position={[0, 0.55, 0]} color="#fff3db" intensity={1.1} distance={4.0} />

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
// Steel Support Pylon Tower
// ==========================================
const CableTower = ({ position, height = 15 }: { position: [number, number, number]; height?: number }) => {
  return (
    <group position={position}>
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
  return (
    <group position={position}>
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
              Board Cable Car [E]
            </button>
          )}
        </div>
      </Html>
    </group>
  );
};
