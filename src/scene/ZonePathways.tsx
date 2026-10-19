import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTerrainHeight } from './terrainUtils';

interface ZonePathwaysProps {
  timeOfDay?: 'day' | 'twilight' | 'night';
}

/**
 * 22 Waypoints forming a continuous scenic circular loop around the central pond,
 * passing directly through all 8 portfolio zones in sequential order.
 */
const CIRCULAR_ROUTE_POINTS: [number, number][] = [
  // Zone 1: First Gate (South Entrance Portal)
  [0, 42],
  [11, 37],
  [21, 31],
  [29, 25],
  // Zone 2: Lakeside Pavilion (East Shore)
  [34, 20],
  [36, 10],
  // Zone 3: Project Archipelago (East Waterfront)
  [34, 0],
  [32, -12],
  // Zone 4: Innovation Meadow (Northeast Shore)
  [24, -22],
  [16, -30],
  [8, -35],
  // Zone 5: Grand Valley Bridge (North Entrance)
  [0, -38],
  [-8, -35],
  [-16, -30],
  // Zone 6: Knowledge Summit (Northwest Shore)
  [-26, -24],
  [-32, -14],
  // Zone 7: Cybersecurity Bastion (West Shore)
  [-36, 0],
  [-34, 14],
  [-31, 22],
  // Zone 8: Connection Shrine (Southwest Hub)
  [-28, 28],
  [-20, 36],
  [-10, 40],
];

/**
 * Short branch connectors from the circular promenade directly to the landmark structures.
 */
interface ConnectorDef {
  id: string;
  from: [number, number];
  to: [number, number];
  width: number;
}

const CONNECTORS: ConnectorDef[] = [
  { id: 'gate', from: [0, 36], to: [0, 42], width: 4.2 },
  { id: 'pavilion', from: [33, 19], to: [38, 20], width: 3.4 },
  { id: 'projects', from: [33, 0], to: [35, 0], width: 3.4 },
  { id: 'skills', from: [23, -22], to: [26, -24], width: 3.2 },
  { id: 'bridge', from: [0, -36], to: [0, -39], width: 3.4 },
  { id: 'summit', from: [-25, -23], to: [-28, -26], width: 3.2 },
  { id: 'labs', from: [-35, 1], to: [-39, 0], width: 3.2 },
  { id: 'contact', from: [-27, 27], to: [-31, 29], width: 3.2 },
];

/**
 * 8 Zone Arrival Plazas on the circular promenade.
 */
interface ZonePlazaDef {
  zoneId: string;
  name: string;
  position: [number, number];
  color: string;
  radius: number;
}

const ZONE_PLAZAS: ZonePlazaDef[] = [
  { zoneId: 'sanctuary', name: '01 First Gate', position: [0, 42], color: '#f59e0b', radius: 4.2 },
  { zoneId: 'about', name: '02 Lakeside Pavilion', position: [34, 20], color: '#10b981', radius: 3.8 },
  { zoneId: 'projects', name: '03 Project Archipelago', position: [34, 0], color: '#3b82f6', radius: 3.8 },
  { zoneId: 'skills', name: '04 Innovation Meadow', position: [24, -22], color: '#8b5cf6', radius: 3.8 },
  { zoneId: 'experience', name: '05 Moonlit Bridge', position: [0, -38], color: '#ef4444', radius: 3.8 },
  { zoneId: 'education', name: '06 Knowledge Summit', position: [-26, -24], color: '#06b6d4', radius: 3.8 },
  { zoneId: 'labs', name: '07 Security Bastion', position: [-36, 0], color: '#6366f1', radius: 3.8 },
  { zoneId: 'contact', name: '08 Connection Shrine', position: [-28, 28], color: '#22c55e', radius: 3.8 },
];

