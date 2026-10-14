import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getTerrainHeight, getBridgeHeight, getPavilionHeight } from './terrainUtils';

export interface LandmarkTarget {
  id: string;
  name: string;
  subtitle: string;
  position: [number, number, number];
  radius: number;
}

export const LANDMARK_TARGETS: LandmarkTarget[] = [
  { id: 'sanctuary', name: "FADHI'S WORLD", subtitle: 'First Gate & Entrance', position: [0, 0.4, 42], radius: 6.5 },
  { id: 'about', name: 'Lakeside Pavilion', subtitle: 'About Abdulla', position: [42, 0.5, 8], radius: 7.0 },
  { id: 'projects', name: 'Project Archipelago', subtitle: 'Live Platforms & Web3', position: [-18, 0.2, 0], radius: 10.0 },
  { id: 'skills', name: 'Innovation Meadow', subtitle: 'Skills & Tech Matrix', position: [36, 0.5, 42], radius: 7.0 },
  { id: 'experience', name: 'Grand Valley Bridge', subtitle: 'Career & Milestones', position: [0, 1.4, -40], radius: 7.5 },
  { id: 'education', name: 'The Knowledge Summit', subtitle: 'MCA & Physics Foundations', position: [45, 3.8, -38], radius: 7.5 },
  { id: 'labs', name: 'Cybersecurity Bastion', subtitle: 'CTFs & Isolated Labs', position: [-42, 1.5, -34], radius: 7.5 },
  { id: 'contact', name: 'Communications Outpost', subtitle: 'Get In Touch', position: [-38, 0.4, 38], radius: 6.5 },
];

interface PlayerControllerProps {
  isFreeRoam: boolean;
  onNearLandmark?: (landmark: LandmarkTarget | null) => void;
  onInteractLandmark?: (landmarkId: string) => void;
  onPlayerPositionChange?: (pos: { x: number; z: number; heading: number }) => void;
  virtualInput?: { x: number; y: number; isSprinting?: boolean; isJumping?: boolean };
  isRidingCableCar?: boolean;
  onToggleRideCableCar?: (riding: boolean) => void;
  cableCarPos?: THREE.Vector3 | null;
  teleportTarget?: [number, number, number] | null;
  isStationPromptActive?: boolean;
}

