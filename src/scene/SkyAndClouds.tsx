import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

interface SkyAndCloudsProps {
  timeOfDay: 'day' | 'twilight' | 'night';
}

export const SkyAndClouds = ({ timeOfDay }: SkyAndCloudsProps) => {
  const cloudsRef = useRef<THREE.Group>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Group>(null);

  // Cloud cluster positions and scales for simple, fluffy white clouds
  const cloudData = useMemo(() => {
    return [
      { pos: [-65, 48, -40] as [number, number, number], scale: 2.6, speed: 0.012 },
      { pos: [25, 52, -65] as [number, number, number], scale: 3.0, speed: 0.010 },
      { pos: [-35, 45, 50] as [number, number, number], scale: 2.4, speed: 0.014 },
      { pos: [55, 50, 20] as [number, number, number], scale: 2.8, speed: 0.009 },
      { pos: [-80, 46, 10] as [number, number, number], scale: 2.5, speed: 0.011 },
      { pos: [10, 56, 70] as [number, number, number], scale: 3.2, speed: 0.008 },
      { pos: [75, 54, -30] as [number, number, number], scale: 2.2, speed: 0.013 },
      { pos: [-15, 58, -80] as [number, number, number], scale: 3.4, speed: 0.007 },
    ];
  }, []);

  // Sky dome colors based on time of day
  // DAY: Vibrant radiant blue sky dome with soft horizon mist
  // NIGHT: Deep midnight navy / starry void
  // TWILIGHT: Rich golden-orange to violet gradient
  const skyColors = useMemo(() => {
    switch (timeOfDay) {
      case 'night':
        return {
          top: new THREE.Color('#09142b'),
          mid: new THREE.Color('#12264a'),
          horizon: new THREE.Color('#224170'),
          cloudColor: new THREE.Color('#8aa0c4'),
          cloudOpacity: 0.55
        };
      case 'twilight':
        return {
          top: new THREE.Color('#242042'),
          mid: new THREE.Color('#944e5d'),
          horizon: new THREE.Color('#e88a5a'),
          cloudColor: new THREE.Color('#ffd1b3'),
          cloudOpacity: 0.75
        };
      default: // day - BLUE SKY & SIMPLE WHITE CLOUDS
        return {
          top: new THREE.Color('#1c72dd'),      // Rich vibrant zenith blue
          mid: new THREE.Color('#4ea0f5'),      // Bright sky blue
          horizon: new THREE.Color('#cbe5fc'),  // Clean luminous horizon blue-white
          cloudColor: new THREE.Color('#ffffff'),// Crisp pure white clouds
          cloudOpacity: 0.96
        };
    }
  }, [timeOfDay]);

  // Smooth drift for clouds across the sky
  useFrame((_, delta) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.children.forEach((cloudGroup, i) => {
      const data = cloudData[i];
      if (data) {
        cloudGroup.position.x += data.speed * 60 * delta;
        // Wrap around boundary when cloud drifts off the edge of the world
        if (cloudGroup.position.x > 105) {
          cloudGroup.position.x = -105;
        }
      }
    });

    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.z += delta * 0.05;
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* 1. Large Hemispherical Gradient Sky Dome */}
      <SkyDome topColor={skyColors.top} midColor={skyColors.mid} horizonColor={skyColors.horizon} />

      {/* 2. Night Stars */}
      {timeOfDay !== 'day' && (
        <Stars
          radius={160}
          depth={60}
          count={timeOfDay === 'night' ? 4500 : 1200}
          factor={timeOfDay === 'night' ? 4 : 2}
          saturation={0}
          fade
          speed={0.8}
        />
      )}

      {/* 3. Celestial Bodies: Day Sun or Night Moon */}
      {timeOfDay === 'day' && (
        <group position={[60, 85, -55]}>
          {/* Glowing Sun Core */}
          <mesh ref={sunMeshRef}>
            <sphereGeometry args={[6.5, 24, 24]} />
            <meshBasicMaterial color="#fffbe6" />
          </mesh>
          {/* Sun Corona Glow Ring */}
          <mesh position={[0, 0, -0.2]}>
            <ringGeometry args={[6.8, 15.0, 32]} />
            <meshBasicMaterial
              color="#ffea9f"
              transparent
              opacity={0.38}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {timeOfDay === 'twilight' && (
        <group position={[65, 32, -60]}>
          <mesh>
            <sphereGeometry args={[7.2, 24, 24]} />
            <meshBasicMaterial color="#ff7a45" />
          </mesh>
          <mesh position={[0, 0, -0.2]}>
            <ringGeometry args={[7.5, 17.0, 32]} />
            <meshBasicMaterial
              color="#ff9955"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {timeOfDay === 'night' && (
        <group ref={moonMeshRef} position={[-55, 78, -45]}>
          {/* Majestic Full Moon Core Sphere */}
          <mesh>
            <sphereGeometry args={[9.5, 36, 36]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e2f0ff"
              emissiveIntensity={2.9}
              roughness={0.7}
            />
          </mesh>

          {/* Lunar Crater Maria Markings */}
          <mesh position={[1.8, 1.2, 8.8]} scale={[2.4, 2.0, 0.4]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#b2cbe6" opacity={0.65} transparent />
          </mesh>
          <mesh position={[-2.4, -1.6, 8.6]} scale={[3.2, 2.5, 0.4]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#a7c3e3" opacity={0.6} transparent />
          </mesh>
          <mesh position={[-0.8, 2.8, 8.5]} scale={[2.0, 1.8, 0.35]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#b8d1ec" opacity={0.55} transparent />
          </mesh>

          {/* Inner Bright Lunar Corona Ring */}
          <mesh position={[0, 0, -0.2]}>
            <ringGeometry args={[9.8, 18.5, 48]} />
            <meshBasicMaterial
              color="#bfe2ff"
              transparent
              opacity={0.48}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Outer Radiant Lunar Halo */}
          <mesh position={[0, 0, -0.4]}>
            <ringGeometry args={[17.0, 38.0, 48]} />
            <meshBasicMaterial
              color="#68a4fa"
              transparent
              opacity={0.24}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Direct Moonlight Radiance */}
          <pointLight
            position={[0, 0, 2]}
            color="#d8ebff"
            intensity={3.2}
            distance={180}
            decay={1.2}
          />
        </group>
      )}

      {/* 4. Simple Fluffy White Clouds Drifting in the Sky */}
      <group ref={cloudsRef}>
        {cloudData.map((cloud, idx) => (
          <group key={idx} position={cloud.pos} scale={cloud.scale}>
            <SimpleFluffyCloud
              color={skyColors.cloudColor}
              opacity={skyColors.cloudOpacity}
              timeOfDay={timeOfDay}
            />
          </group>
        ))}
      </group>
    </group>
  );
};

// Procedural Gradient Sky Dome with Zenith, Mid, and Horizon Blending
const SkyDome = ({
  topColor,
  midColor,
  horizonColor
}: {
  topColor: THREE.Color;
  midColor: THREE.Color;
  horizonColor: THREE.Color;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTopColor: { value: topColor },
    uMidColor: { value: midColor },
    uHorizonColor: { value: horizonColor }
  }), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTopColor.value.lerp(topColor, 0.05);
    mat.uniforms.uMidColor.value.lerp(midColor, 0.05);
    mat.uniforms.uHorizonColor.value.lerp(horizonColor, 0.05);
  });

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uTopColor;
    uniform vec3 uMidColor;
    uniform vec3 uHorizonColor;
    varying vec3 vWorldPosition;

    void main() {
      // Normalize elevation angle from horizon (y=0) to zenith (y=1)
      float h = normalize(vWorldPosition).y;
      
      vec3 skyColor;
      if (h < 0.25) {
        float t = smoothstep(0.0, 0.25, max(h, 0.0));
        skyColor = mix(uHorizonColor, uMidColor, t);
      } else {
        float t = smoothstep(0.25, 0.95, h);
        skyColor = mix(uMidColor, uTopColor, t);
      }

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[220, 32, 24]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// Simple, Stylized Fluffy White Cloud Mesh
// Composed of overlapping soft billowy spheres with crisp, pure white shading
interface SimpleFluffyCloudProps {
  color: THREE.Color;
  opacity: number;
  timeOfDay: 'day' | 'twilight' | 'night';
}

const SimpleFluffyCloud = ({ color, opacity, timeOfDay }: SimpleFluffyCloudProps) => {
  return (
    <group>
      {/* Central billow */}
      <mesh castShadow position={[0, 0, 0]} scale={[2.6, 1.3, 1.8]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.0}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>

      {/* Left puff */}
      <mesh position={[-1.7, -0.2, 0.2]} scale={[1.8, 1.1, 1.5]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>

      {/* Right puff */}
      <mesh position={[1.8, -0.15, -0.1]} scale={[1.9, 1.15, 1.5]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>

      {/* Top crown puff */}
      <mesh position={[0.4, 0.75, 0.1]} scale={[1.6, 1.2, 1.4]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.88}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>

      {/* Secondary rear puff */}
      <mesh position={[-0.8, 0.5, -0.4]} scale={[1.3, 0.95, 1.2]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>

      {/* Flat cloud base plane */}
      <mesh position={[0, -0.7, 0]} scale={[2.8, 0.4, 1.7]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          color={timeOfDay === 'day' ? '#e2ecf5' : color}
          roughness={0.95}
          transparent
          opacity={opacity * 0.9}
          flatShading
        />
      </mesh>
    </group>
  );
};
