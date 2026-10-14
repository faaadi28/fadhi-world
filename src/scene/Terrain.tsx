import { useMemo } from 'react';
import * as THREE from 'three';
import { getTerrainHeight } from './terrainUtils';

interface TerrainProps {
  timeOfDay?: 'day' | 'twilight' | 'night';
}

export const Terrain = ({ timeOfDay = 'day' }: TerrainProps) => {
  // Generate expansive organic open world ground geometry (160 x 160 units)
  const { geometry, mossGeometry } = useMemo(() => {
    const size = 160;
    const segments = 120;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);
    }

    geo.computeVertexNormals();

    // Secondary lush grass / moss layer
    const mossGeo = geo.clone();

    return { geometry: geo, mossGeometry: mossGeo };
  }, []);

  // Material colors adapting to Day / Twilight / Night
  const terrainColors = useMemo(() => {
    switch (timeOfDay) {
      case 'night':
        return {
          soil: '#18242f',      // Moonlit slate bedrock
          grass: '#22463e',     // Moonlit teal/emerald grass (visible & clear, never pitch black)
          path: '#52657b',      // Bright moonlit cobblestone (catches moonlight & amber lantern fire)
          curb: '#3c4c5e',      // Cobblestone curb stone border
          terrace: '#45566b'    // Moonlit gravel terrace
        };
      case 'twilight':
        return {
          soil: '#28201a',
          grass: '#3e5230',
          path: '#6e5e50',
          curb: '#524438',
          terrace: '#665c52'
        };
      default: // day - VIBRANT LUSH GREEN FIELDS
        return {
          soil: '#2c3a28',
          grass: '#427036',     // Fresh green meadow grass
          path: '#948774',      // Warm sunlit stone trail
          curb: '#756858',
          terrace: '#878072'
        };
    }
  }, [timeOfDay]);

  return (
    <group position={[0, -0.05, 0]}>
      {/* 1. Base Terrain Ground */}
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          color={terrainColors.soil}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* 2. Lush Green Grass & Meadow Layer */}
      <mesh geometry={mossGeometry} position={[0, 0.025, 0]} receiveShadow>
        <meshStandardMaterial
          color={terrainColors.grass}
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Grand Entrance Avenue (South: Welcome Plaza [0, 42] to Lake [0, 24]) */}
      <mesh position={[0, 0.38, 34]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 22, 16, 16]} />
        <meshStandardMaterial color={terrainColors.path} roughness={0.9} />
      </mesh>
      {/* Cobblestone Stone Curbs along Grand Entrance Avenue */}
      <mesh position={[-2.15, 0.40, 34]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.1, 22]} />
        <meshStandardMaterial color={terrainColors.curb} roughness={0.88} />
      </mesh>
      <mesh position={[2.15, 0.40, 34]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.1, 22]} />
        <meshStandardMaterial color={terrainColors.curb} roughness={0.88} />
      </mesh>

      {/* 4. East Promenade (Leading toward Lakeside Pavilion [42, 8]) */}
      <mesh position={[22, 0.34, 16]} rotation={[-Math.PI / 2, 0, -0.6]} receiveShadow>
        <planeGeometry args={[3.6, 32, 16, 16]} />
        <meshStandardMaterial color={terrainColors.path} roughness={0.9} />
      </mesh>

      {/* Raked sand / gravel terrace surrounding Lakeside Pavilion */}
      <mesh position={[42, 0.48, 8]} rotation={[-Math.PI / 2, 0, 0.15]} receiveShadow>
        <planeGeometry args={[16, 14, 24, 24]} />
        <meshStandardMaterial color={terrainColors.terrace} roughness={0.95} />
      </mesh>

      {/* 5. Northeast Mountain Trail (Leading up to Knowledge Summit [45, -38]) */}
      <mesh position={[43, 1.8, -16]} rotation={[-Math.PI / 2, 0, 0.05]} receiveShadow>
        <planeGeometry args={[3.2, 36, 16, 16]} />
        <meshStandardMaterial color={terrainColors.path} roughness={0.94} />
      </mesh>

      {/* 6. Northwest Bastion Highway (Leading to Cyber Fortress [-42, -34]) */}
      <mesh position={[-30, 0.8, -20]} rotation={[-Math.PI / 2, 0, 0.7]} receiveShadow>
        <planeGeometry args={[3.8, 34, 16, 16]} />
        <meshStandardMaterial color={terrainColors.path} roughness={0.92} />
      </mesh>

      {/* 7. Southwest Trail (Leading to Communications Outpost [-38, 38]) */}
      <mesh position={[-20, 0.35, 38]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.4, 28, 16, 16]} />
        <meshStandardMaterial color={terrainColors.path} roughness={0.92} />
      </mesh>

      {/* Natural organic boulder landmarks spaced comfortably along trails */}
      <Boulder position={[-6, 0.2, 24]} scale={[2.2, 1.4, 1.8]} rotation={[0.2, 0.8, -0.1]} />
      <Boulder position={[8, 0.2, 26]} scale={[1.8, 1.1, 1.5]} rotation={[-0.1, 1.2, 0.3]} />
      <Boulder position={[28, 0.35, 22]} scale={[2.4, 1.6, 2.0]} rotation={[0.3, -0.4, 0.1]} />
      <Boulder position={[52, 0.6, 12]} scale={[2.0, 1.3, 1.7]} rotation={[-0.2, 0.5, 0.2]} />
      <Boulder position={[-24, 0.3, 16]} scale={[2.6, 1.7, 2.2]} rotation={[0.1, -0.9, -0.2]} />
      <Boulder position={[-38, 0.8, -12]} scale={[3.2, 2.0, 2.8]} rotation={[0.3, 0.4, -0.2]} />
      <Boulder position={[38, 2.4, -30]} scale={[2.8, 1.8, 2.4]} rotation={[-0.2, -0.6, 0.1]} />
      <Boulder position={[-14, 0.6, -34]} scale={[2.4, 1.5, 2.0]} rotation={[0.1, 0.5, 0.3]} />
      <Boulder position={[14, 0.6, -34]} scale={[2.2, 1.4, 1.9]} rotation={[-0.2, 0.4, -0.1]} />
    </group>
  );
};

// Weathered natural boulder with moss cap
const Boulder = ({
  position,
  scale,
  rotation
}: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#3e4340"
          roughness={0.88}
          metalness={0.08}
          flatShading
        />
      </mesh>
      <mesh position={[0, 0.4, 0]} scale={[0.95, 0.65, 0.95]} receiveShadow>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#2e4c36"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
};
