import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TraditionalCobbleLanternsProps {
  timeOfDay: 'day' | 'twilight' | 'night';
}

interface LanternItem {
  pos: [number, number, number];
  rotY?: number;
  type: 'tall_pagoda' | 'low_ground';
  hasPointLight?: boolean;
}

export const TraditionalCobbleLanterns = ({ timeOfDay }: TraditionalCobbleLanternsProps) => {
  const lightsGroupRef = useRef<THREE.Group>(null);

  const isNight = timeOfDay === 'night';
  const isTwilight = timeOfDay === 'twilight';

  // Luminous emissive intensity for lantern fire
  const emissiveIntensity = useMemo(() => {
    if (isNight) return 3.2;
    if (isTwilight) return 2.2;
    return 1.1;
  }, [isNight, isTwilight]);

  const lightIntensity = useMemo(() => {
    if (isNight) return 2.6;
    if (isTwilight) return 1.8;
    return 0.6;
  }, [isNight, isTwilight]);

  // Curated traditional land light placements lining all cobblestone pathways
  const lanterns: LanternItem[] = useMemo(() => [
    // -------------------------------------------------------------------------
    // 1. GRAND WELCOME AVENUE (South Gateway [0, 44] to Lake Edge [0, 20])
    // 5 Flanking Pairs lining both sides of the cobblestone avenue
    // -------------------------------------------------------------------------
    { pos: [-2.6, 0.38, 44], rotY: 0.3, type: 'tall_pagoda', hasPointLight: true },
    { pos: [2.6, 0.38, 44], rotY: -0.3, type: 'tall_pagoda', hasPointLight: false },
    { pos: [-2.4, 0.38, 38], rotY: 0.1, type: 'low_ground', hasPointLight: false },
    { pos: [2.4, 0.38, 38], rotY: -0.1, type: 'tall_pagoda', hasPointLight: true },
    { pos: [-2.6, 0.38, 32], rotY: 0.2, type: 'tall_pagoda', hasPointLight: true },
    { pos: [2.6, 0.38, 32], rotY: -0.2, type: 'low_ground', hasPointLight: false },
    { pos: [-2.4, 0.38, 26], rotY: 0.1, type: 'low_ground', hasPointLight: false },
    { pos: [2.6, 0.38, 26], rotY: -0.1, type: 'tall_pagoda', hasPointLight: true },
    { pos: [-2.6, 0.38, 20], rotY: 0.4, type: 'tall_pagoda', hasPointLight: true },
    { pos: [2.6, 0.38, 20], rotY: -0.4, type: 'tall_pagoda', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 2. EAST LAKESIDE PROMENADE (Leading to About Me Pavilion [42, 8])
    // -------------------------------------------------------------------------
    { pos: [7.5, 0.38, 21.5], rotY: 0.6, type: 'low_ground', hasPointLight: false },
    { pos: [15.0, 0.38, 18.0], rotY: 0.8, type: 'tall_pagoda', hasPointLight: true },
    { pos: [22.5, 0.38, 14.5], rotY: 0.7, type: 'low_ground', hasPointLight: false },
    { pos: [30.5, 0.42, 10.5], rotY: 0.9, type: 'tall_pagoda', hasPointLight: true },
    { pos: [37.0, 0.45, 7.5], rotY: 0.5, type: 'low_ground', hasPointLight: false },

    // Pavilion Terrace Courtyard
    { pos: [47.5, 0.48, 5.0], rotY: 0.2, type: 'tall_pagoda', hasPointLight: true },
    { pos: [48.0, 0.48, 13.5], rotY: -0.6, type: 'tall_pagoda', hasPointLight: false },
    { pos: [36.5, 0.48, 2.5], rotY: 1.1, type: 'low_ground', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 3. GRAND VALLEY BRIDGE (North River Canyon)
    // -------------------------------------------------------------------------
    { pos: [-2.5, 0.68, -28.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: true },
    { pos: [2.5, 0.68, -28.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: false },
    { pos: [-2.6, 1.85, -40.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: true },
    { pos: [2.6, 1.85, -40.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: false },
    { pos: [-2.5, 0.68, -52.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: true },
    { pos: [2.5, 0.68, -52.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 4. WATERFRONT ARCHIPELAGO & BOARDWALK ENTRANCE
    // -------------------------------------------------------------------------
    { pos: [-6.5, 0.38, 22.0], rotY: -0.5, type: 'tall_pagoda', hasPointLight: true },
    { pos: [-12.5, 0.34, 15.5], rotY: -0.7, type: 'low_ground', hasPointLight: false },
    { pos: [-18.5, 0.30, 8.0], rotY: -0.8, type: 'tall_pagoda', hasPointLight: true },
    { pos: [-22.5, 0.28, 0.5], rotY: -0.9, type: 'low_ground', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 5. NORTHWEST BASTION TRAIL (Leading to Cyber Fortress)
    // -------------------------------------------------------------------------
    { pos: [-16.0, 0.50, -8.0], rotY: 0.4, type: 'low_ground', hasPointLight: false },
    { pos: [-26.0, 0.90, -18.0], rotY: 0.5, type: 'tall_pagoda', hasPointLight: true },
    { pos: [-36.0, 1.30, -27.0], rotY: 0.6, type: 'tall_pagoda', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 6. NORTHEAST MOUNTAIN TRAIL (Leading to Knowledge Summit)
    // -------------------------------------------------------------------------
    { pos: [33.0, 1.05, -6.0], rotY: -0.3, type: 'low_ground', hasPointLight: false },
    { pos: [39.0, 2.10, -18.0], rotY: -0.4, type: 'tall_pagoda', hasPointLight: true },
    { pos: [44.0, 3.25, -30.0], rotY: -0.5, type: 'tall_pagoda', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 7. SOUTHWEST TRAIL (Leading to Communications Outpost)
    // -------------------------------------------------------------------------
    { pos: [-11.0, 0.36, 38.0], rotY: 0.0, type: 'low_ground', hasPointLight: false },
    { pos: [-22.0, 0.36, 38.0], rotY: 0.0, type: 'tall_pagoda', hasPointLight: true },
    { pos: [-32.0, 0.36, 38.0], rotY: 0.0, type: 'low_ground', hasPointLight: false },

    // -------------------------------------------------------------------------
    // 8. CABLE CAR BOARDING STATIONS
    // -------------------------------------------------------------------------
    { pos: [8.5, 0.42, 36.0], rotY: -0.4, type: 'tall_pagoda', hasPointLight: true },
    { pos: [38.5, 0.50, 16.0], rotY: 0.5, type: 'tall_pagoda', hasPointLight: true },
    { pos: [6.5, 1.45, -33.5], rotY: 0.2, type: 'tall_pagoda', hasPointLight: true }
  ], []);

  // Soft atmospheric candle flame flicker
  useFrame((state) => {
    if (!lightsGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    lightsGroupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.PointLight) {
        const offset = i * 1.37;
        const flicker = Math.sin(t * 3.8 + offset) * 0.18 + Math.cos(t * 7.9 + offset) * 0.08;
        child.intensity = Math.max(0.1, lightIntensity + flicker);
      }
    });
  });

  return (
    <group>
      {/* Group of active point lights casting warm golden pools on the cobblestones */}
      <group ref={lightsGroupRef}>
        {lanterns
          .filter((item) => item.hasPointLight)
          .map((item, idx) => (
            <pointLight
              key={`lantern-ptlight-${idx}`}
              position={[item.pos[0], item.pos[1] + (item.type === 'tall_pagoda' ? 1.05 : 0.45), item.pos[2]]}
              color="#ffab44"
              intensity={lightIntensity}
              distance={isNight ? 8.5 : 5.5}
              decay={2.0}
            />
          ))}
      </group>

      {/* Render all traditional lanterns */}
      {lanterns.map((item, idx) => {
        if (item.type === 'tall_pagoda') {
          return (
            <TallStonePagodaLantern
              key={`tall-lantern-${idx}`}
              position={item.pos}
              rotationY={item.rotY || 0}
              emissiveIntensity={emissiveIntensity}
            />
          );
        }
        return (
          <LowGroundCobbleLantern
            key={`low-lantern-${idx}`}
            position={item.pos}
            rotationY={item.rotY || 0}
            emissiveIntensity={emissiveIntensity}
          />
        );
      })}
    </group>
  );
};

// =========================================================================
// 1. Traditional Stone Pagoda Lantern (Tōrō / Garden Stone Lantern)
// =========================================================================
interface TallLanternProps {
  position: [number, number, number];
  rotationY: number;
  emissiveIntensity: number;
}

const TallStonePagodaLantern = ({ position, rotationY, emissiveIntensity }: TallLanternProps) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Octagonal Foundation Base Plinth (Kiso) */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.44, 0.2, 8]} />
        <meshStandardMaterial color="#474b48" roughness={0.92} />
      </mesh>

      {/* Step Tier */}
      <mesh position={[0, 0.23, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.36, 0.08, 8]} />
        <meshStandardMaterial color="#505451" roughness={0.9} />
      </mesh>

      {/* Tapered Carved Column / Shaft (Sao) */}
      <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.54, 8]} />
        <meshStandardMaterial color="#565a57" roughness={0.88} />
      </mesh>

      {/* Middle Platform Shelf (Chudai) with curved lotus flares */}
      <mesh position={[0, 0.84, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.26, 0.12, 8]} />
        <meshStandardMaterial color="#424643" roughness={0.9} />
      </mesh>

      {/* Carved Wooden/Stone Lattice Firebox Frame (Hibukuro) */}
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.36, 0.36, 8]} />
        <meshStandardMaterial color="#2d2f2d" roughness={0.85} />
      </mesh>

      {/* Glowing Warm Rice-Paper Windows (4 sides) */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.3, 8]} />
        <meshStandardMaterial
          color="#ffe7b8"
          emissive="#ff9b28"
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
        />
      </mesh>

      {/* Inner Glowing Candle / Amber Fire Core */}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color="#fff4dc" />
      </mesh>

      {/* Sweeping Hexagonal/Octagonal Pagoda Umbrella Roof (Kasa) */}
      <mesh position={[0, 1.34, 0]} castShadow>
        <coneGeometry args={[0.62, 0.22, 8]} />
        <meshStandardMaterial color="#363936" roughness={0.9} />
      </mesh>

      {/* Roof Crest Rim */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.64, 0.62, 0.04, 8]} />
        <meshStandardMaterial color="#2c2f2c" roughness={0.92} />
      </mesh>

      {/* Sacred Jewel Finial (Hoju / Sacred Flame) */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color="#ffb852"
          emissive="#ff8a15"
          emissiveIntensity={emissiveIntensity * 0.75}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

// =========================================================================
// 2. Traditional Low Cobblestone Ground Lantern (Andon / Pathway Light)
// =========================================================================
interface LowLanternProps {
  position: [number, number, number];
  rotationY: number;
  emissiveIntensity: number;
}

const LowGroundCobbleLantern = ({ position, rotationY, emissiveIntensity }: LowLanternProps) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stone Ground Slab */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.08, 0.42]} />
        <meshStandardMaterial color="#3a3d3a" roughness={0.92} />
      </mesh>

      {/* Dark Timber Corner Posts */}
      {[-0.17, 0.17].map((x, i) =>
        [-0.17, 0.17].map((z, j) => (
          <mesh key={`post-${i}-${j}`} position={[x, 0.24, z]} castShadow>
            <boxGeometry args={[0.04, 0.32, 0.04]} />
            <meshStandardMaterial color="#241e1b" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Radiant Translucent Shoji Paper Core */}
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.31, 0.3, 0.31]} />
        <meshStandardMaterial
          color="#ffebc2"
          emissive="#ff9822"
          emissiveIntensity={emissiveIntensity * 1.05}
          roughness={0.35}
        />
      </mesh>

      {/* Inner Flame Point */}
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Low Pagoda Timber Cap */}
      <mesh position={[0, 0.43, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.34, 0.12, 4]} />
        <meshStandardMaterial color="#28221f" roughness={0.85} />
      </mesh>
    </group>
  );
};
