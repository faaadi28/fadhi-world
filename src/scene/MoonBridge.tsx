import { useMemo } from 'react';
import { Html } from '@react-three/drei';

interface MoonBridgeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  isActive?: boolean;
}

export const MoonBridge = ({
  position = [-1.5, 0.05, -3.8],
  rotation = [0, 0.35, 0],
  onClick,
  isActive
}: MoonBridgeProps) => {
  // Generate arched floor planks
  const planks = useMemo(() => {
    const list = [];
    const count = 18;
    const length = 4.6;
    const archHeight = 0.55;

    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) * 2 - 1; // -1 to 1
      const x = t * (length / 2);
      const y = archHeight * (1 - t * t) + 0.15;
      const angle = Math.atan(-2 * archHeight * t / (length / 2));

      list.push({ id: i, x, y, angle });
    }
    return list;
  }, []);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Curved Planks */}
      {planks.map((p) => (
        <mesh
          key={p.id}
          position={[p.x, p.y, 0]}
          rotation={[0, 0, -p.angle]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.22, 0.06, 1.4]} />
          <meshStandardMaterial
            color="#3a2519"
            roughness={0.78}
          />
        </mesh>
      ))}

      {/* Arched Support Stringer Beams (Cedar) */}
      <mesh position={[0, 0.28, -0.65]} castShadow>
        <boxGeometry args={[4.4, 0.1, 0.08]} />
        <meshStandardMaterial color="#24160e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.28, 0.65]} castShadow>
        <boxGeometry args={[4.4, 0.1, 0.08]} />
        <meshStandardMaterial color="#24160e" roughness={0.8} />
      </mesh>

      {/* Red Handrail Posts */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x, i) => {
        const t = x / 2.3;
        const y = 0.55 * (1 - t * t) + 0.45;
        return (
          <group key={i}>
            <Post position={[x, y, -0.68]} />
            <Post position={[x, y, 0.68]} />
          </group>
        );
      })}

      {/* Vermilion Arched Handrails */}
      <mesh position={[0, 0.85, -0.68]} castShadow>
        <boxGeometry args={[4.3, 0.06, 0.06]} />
        <meshStandardMaterial color="#9c3228" roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.85, 0.68]} castShadow>
        <boxGeometry args={[4.3, 0.06, 0.06]} />
        <meshStandardMaterial color="#9c3228" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Floating 3D Badge */}
      <Html position={[0, 2.2, 0]} center distanceFactor={22}>
        <div className={`scene-badge ${isActive ? 'active' : ''}`}>
          <span className="badge-tag">ZONE 05</span>
          <span className="badge-en">Grand Valley Bridge — Career</span>
        </div>
      </Html>
    </group>
  );
};

const Post = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position} castShadow>
    <cylinderGeometry args={[0.035, 0.035, 0.65, 8]} />
    <meshStandardMaterial color="#9c3228" roughness={0.65} />
  </mesh>
);
