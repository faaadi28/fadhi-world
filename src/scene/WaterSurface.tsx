import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { zenAudio } from '../audio/zenAudio';

interface WaterSurfaceProps {
  onWaterClick?: (point: THREE.Vector3) => void;
  timeOfDay: 'day' | 'twilight' | 'night';
}

const waterVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  uniform float uTime;
  uniform vec2 uRipples[8];
  uniform float uRippleTimes[8];

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Gentle base harmonic water waves
    float wave1 = sin(pos.x * 0.8 + uTime * 0.9) * cos(pos.y * 0.8 + uTime * 0.7) * 0.04;
    float wave2 = sin(pos.x * 1.6 - uTime * 1.2) * sin(pos.y * 1.4 + uTime * 1.1) * 0.02;
    pos.z += wave1 + wave2;

    // Interactive pointer ripples
    for (int i = 0; i < 8; i++) {
      float rTime = uTime - uRippleTimes[i];
      if (rTime > 0.0 && rTime < 4.0) {
        float dist = distance(pos.xy, uRipples[i]);
        float waveSpeed = 2.4;
        float waveFrequency = 9.0;
        float decay = exp(-rTime * 1.2) * smoothstep(2.5, 0.0, dist);
        float ripple = sin((dist - rTime * waveSpeed) * waveFrequency) * 0.08 * decay;
        pos.z += ripple;
      }
    }

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  uniform float uTime;
  uniform vec3 uColorShallow;
  uniform vec3 uColorDeep;
  uniform vec3 uColorHighlight;
  uniform vec3 uCameraPos;

  void main() {
    // Normal perturbation for micro ripples / caustics
    vec3 n = normalize(vNormal);
    float microWave = sin(vWorldPosition.x * 4.0 + uTime * 1.5) * cos(vWorldPosition.y * 4.0 + uTime * 1.2) * 0.15;
    n.x += microWave;
    n.y += microWave;
    n = normalize(n);

    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, n), 0.0), 3.0);

    // Specular light reflection
    vec3 lightDir = normalize(vec3(4.0, 10.0, 6.0));
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(dot(n, halfVector), 0.0), 48.0);

    // Subtle caustic grid pattern
    float caustic1 = sin(vWorldPosition.x * 3.0 + uTime * 0.8 + sin(vWorldPosition.y * 2.5));
    float caustic2 = cos(vWorldPosition.y * 3.0 - uTime * 0.9 + cos(vWorldPosition.x * 2.5));
    float caustic = smoothstep(0.7, 1.0, (caustic1 + caustic2) * 0.5) * 0.18;

    vec3 baseColor = mix(uColorDeep, uColorShallow, fresnel * 0.6 + 0.2);
    vec3 finalColor = baseColor + (uColorHighlight * spec * 0.8) + (vec3(0.85, 0.95, 1.0) * caustic);

    float alpha = mix(0.82, 0.94, fresnel);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const WaterSurface = ({ onWaterClick, timeOfDay }: WaterSurfaceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rippleIndex = useRef(0);

  const colors = useMemo(() => {
    switch (timeOfDay) {
      case 'twilight':
        return {
          deep: new THREE.Color(0x0e1b29),
          shallow: new THREE.Color(0x1e3a4b),
          highlight: new THREE.Color(0xf6d38e)
        };
      case 'night':
        return {
          deep: new THREE.Color(0x0e223b),
          shallow: new THREE.Color(0x1d3e63),
          highlight: new THREE.Color(0xd6ebff)
        };
      default: // day
        return {
          deep: new THREE.Color(0x132a32),
          shallow: new THREE.Color(0x285963),
          highlight: new THREE.Color(0xfff1dc)
        };
    }
  }, [timeOfDay]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRipples: { value: new Array(8).fill(null).map(() => new THREE.Vector2(999, 999)) },
    uRippleTimes: { value: new Float32Array(8).fill(-99) },
    uColorDeep: { value: colors.deep },
    uColorShallow: { value: colors.shallow },
    uColorHighlight: { value: colors.highlight },
    uCameraPos: { value: new THREE.Vector3() }
  }), [colors]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uCameraPos.value.copy(state.camera.position);
    mat.uniforms.uColorDeep.value.lerp(colors.deep, 0.05);
    mat.uniforms.uColorShallow.value.lerp(colors.shallow, 0.05);
    mat.uniforms.uColorHighlight.value.lerp(colors.highlight, 0.05);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!meshRef.current) return;
    const localPoint = meshRef.current.worldToLocal(e.point.clone());
    
    // Add ripple
    const idx = rippleIndex.current % 8;
    rippleIndex.current++;
    
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uRipples.value[idx].set(localPoint.x, localPoint.y);
    mat.uniforms.uRippleTimes.value[idx] = performance.now() * 0.001;

    zenAudio.playWaterPlop();

    if (onWaterClick) {
      onWaterClick(e.point);
    }
  };

  return (
    <group>
      {/* Expansive Central Lake Water Surface */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-4, 0.06, 2]}
        onPointerDown={handlePointerDown}
        receiveShadow
      >
        <planeGeometry args={[46, 64, 80, 80]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* River Canyon Water Surface (Under Grand Moon Bridge) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, -40]}
        receiveShadow
      >
        <planeGeometry args={[24, 16, 32, 24]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