export const PlayerController = ({
  isFreeRoam,
  onNearLandmark,
  onInteractLandmark,
  onPlayerPositionChange,
  virtualInput,
  isRidingCableCar = false,
  onToggleRideCableCar,
  cableCarPos,
  teleportTarget,
  isStationPromptActive = false
}: PlayerControllerProps) => {
  const { camera, gl } = useThree();

  // Player state: standing right in front of the first gate FADHI'S WORLD
  const playerPos = useRef(new THREE.Vector3(0, 0.4, 47.0));
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const playerHeading = useRef(Math.PI); // Facing inward toward gate
  const isGrounded = useRef(true);
  const [isFirstPerson, setIsFirstPerson] = useState(false);

  // Handle direct platform teleportation (e.g. stepping off at a station)
  useEffect(() => {
    if (teleportTarget) {
      playerPos.current.set(teleportTarget[0], teleportTarget[1], teleportTarget[2]);
      playerVelocity.current.set(0, 0, 0);
      isGrounded.current = true;
      if (avatarRef.current) {
        avatarRef.current.position.set(teleportTarget[0], teleportTarget[1], teleportTarget[2]);
      }
    }
  }, [teleportTarget]);

  // Camera Orbit state
  const cameraAngles = useRef({ yaw: Math.PI, pitch: 0.32 });
  const cameraDistance = useRef(4.6);
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });

  // Keyboard keys pressed
  const keys = useRef<{ [key: string]: boolean }>({});
  const activeNearbyLandmark = useRef<LandmarkTarget | null>(null);

  // Avatar mesh ref for walk animation
  const avatarRef = useRef<THREE.Group>(null);
  const walkCycle = useRef(0);

  const nearStationRef = useRef<string | null>(null);

  // Register Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      keys.current[e.key] = true;

      // Toggle 1st / 3rd Person View with 'V'
      if (e.key === 'v' || e.key === 'V') {
        setIsFirstPerson((prev) => !prev);
      }

      // Interact with nearby landmark or Cable Car with 'E' or Enter
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        if (isRidingCableCar) {
          // If station prompt is active, let App.tsx handle exit or continue
          if (isStationPromptActive) return;
          onToggleRideCableCar?.(false);
          return;
        }
        if (nearStationRef.current) {
          onToggleRideCableCar?.(true);
          return;
        }
        if (activeNearbyLandmark.current) {
          onInteractLandmark?.(activeNearbyLandmark.current.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteractLandmark, isRidingCableCar, onToggleRideCableCar, isStationPromptActive]);

  // Pointer Drag & Mouse Look listeners
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.hud-header, .drawer, .modal, .compass, .virtual-joystick, .cable-car-hud')) return;
      isDragging.current = true;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      cameraAngles.current.yaw -= dx * 0.0055;
      cameraAngles.current.pitch = Math.max(
        0.05,
        Math.min(Math.PI / 2.3, cameraAngles.current.pitch + dy * 0.004)
      );
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!isFreeRoam) return;
      cameraDistance.current = Math.max(1.8, Math.min(10.5, cameraDistance.current + e.deltaY * 0.004));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl, isFreeRoam]);

  // Main game tick / physics frame
  useFrame((_, delta) => {
    if (!isFreeRoam) return;

    // A. If Riding Cable Car: smoothly follow cabin high above ground
    if (isRidingCableCar) {
      if (cableCarPos) {
        playerPos.current.copy(cableCarPos);
      }
      if (avatarRef.current) {
        avatarRef.current.position.set(
          playerPos.current.x,
          playerPos.current.y,
          playerPos.current.z
        );
      }

      // Smooth aerial camera follow
      const headHeight = 0.9;
      const targetLookAt = new THREE.Vector3(
        playerPos.current.x,
        playerPos.current.y + headHeight,
        playerPos.current.z
      );

      const dist = isFirstPerson ? 0.2 : 5.8;
      const camX = playerPos.current.x - Math.sin(cameraAngles.current.yaw) * Math.cos(cameraAngles.current.pitch) * dist;
      const camY = playerPos.current.y + headHeight + Math.sin(cameraAngles.current.pitch) * dist;
      const camZ = playerPos.current.z - Math.cos(cameraAngles.current.yaw) * Math.cos(cameraAngles.current.pitch) * dist;

      camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.16);
      camera.lookAt(targetLookAt);

      onPlayerPositionChange?.({
        x: playerPos.current.x,
        z: playerPos.current.z,
        heading: playerHeading.current
      });
      return;
    }

    // B. On-Foot Walking & Free Exploration (WASD + Jump + Sprint)
    let moveForward = 0;
    let moveRight = 0;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveForward += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveForward -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveRight += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveRight -= 1;

    // Blend virtual joystick input if present
    if (virtualInput) {
      moveRight += virtualInput.x;
      moveForward += virtualInput.y;
    }

    const isSprinting =
      Boolean(keys.current['ShiftLeft'] || keys.current['ShiftRight'] || virtualInput?.isSprinting);
    const speed = isSprinting ? 12.5 : 5.8;

    // 2. Compute movement vector relative to camera yaw
    const inputMag = Math.hypot(moveForward, moveRight);
    let isMoving = false;

    if (inputMag > 0.1) {
      isMoving = true;
      const moveAngle = Math.atan2(moveRight, moveForward);
      // Correct coordinate frame so Left Arrow moves Left and Right Arrow moves Right
      const worldAngle = cameraAngles.current.yaw - moveAngle;

      const vx = Math.sin(worldAngle) * speed;
      const vz = Math.cos(worldAngle) * speed;

      playerPos.current.x += vx * delta;
      playerPos.current.z += vz * delta;

      // Update player facing heading
      playerHeading.current = worldAngle;

      // Walk cycle for avatar bobbing
      walkCycle.current += delta * (isSprinting ? 14 : 9);
    }

    // 3. Jump physics
    const jumpRequested =
      Boolean(keys.current['Space'] || virtualInput?.isJumping) && isGrounded.current;
    if (jumpRequested) {
      playerVelocity.current.y = 5.8;
      isGrounded.current = false;
    }

    // Gravity
    if (!isGrounded.current) {
      playerVelocity.current.y -= 14.0 * delta;
      playerPos.current.y += playerVelocity.current.y * delta;
    }

    // 4. Ground Snapping & Elevation Collision
    const currentX = playerPos.current.x;
    const currentZ = playerPos.current.z;

    const bridgeY = getBridgeHeight(currentX, currentZ);
    const pavilionY = getPavilionHeight(currentX, currentZ);
    const naturalTerrainY = getTerrainHeight(currentX, currentZ);

    let groundLevel = naturalTerrainY;
    if (bridgeY !== null) groundLevel = bridgeY;
    else if (pavilionY !== null) groundLevel = pavilionY;

    // Prevent player falling into the lake water basin
    groundLevel = Math.max(groundLevel, 0.08);

    if (playerPos.current.y <= groundLevel) {
      playerPos.current.y = groundLevel;
      playerVelocity.current.y = 0;
      isGrounded.current = true;
    }

    // Boundary clamping (keep within the vast open world)
    const worldRadius = Math.hypot(playerPos.current.x, playerPos.current.z);
    if (worldRadius > 72.0) {
      const angle = Math.atan2(playerPos.current.z, playerPos.current.x);
      playerPos.current.x = Math.cos(angle) * 72.0;
      playerPos.current.z = Math.sin(angle) * 72.0;
    }

    // 5. Update 3D Avatar position, rotation & animation
    if (avatarRef.current) {
      avatarRef.current.position.set(
        playerPos.current.x,
        playerPos.current.y,
        playerPos.current.z
      );
      avatarRef.current.rotation.y = playerHeading.current;

      // Walk bobbing
      const bob = isMoving ? Math.sin(walkCycle.current) * 0.04 : 0;
      avatarRef.current.position.y += bob;
    }

    // 6. Camera Position & LookAt Follow
    const headHeight = 1.45;
    const targetLookAt = new THREE.Vector3(
      playerPos.current.x,
      playerPos.current.y + headHeight,
      playerPos.current.z
    );

    if (isFirstPerson) {
      // First person view: Camera directly at player eyes
      camera.position.set(
        playerPos.current.x,
        playerPos.current.y + headHeight,
        playerPos.current.z
      );
      const lookTarget = new THREE.Vector3(
        playerPos.current.x + Math.sin(cameraAngles.current.yaw) * 10,
        playerPos.current.y + headHeight - Math.sin(cameraAngles.current.pitch) * 10,
        playerPos.current.z + Math.cos(cameraAngles.current.yaw) * 10
      );
      camera.lookAt(lookTarget);
    } else {
      // Third person orbit follow:
      const dist = cameraDistance.current;
      const camX = playerPos.current.x - Math.sin(cameraAngles.current.yaw) * Math.cos(cameraAngles.current.pitch) * dist;
      const camY = playerPos.current.y + headHeight + Math.sin(cameraAngles.current.pitch) * dist;
      const camZ = playerPos.current.z - Math.cos(cameraAngles.current.yaw) * Math.cos(cameraAngles.current.pitch) * dist;

      // Smooth camera interpolation
      camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
      camera.lookAt(targetLookAt);
    }

    // 7. Proximity Landmark & Cable Car Station Detection
    const CABLE_STATIONS = [
      { id: 'sanctuary', name: "Cable Car Station (FADHI'S WORLD)", subtitle: 'Route: To Lakeside Pavilion (About Me)', position: [6, 0.4, 36], radius: 6.0 },
      { id: 'about', name: 'Cable Car Station (Lakeside Pavilion)', subtitle: 'Route: To Valley Bridge (Experience)', position: [36, 0.5, 14], radius: 6.0 },
      { id: 'experience', name: 'Cable Car Station (Valley Bridge)', subtitle: 'Route: Return to FADHI\'S WORLD', position: [4, 1.4, -34], radius: 6.0 }
    ];

    let closestLandmark: LandmarkTarget | null = null;
    let minDist = 999;
    let nearStation: string | null = null;

    // Check cable car stations first:
    for (const cs of CABLE_STATIONS) {
      const d = Math.hypot(playerPos.current.x - cs.position[0], playerPos.current.z - cs.position[2]);
      if (d < cs.radius && d < minDist) {
        minDist = d;
        nearStation = cs.id;
        closestLandmark = {
          id: cs.id,
          name: cs.name,
          subtitle: `Press [E] to Board Cable Car (${cs.subtitle})`,
          position: cs.position as [number, number, number],
          radius: cs.radius
        };
      }
    }
    nearStationRef.current = nearStation;

    // Check world landmarks:
    if (!nearStation) {
      for (const lm of LANDMARK_TARGETS) {
        const d = Math.hypot(playerPos.current.x - lm.position[0], playerPos.current.z - lm.position[2]);
        if (d < lm.radius && d < minDist) {
          minDist = d;
          closestLandmark = lm;
        }
      }
    }

    if (closestLandmark?.id !== activeNearbyLandmark.current?.id) {
      activeNearbyLandmark.current = closestLandmark;
      onNearLandmark?.(closestLandmark);
    }

    // 8. Report Player Coordinates to Minimap / Radar
    onPlayerPositionChange?.({
      x: playerPos.current.x,
      z: playerPos.current.z,
      heading: playerHeading.current
    });
  });

  return (
    <group>
      {/* 3D Traveler Avatar (Hidden in First-Person View) */}
      {!isFirstPerson && (
        <group ref={avatarRef}>
          <TravelerAvatar />
        </group>
      )}
    </group>
  );
};

