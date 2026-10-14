import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export interface CableCarWaypoint {
  name: string;
  stationId: string;
  position: [number, number, number];
  stationPlatform: [number, number, number];
}

// 3 Connected Stations:
// 1. Welcome Plaza (Start/Main Spot)
// 2. Lakeside Pavilion (About Me)
// 3. Grand Valley Bridge (Experience)
export const CABLE_CAR_STATIONS: CableCarWaypoint[] = [
  {
    name: "FADHI'S WORLD Station",
    stationId: 'sanctuary',
    position: [6, 7.5, 36],
    stationPlatform: [6, 0.4, 36]
  },
  {
    name: 'Lakeside Pavilion Station (About Me)',
    stationId: 'about',
    position: [36, 8.2, 14],
    stationPlatform: [36, 0.5, 14]
  },
  {
    name: 'Valley Bridge Station (Experience)',
    stationId: 'experience',
    position: [4, 9.2, -34],
    stationPlatform: [4, 1.4, -34]
  }
];

interface CableCarSystemProps {
  isRiding: boolean;
  onToggleRide: (riding: boolean) => void;
  onCabinPositionUpdate?: (pos: THREE.Vector3, currentStationName: string) => void;
  playerNearStation: string | null;
}

export const CableCarSystem = ({
  isRiding,
  onToggleRide,
  onCabinPositionUpdate,
  playerNearStation
}: CableCarSystemProps) => {
  const cabinRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0); // 0 to 1 loop along the spline
  const pauseTimerRef = useRef(0);

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

  // Frame tick: smoothly animate cable car cabin along the aerial cable
  useFrame((_, delta) => {
    if (!cabinRef.current) return;

    // Pause briefly at each station for boarding / viewing
    if (pauseTimerRef.current > 0) {
      pauseTimerRef.current -= delta;
      return;
    }

    // Traverse speed
    const speed = 0.015; // Complete full scenic loop in ~65 seconds
    progressRef.current = (progressRef.current + delta * speed) % 1.0;

    const currentT = progressRef.current;
    const pos = cableCurve.getPointAt(currentT);
    const tangent = cableCurve.getTangentAt(currentT).normalize();

    // Position cabin so the roller pulley clamp at y=2.05 sits precisely on the cable
    cabinRef.current.position.set(pos.x, pos.y - 2.05, pos.z);

    // Keep cabin strictly upright with gravity - rotate yaw along cable path without inversion
    const headingY = Math.atan2(tangent.x, tangent.z);
    cabinRef.current.rotation.set(0, headingY, 0);

    // Detect if pausing at a station (around t = 0.0, 0.33, 0.66)
    let stationName = 'En Route Aerial Transit';
    if (Math.abs(currentT - 0.0) < 0.006) {
      stationName = "FADHI'S WORLD Station";
      pauseTimerRef.current = 4.0; // 4 second station stop
    } else if (Math.abs(currentT - 0.33) < 0.006) {
      stationName = 'Lakeside Pavilion Station (About Me)';
      pauseTimerRef.current = 4.5;
    } else if (Math.abs(currentT - 0.66) < 0.006) {
      stationName = 'Valley Bridge Station (Experience)';
      pauseTimerRef.current = 4.5;
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
        onBoard={() => onToggleRide(true)}
      />

      {/* Station 2: Lakeside Pavilion (About Me) */}
      <StationPlatform
        position={[36, 0.5, 14]}
        name="Lakeside Pavilion Station"
        subtitle="About Me • Route: To Valley Bridge (Experience)"
        isNear={playerNearStation === 'about'}
        isRiding={isRiding}
        onBoard={() => onToggleRide(true)}
      />

      {/* Station 3: Valley Bridge (Experience) */}
      <StationPlatform
        position={[4, 1.4, -34]}
        name="Valley Bridge Station"
        subtitle="Career & Experience • Route: Return to Welcome Plaza"
        isNear={playerNearStation === 'experience'}
        isRiding={isRiding}
        onBoard={() => onToggleRide(true)}
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
