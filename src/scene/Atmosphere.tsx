import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface AtmosphereProps {
  timeOfDay: 'day' | 'twilight' | 'night';
}

export const Atmosphere = ({ timeOfDay }: AtmosphereProps) => {
  const leavesCount = 65;
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  // Initial particle state
  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < leavesCount; i++) {
      list.push({
        x: (Math.random() - 0.5) * 16 - 1.0,
        y: Math.random() * 7 + 0.5,
        z: (Math.random() - 0.5) * 16 + 1.0,
        speedY: 0.008 + Math.random() * 0.014,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.04,
        scale: 0.06 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2
      });
    }
    return list;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!leavesRef.current) return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < leavesCount; i++) {
      const p = particles[i];
      p.y -= p.speedY;
      // Gentle wind swirl
      p.x += Math.sin(t * 0.8 + p.phase) * 0.008 + 0.004;
      p.z += Math.cos(t * 0.6 + p.phase) * 0.006;
      p.rotX += p.rotSpeedX;
      p.rotY += p.rotSpeedY;

      // Respawn at top if hitting water/ground
      if (p.y < 0.02) {
        p.y = 7.5;
        p.x = (Math.random() - 0.5) * 14 - 1.5;
        p.z = (Math.random() - 0.5) * 14 + 1.5;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.scale, p.scale * 0.4, p.scale);
      dummy.updateMatrix();
      leavesRef.current.setMatrixAt(i, dummy.matrix);
    }
    leavesRef.current.instanceMatrix.needsUpdate = true;
  });

  // Soft low mist layer
  const mistColor = useMemo(() => {
    if (timeOfDay === 'twilight') return '#e8a87c';
    if (timeOfDay === 'night') return '#223c5e';
    return '#cfd9df';
  }, [timeOfDay]);

  return (
    <group>
      {/* Instanced falling crimson maple leaves */}
      <instancedMesh
        ref={leavesRef}
        args={[undefined, undefined, leavesCount]}
        castShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#be382d"
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </instancedMesh>

      {/* Floating Low Ground Mist Plane */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[72, 72]} />
        <meshBasicMaterial
          color={mistColor}
          transparent
          opacity={timeOfDay === 'twilight' ? 0.12 : 0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Floating Twilight / Night Fireflies / Light Motes */}
      {timeOfDay !== 'day' && <Fireflies count={60} />}
    </group>
  );
};

const Fireflies = ({ count = 60 }: { count: number }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 75;
      pos[i * 3 + 1] = 0.4 + Math.random() * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 75;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, phases: ph };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const origY = positions[i * 3 + 1];
      const newY = origY + Math.sin(t * 1.5 + phases[i]) * 0.15;
      pos.setY(i, newY);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffdf7a"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