// Stylish 3D Wanderer / Traveler Avatar Model
const TravelerAvatar = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Dynamic Player Ground Shadow Blob */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Boots / Feet */}
      <mesh position={[-0.12, 0.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.24]} />
        <meshStandardMaterial color="#211d1a" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.24]} />
        <meshStandardMaterial color="#211d1a" roughness={0.8} />
      </mesh>

      {/* Traveler Robe / Tunic */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, 0.9, 10]} />
        <meshStandardMaterial color="#26353d" roughness={0.7} />
      </mesh>

      {/* Chest Sash / Belt */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.27, 0.28, 0.12, 10]} />
        <meshStandardMaterial color="#b83328" roughness={0.6} />
      </mesh>

      {/* Traveler Scarf / Cloak shoulders */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.26, 0.22, 10]} />
        <meshStandardMaterial color="#b83328" roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.34, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#d4b595" roughness={0.6} />
      </mesh>

      {/* Conical Traveler Hat (Kasa) */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <coneGeometry args={[0.42, 0.18, 12]} />
        <meshStandardMaterial color="#a88b63" roughness={0.85} />
      </mesh>

      {/* Small Glowing Hip Lantern */}
      <group position={[0.32, 0.55, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
          <meshStandardMaterial
            color="#ffeed1"
            emissive="#ffb347"
            emissiveIntensity={1.8}
            roughness={0.4}
          />
        </mesh>
        <pointLight color="#ffb347" intensity={0.8} distance={2.5} decay={2} />
      </group>
    </group>
  );
};