export const ZonePathways = ({ timeOfDay = 'day' }: ZonePathwaysProps) => {
  // Adaptive color palette based on time of day
  const colors = useMemo(() => {
    switch (timeOfDay) {
      case 'night':
        return {
          path: '#52657b',      // Moonlit slate cobblestone
          curb: '#273444',      // Deep charcoal granite curb
          plaza: '#48586c',
          pebble: '#67e8f9',
          pebbleEmissive: '#06b6d4',
          emissiveIntensity: 0.95,
        };
      case 'twilight':
        return {
          path: '#786656',      // Warm twilight amber cobblestone
          curb: '#382c23',      // Dark cedar stone curb
          plaza: '#6d5a4a',
          pebble: '#fbbf24',
          pebbleEmissive: '#f59e0b',
          emissiveIntensity: 0.75,
        };
      default: // day
        return {
          path: '#a89884',      // Sunlit warm sandstone cobblestone (crisp contrast against grass)
          curb: '#463c32',      // Weathered granite curb
          plaza: '#988975',
          pebble: '#fed7aa',
          pebbleEmissive: '#d97706',
          emissiveIntensity: 0.45,
        };
    }
  }, [timeOfDay]);

  // Generate continuous terrain-conforming circular ribbon geometry & stone curbs
  const { pathGeo, leftCurbGeo, rightCurbGeo, pebblePositions } = useMemo(() => {
    const pts = CIRCULAR_ROUTE_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');

    const sampleCount = 200;
    const rawPoints = curve.getPoints(sampleCount);

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const leftCurbVerts: number[] = [];
    const leftCurbIndices: number[] = [];
    const rightCurbVerts: number[] = [];
    const rightCurbIndices: number[] = [];

    const pebbles: [number, number, number][] = [];

    const W = 3.6;          // Path width in meters
    const curbW = 0.22;     // Curb border width in meters

    for (let i = 0; i <= sampleCount; i++) {
      const idx = i % sampleCount;
      const pt = rawPoints[idx];
      const ptNext = rawPoints[(idx + 1) % sampleCount];
      const ptPrev = rawPoints[(idx - 1 + sampleCount) % sampleCount];

      // Tangent vector in XZ plane
      const dx = ptNext.x - ptPrev.x;
      const dz = ptNext.z - ptPrev.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;

      // Coordinates across path cross-section
      const xL = pt.x + nx * (W / 2);
      const zL = pt.z + nz * (W / 2);
      const yL = getTerrainHeight(xL, zL) + 0.08;

      const xR = pt.x - nx * (W / 2);
      const zR = pt.z - nz * (W / 2);
      const yR = getTerrainHeight(xR, zR) + 0.08;

      const xC = pt.x;
      const zC = pt.z;
      const yC = getTerrainHeight(xC, zC) + 0.095; // Subtle crown camber in center

      vertices.push(xL, yL, zL);
      vertices.push(xC, yC, zC);
      vertices.push(xR, yR, zR);

      const v = i * 0.45;
      uvs.push(0.0, v);
      uvs.push(0.5, v);
      uvs.push(1.0, v);

      // Left curb outer & inner
      const xL_out = xL + nx * curbW;
      const zL_out = zL + nz * curbW;
      const yL_out = getTerrainHeight(xL_out, zL_out) + 0.12;
      leftCurbVerts.push(xL_out, yL_out, zL_out);
      leftCurbVerts.push(xL, yL + 0.035, zL);

      // Right curb inner & outer
      const xR_out = xR - nx * curbW;
      const zR_out = zR - nz * curbW;
      const yR_out = getTerrainHeight(xR_out, zR_out) + 0.12;
      rightCurbVerts.push(xR, yR + 0.035, zR);
      rightCurbVerts.push(xR_out, yR_out, zR_out);

      // Add guide pebble every 3 samples
      if (i % 3 === 0 && i < sampleCount) {
        pebbles.push([xL + nx * 0.08, yL + 0.04, zL + nz * 0.08]);
        pebbles.push([xR - nx * 0.08, yR + 0.04, zR - nz * 0.08]);
      }

      if (i < sampleCount) {
        const row = i * 3;
        const nextRow = (i + 1) * 3;

        // Left quad (2 triangles)
        indices.push(row, nextRow, row + 1);
        indices.push(row + 1, nextRow, nextRow + 1);

        // Right quad (2 triangles)
        indices.push(row + 1, nextRow + 1, row + 2);
        indices.push(row + 2, nextRow + 1, nextRow + 2);

        // Curbs indices
        const cRow = i * 2;
        const cNext = (i + 1) * 2;
        leftCurbIndices.push(cRow, cNext, cRow + 1);
        leftCurbIndices.push(cRow + 1, cNext, cNext + 1);

        rightCurbIndices.push(cRow, cNext, cRow + 1);
        rightCurbIndices.push(cRow + 1, cNext, cNext + 1);
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    pGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    pGeo.setIndex(indices);
    pGeo.computeVertexNormals();

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.Float32BufferAttribute(leftCurbVerts, 3));
    lGeo.setIndex(leftCurbIndices);
    lGeo.computeVertexNormals();

    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightCurbVerts, 3));
    rGeo.setIndex(rightCurbIndices);
    rGeo.computeVertexNormals();

    return { pathGeo: pGeo, leftCurbGeo: lGeo, rightCurbGeo: rGeo, pebblePositions: pebbles };
  }, []);

  return (
    <group name="circular-promenade-footpath">
      {/* 1. Main Continuous Circular Cobblestone Promenade */}
      <mesh geometry={pathGeo} receiveShadow>
        <meshStandardMaterial
          color={colors.path}
          roughness={0.88}
          metalness={0.04}
          polygonOffset
          polygonOffsetFactor={-3}
          polygonOffsetUnits={-3}
        />
      </mesh>

      {/* 2. Raised Stone Curbs (Left & Right Borders) */}
      <mesh geometry={leftCurbGeo} castShadow receiveShadow>
        <meshStandardMaterial color={colors.curb} roughness={0.9} />
      </mesh>
      <mesh geometry={rightCurbGeo} castShadow receiveShadow>
        <meshStandardMaterial color={colors.curb} roughness={0.9} />
      </mesh>

      {/* 3. Branch Connectors from Promenade to Landmark Entrances */}
      {CONNECTORS.map((c) => (
        <ConnectorPathway key={c.id} connector={c} color={colors.path} curbColor={colors.curb} />
      ))}

      {/* 4. 8 Circular Arrival Plazas on the Promenade */}
      {ZONE_PLAZAS.map((plaza) => (
        <ZoneArrivalPlaza key={plaza.zoneId} plaza={plaza} baseColor={colors.plaza} />
      ))}

      {/* 5. Glowing Guide Stones / Pebbles along Curbs */}
      <GuidePebbles positions={pebblePositions} color={colors.pebble} emissive={colors.pebbleEmissive} intensity={colors.emissiveIntensity} />

      {/* 6. Zone Entrance Beacons with Pulsing Wave Rings */}
      {ZONE_PLAZAS.map((plaza) => (
        <ZonePromenadeBeacon key={plaza.zoneId} position={plaza.position} color={plaza.color} />
      ))}
    </group>
  );
};

