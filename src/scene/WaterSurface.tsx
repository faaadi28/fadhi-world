import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { zenAudio } from '../audio/zenAudio';

type TimeOfDay = 'day' | 'twilight' | 'night';

interface WaterSurfaceProps {
  onWaterClick?: (point: THREE.Vector3) => void;
  timeOfDay: TimeOfDay;
}

/* -------------------------------------------------------------------------- */
/*  Palettes – real pond blues + matching sky for the reflections              */
/* -------------------------------------------------------------------------- */

interface Palette {
  deep: THREE.Color;        // body colour in the middle of the pond
  shallow: THREE.Color;     // lighter turquoise-blue near the banks / wave crests
  skyHorizon: THREE.Color;  // what the water reflects near the horizon
  skyZenith: THREE.Color;   // what the water reflects overhead
  sunColor: THREE.Color;    // sun / moon glint colour
  sunDir: THREE.Vector3;    // direction towards the sun / moon
}

const PALETTES: Record<TimeOfDay, Palette> = {
  day: {
    deep: new THREE.Color(0x0a4a78),
    shallow: new THREE.Color(0x2f9bc4),
    skyHorizon: new THREE.Color(0xbfe3f5),
    skyZenith: new THREE.Color(0x3f8fd8),
    sunColor: new THREE.Color(0xfff3d6),
    sunDir: new THREE.Vector3(0.35, 0.75, 0.55).normalize()
  },
  twilight: {
    deep: new THREE.Color(0x12335c),
    shallow: new THREE.Color(0x2f6c9a),
    skyHorizon: new THREE.Color(0xf4a974),
    skyZenith: new THREE.Color(0x3b4f8c),
    sunColor: new THREE.Color(0xffb36b),
    sunDir: new THREE.Vector3(0.8, 0.22, 0.5).normalize()
  },
  night: {
    deep: new THREE.Color(0x061c3a),
    shallow: new THREE.Color(0x15497a),
    skyHorizon: new THREE.Color(0x24406e),
    skyZenith: new THREE.Color(0x07132b),
    sunColor: new THREE.Color(0xcfe4ff),
    sunDir: new THREE.Vector3(-0.3, 0.7, 0.4).normalize()
  }
};

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const waterVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vHeight;

  uniform float uTime;
  uniform vec2 uRipples[8];
  uniform float uRippleTimes[8];
  uniform vec2  uWindDir;    // normalised XZ wind direction
  uniform float uWindSpeed;  // 0 = calm, 1 = breezy, 2 = windy

  // Surface height at a point of the plane (plane lies in local XY, Z is "up")
  float heightAt(vec2 p) {
    // Calm background swell (omni-directional)
    float h = sin(p.x * 0.8 + uTime * 0.9) * cos(p.y * 0.8 + uTime * 0.7) * 0.03;
    h += sin(p.x * 1.6 - uTime * 1.2) * sin(p.y * 1.4 + uTime * 1.1) * 0.012;
    h += sin(p.x * 0.3 + p.y * 0.45 + uTime * 0.5) * 0.02;

    // ---- Wind-driven Gerstner waves ----------------------------------------
    // Four octaves traveling along uWindDir with increasing frequency & speed.
    // A crosswind component (perpendicular) gives the characteristic fan-spread.
    vec2 perp = vec2(-uWindDir.y, uWindDir.x);
    float ws = max(uWindSpeed, 0.0);

    // Primary swell – long, slow, tallest
    float g1 = dot(p, uWindDir) * 0.55 - uTime * (1.4 + ws * 0.55);
    h += sin(g1) * 0.07 * ws;

    // Secondary swell – slightly off-axis, shorter
    float g2 = dot(p, normalize(uWindDir + perp * 0.35)) * 1.1 - uTime * (2.0 + ws * 0.7);
    h += sin(g2) * 0.038 * ws;

    // Tertiary chop – higher freq, travels fast
    float g3 = dot(p, normalize(uWindDir - perp * 0.5)) * 2.3 - uTime * (3.1 + ws * 0.9);
    h += sin(g3) * 0.018 * ws;

    // Fine capillary ripple – very short, nearly isotropic
    float g4 = dot(p, uWindDir) * 5.8 - uTime * (5.2 + ws * 1.2);
    h += sin(g4) * 0.008 * ws;
    // -------------------------------------------------------------------------

    // Interactive ripples (click / tap)
    for (int i = 0; i < 8; i++) {
      float rTime = uTime - uRippleTimes[i];
      if (rTime > 0.0 && rTime < 4.0) {
        float dist = distance(p, uRipples[i]);
        float front = rTime * 2.4;
        float envelope = smoothstep(0.0, 0.5, front - dist + 0.5);
        float decay = exp(-rTime * 1.1) * smoothstep(3.0, 0.0, dist);
        h += sin((dist - front) * 9.0) * 0.06 * decay * envelope;
      }
    }
    return h;
  }

  void main() {
    vUv = uv;

    float h = heightAt(position.xy);
    vec3 pos = position;
    pos.z += h;
    vHeight = h;

    // Real normal from the height field (finite differences)
    float e = 0.08;
    float hx = heightAt(position.xy + vec2(e, 0.0));
    float hy = heightAt(position.xy + vec2(0.0, e));
    vec3 localNormal = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));
    vWorldNormal = normalize(mat3(modelMatrix) * localNormal);

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vHeight;

  uniform float uTime;
  uniform vec3 uColorShallow;
  uniform vec3 uColorDeep;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSkyZenith;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform vec3 uCameraPos;
  uniform vec2  uWindDir;
  uniform float uWindSpeed;

  // Slope (d height / d xz) of small directional waves -> fine surface normal detail.
  // Base directions are blended toward the wind so the micro-ripple pattern
  // visually aligns with the macro Gerstner waves.
  vec2 waveSlope(vec2 p, float t) {
    vec2 s    = vec2(0.0);
    float ws  = clamp(uWindSpeed, 0.0, 2.0);
    vec2  wd  = uWindDir;
    vec2  wp  = vec2(-wd.y, wd.x); // perpendicular

    // Directions fan out from wind direction with a spread controlled by wind speed
    float spread = mix(1.0, 0.25, ws * 0.5); // less spread at high wind
    vec2 d1 = normalize(wd + wp * ( 0.3 * spread)); float ph1 = dot(d1, p) * 2.3 + t * (1.10 + ws * 0.4); s += d1 * cos(ph1) * 2.3 * (0.012 + ws * 0.006);
    vec2 d2 = normalize(wd + wp * (-0.6 * spread)); float ph2 = dot(d2, p) * 3.7 + t * (1.45 + ws * 0.5); s += d2 * cos(ph2) * 3.7 * (0.008 + ws * 0.004);
    vec2 d3 = normalize(wd + wp * ( 0.2 * spread)); float ph3 = dot(d3, p) * 5.9 + t * (1.90 + ws * 0.6); s += d3 * cos(ph3) * 5.9 * (0.005 + ws * 0.003);
    vec2 d4 = normalize(wd + wp * (-1.0 * spread)); float ph4 = dot(d4, p) * 9.1 + t * (2.60 + ws * 0.7); s += d4 * cos(ph4) * 9.1 * (0.003 + ws * 0.002);
    vec2 d5 = normalize(wd + wp * ( 0.8 * spread)); float ph5 = dot(d5, p) * 13.0 + t * (3.20 + ws * 0.9); s += d5 * cos(ph5) * 13.0 * (0.0018 + ws * 0.001);
    return s;
  }

  vec3 skyColor(vec3 dir) {
    float up = clamp(dir.y, 0.0, 1.0);
    vec3 sky = mix(uSkyHorizon, uSkyZenith, pow(up, 0.55));
    // soft glow around the sun / moon
    float glow = pow(max(dot(dir, normalize(uSunDir)), 0.0), 24.0);
    return sky + uSunColor * glow * 0.35;
  }

  void main() {
    vec3 V = normalize(uCameraPos - vWorldPosition);
    float camDist = length(uCameraPos - vWorldPosition);

    // Fine detail fades with distance so the far water doesn't shimmer
    float detailFade = 1.0 / (1.0 + camDist * 0.035);
    vec2 slope = waveSlope(vWorldPosition.xz, uTime) * detailFade;
    vec3 N = normalize(vWorldNormal + vec3(-slope.x, 0.0, -slope.y));

    // Fresnel (Schlick, water F0 ~ 0.02) – looking straight down you see into the
    // water, at grazing angles you see the sky mirrored in it.
    float cosTheta = max(dot(V, N), 0.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - cosTheta, 5.0);
    fresnel = clamp(fresnel, 0.0, 0.85);

    // Mirror the sky
    vec3 R = reflect(-V, N);
    R.y = abs(R.y);
    vec3 reflection = skyColor(R);

    // Depth: lighter and more transparent near the plane's edges (banks),
    // deep blue in the middle
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float depthMix = smoothstep(0.0, 0.2, edgeDist);

    vec3 body = mix(uColorShallow, uColorDeep, depthMix);

    // Light scattering through wave crests gives the typical turquoise tint
    float crest = smoothstep(-0.01, 0.07, vHeight);
    body += uColorShallow * crest * 0.18;

    // Gentle caustic light patterns, mostly visible in the shallows
    vec2 cp = vWorldPosition.xz;
    float c1 = sin(cp.x * 3.0 + uTime * 0.8 + sin(cp.y * 2.5));
    float c2 = cos(cp.y * 3.0 - uTime * 0.9 + cos(cp.x * 2.5));
    float caustic = smoothstep(0.65, 1.0, (c1 + c2) * 0.5);
    body += vec3(0.55, 0.85, 1.0) * caustic * 0.12 * (1.0 - depthMix * 0.7);

    // Sun / moon glitter
    vec3 L = normalize(uSunDir);
    vec3 H = normalize(L + V);
    float nh = max(dot(N, H), 0.0);
    float sparkle = 0.65 + 0.35 * sin(vWorldPosition.x * 18.0 + uTime * 3.0) * sin(vWorldPosition.z * 17.0 - uTime * 2.4);
    float spec = pow(nh, 260.0) * 1.6 * sparkle + pow(nh, 50.0) * 0.12;

    vec3 color = mix(body, reflection, fresnel);
    color += uSunColor * spec;

    // Colours are supplied in linear space; ShaderMaterial does not convert to sRGB itself
    color = pow(max(color, vec3(0.0)), vec3(1.0 / 2.2));

    float alpha = mix(0.78, 0.96, depthMix);
    alpha = mix(alpha, 1.0, fresnel * 0.6);
    gl_FragColor = vec4(color, alpha);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

const RIPPLE_COUNT = 8;

const makeRippleUniforms = () => ({
  uRipples: { value: new Array(RIPPLE_COUNT).fill(null).map(() => new THREE.Vector2(999, 999)) },
  uRippleTimes: { value: new Float32Array(RIPPLE_COUNT).fill(-99) }
});

export const WaterSurface = ({ onWaterClick, timeOfDay }: WaterSurfaceProps) => {
  const lakeRef = useRef<THREE.Mesh>(null);
  const rippleIndex = useRef(0);
  const timeRef = useRef(0);

  // Uniforms shared by both water meshes (same {value} objects => updated once per frame)
  const shared = useMemo(() => {
    const p = PALETTES[timeOfDay];
    return {
      uTime: { value: 0 },
      uColorDeep: { value: p.deep.clone() },
      uColorShallow: { value: p.shallow.clone() },
      uSkyHorizon: { value: p.skyHorizon.clone() },
      uSkyZenith: { value: p.skyZenith.clone() },
      uSunColor: { value: p.sunColor.clone() },
      uSunDir: { value: p.sunDir.clone() },
      uCameraPos: { value: new THREE.Vector3() },
      // Wind – starts as a gentle north-east breeze; slowly veers over time
      uWindDir: { value: new THREE.Vector2(0.6, 0.8).normalize() },
      uWindSpeed: { value: 0.6 }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each mesh keeps its own ripples so a click on the lake doesn't ghost onto the river
  const lakeUniforms = useMemo(() => ({ ...shared, ...makeRippleUniforms() }), [shared]);
  const riverUniforms = useMemo(() => ({ ...shared, ...makeRippleUniforms() }), [shared]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    timeRef.current = t;
    shared.uTime.value = t;
    shared.uCameraPos.value.copy(state.camera.position);

    // Smoothly blend towards the current time-of-day palette
    const target = PALETTES[timeOfDay];
    const k = 1 - Math.exp(-delta * 2.5);
    shared.uColorDeep.value.lerp(target.deep, k);
    shared.uColorShallow.value.lerp(target.shallow, k);
    shared.uSkyHorizon.value.lerp(target.skyHorizon, k);
    shared.uSkyZenith.value.lerp(target.skyZenith, k);
    shared.uSunColor.value.lerp(target.sunColor, k);
    shared.uSunDir.value.lerp(target.sunDir, k).normalize();

    // Slowly veer the wind direction (full 360° rotation every ~5 minutes)
    // and gently pulse the speed so gusts come and go organically.
    const windAngle = t * 0.0021;          // very slow rotation
    shared.uWindDir.value.set(
      Math.cos(windAngle),
      Math.sin(windAngle)
    ).normalize();
    // Speed oscillates between ~0.3 (light airs) and ~1.1 (fresh breeze)
    shared.uWindSpeed.value = 0.7 + Math.sin(t * 0.13) * 0.25 + Math.sin(t * 0.047) * 0.15;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!lakeRef.current) return;
    const localPoint = lakeRef.current.worldToLocal(e.point.clone());

    const idx = rippleIndex.current % RIPPLE_COUNT;
    rippleIndex.current++;

    lakeUniforms.uRipples.value[idx].set(localPoint.x, localPoint.y);
    // Use the same clock as uTime so the ripple starts exactly now
    lakeUniforms.uRippleTimes.value[idx] = timeRef.current;

    zenAudio.playWaterPlop();

    if (onWaterClick) {
      onWaterClick(e.point);
    }
  };

  return (
    <group>
      {/* Expansive Central Lake Water Surface */}
      <mesh
        ref={lakeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-4, 0.06, 2]}
        onPointerDown={handlePointerDown}
        receiveShadow
      >
        <planeGeometry args={[46, 64, 120, 120]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={lakeUniforms}
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
        <planeGeometry args={[24, 16, 48, 32]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={riverUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