/**
 * Renders a subdivided branch connector that hugs the terrain contours.
 */
const ConnectorPathway = ({ connector, color, curbColor }: { connector: ConnectorDef; color: string; curbColor: string }) => {
  const { pathGeo } = useMemo(() => {
    const steps = 10;
    const dx = connector.to[0] - connector.from[0];
    const dz = connector.to[1] - connector.from[1];
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const W = connector.width;

    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = connector.from[0] + dx * t;
      const cz = connector.from[1] + dz * t;

      const xL = cx + nx * (W / 2);
      const zL = cz + nz * (W / 2);
      const yL = getTerrainHeight(xL, zL) + 0.082;

      const xR = cx - nx * (W / 2);
      const zR = cz - nz * (W / 2);
      const yR = getTerrainHeight(xR, zR) + 0.082;

      vertices.push(xL, yL, zL);
      vertices.push(xR, yR, zR);

      if (i < steps) {
        const row = i * 2;
        indices.push(row, row + 2, row + 1);
        indices.push(row + 1, row + 2, row + 3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return { pathGeo: geo };
  }, [connector]);

  return (
    <mesh geometry={pathGeo} receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.88}
        polygonOffset
        polygonOffsetFactor={-3}
        polygonOffsetUnits={-3}
      />
    </mesh>
  );
};

/**
 * Circular stone arrival plaza at each zone on the circular promenade.
 */
const ZoneArrivalPlaza = ({ plaza, baseColor }: { plaza: ZonePlazaDef; baseColor: string }) => {
  const groundY = useMemo(
    () => getTerrainHeight(plaza.position[0], plaza.position[1]) + 0.084,
    [plaza.position]
  );

  return (
    <group position={[plaza.position[0], groundY, plaza.position[1]]}>
      {/* Stone Plaza Landing Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[plaza.radius, 32]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.86}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* Decorative Outer Stone Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[plaza.radius - 0.28, plaza.radius, 32]} />
        <meshStandardMaterial color="#362f28" roughness={0.9} />
      </mesh>

      {/* Inscribed Glowing Emblem Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[plaza.radius * 0.65, plaza.radius * 0.72, 32]} />
        <meshBasicMaterial color={plaza.color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/**
 * Pulsing Light Beacon and Wave Ring standing on the promenade at each zone.
 */
const ZonePromenadeBeacon = ({ position, color }: { position: [number, number]; color: string }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const groundY = useMemo(
    () => getTerrainHeight(position[0], position[1]) + 0.088,
    [position]
  );

  const phase = position[0] * 0.08 + position[1] * 0.06;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.7 + 0.3 * Math.sin(t * 1.8 + phase);

    if (ringRef.current) {
      const progress = ((t * 0.25 + phase) % 1.0);
      const scale = 1.0 + progress * 2.8;
      ringRef.current.scale.set(scale, 1, scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1.0 - progress);
    }

    if (orbRef.current) {
      orbRef.current.scale.setScalar(0.9 + 0.2 * pulse);
      (orbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 2.2;
    }

    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + 0.15 * pulse;
    }
  });

  return (
    <group position={[position[0], groundY, position[1]]}>
      {/* Expanding ground wave ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.2, 2.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Static luminous center disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Vertical translucent beacon beam */}
      <mesh ref={beamRef} position={[0, 5.5, 0]}>
        <cylinderGeometry args={[0.08, 0.26, 11, 12, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Radiant Floating Orb */}
      <mesh ref={orbRef} position={[0, 11.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} />
      </mesh>

      {/* Beacon Point Light */}
      <pointLight color={color} intensity={2.8} distance={14} decay={2} position={[0, 11, 0]} />
    </group>
  );
};

/**
 * Instanced glowing guide pebbles lining the circular promenade curbs.
 */
const GuidePebbles = ({
  positions,
  color,
  emissive,
  intensity
}: {
  positions: [number, number, number][];
  color: string;
  emissive: string;
  intensity: number;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    if (!meshRef.current || positions.length === 0) return;
    const dummy = new THREE.Object3D();
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      const scale = 0.85 + (i % 5) * 0.05;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow>
      <sphereGeometry args={[0.11, 6, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={intensity}
        roughness={0.5}
      />
    </instancedMesh>
  );
};
