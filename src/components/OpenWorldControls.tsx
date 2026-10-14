import { useState, useRef, useEffect } from 'react';
import { Footprints, Video, Sparkles, Navigation } from 'lucide-react';
import type { LandmarkTarget } from '../scene/PlayerController';
import { LANDMARK_TARGETS } from '../scene/PlayerController';

interface OpenWorldControlsProps {
  isFreeRoam: boolean;
  onToggleFreeRoam: (enabled: boolean) => void;
  nearbyLandmark: LandmarkTarget | null;
  onInteractLandmark: (landmarkId: string) => void;
  playerPosition: { x: number; z: number; heading: number };
  onVirtualMove?: (input: { x: number; y: number; isSprinting?: boolean; isJumping?: boolean }) => void;
  isRidingCableCar?: boolean;
  onToggleRideCableCar?: (riding: boolean) => void;
}

export const OpenWorldControls = ({
  isFreeRoam,
  onToggleFreeRoam,
  nearbyLandmark,
  onInteractLandmark,
  playerPosition,
  onVirtualMove,
  isRidingCableCar = false,
  onToggleRideCableCar
}: OpenWorldControlsProps) => {
  const [showMinimap, setShowMinimap] = useState(true);
  const [isSprinting, setIsSprinting] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickThumb, setJoystickThumb] = useState({ x: 0, y: 0 });
  const isDraggingJoystick = useRef(false);

  // Virtual Joystick touch handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDraggingJoystick.current = true;
    updateJoystick(e);
  };

  const updateJoystick = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingJoystick.current || !joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const maxRadius = 42;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setJoystickThumb({ x: dx, y: dy });

    onVirtualMove?.({
      x: dx / maxRadius,
      y: -dy / maxRadius,
      isSprinting
    });
  };

  const handleTouchEnd = () => {
    isDraggingJoystick.current = false;
    setJoystickThumb({ x: 0, y: 0 });
    onVirtualMove?.({ x: 0, y: 0, isSprinting: false });
  };

  useEffect(() => {
    const onWindowMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingJoystick.current) {
        updateJoystick(e as any);
      }
    };
    const onWindowUp = () => {
      if (isDraggingJoystick.current) {
        handleTouchEnd();
      }
    };
    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
    window.addEventListener('touchmove', onWindowMove);
    window.addEventListener('touchend', onWindowUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup', onWindowUp);
      window.removeEventListener('touchmove', onWindowMove);
      window.removeEventListener('touchend', onWindowUp);
    };
  }, [isSprinting]);

  return (
    <div className="open-world-hud">
      {/* 1. Mode Switcher Bar (Top Center) */}
      <div className="world-mode-bar">
        <button
          type="button"
          className={`mode-btn ${isFreeRoam && !isRidingCableCar ? 'active' : ''}`}
          onClick={() => {
            onToggleFreeRoam(true);
            onToggleRideCableCar?.(false);
          }}
          title="Freely walk and explore the 3D open world on foot with WASD or Joystick"
        >
          <Footprints size={15} />
          <span>Walk On Foot</span>
        </button>

        <button
          type="button"
          className={`mode-btn cable-car-btn ${isRidingCableCar ? 'active' : ''}`}
          onClick={() => {
            onToggleFreeRoam(true);
            onToggleRideCableCar?.(!isRidingCableCar);
          }}
          title="Board aerial cable car: Welcome Plaza -> About Me (Pavilion) -> Experience (Bridge)"
        >
          <span className="cable-car-emoji">🚠</span>
          <span>Ride Cable Car</span>
        </button>

        <button
          type="button"
          className={`mode-btn ${!isFreeRoam ? 'active' : ''}`}
          onClick={() => {
            onToggleFreeRoam(false);
            onToggleRideCableCar?.(false);
          }}
          title="Guided cinematic camera transitions between landmarks"
        >
          <Video size={15} />
          <span>Cinematic Tour</span>
        </button>
      </div>

      {/* 2. Interactive Proximity Prompt (Appears when near a landmark) */}
      {isFreeRoam && nearbyLandmark && (
        <div
          className="proximity-prompt-card animate-pulse"
          onClick={() => onInteractLandmark(nearbyLandmark.id)}
          role="button"
          tabIndex={0}
        >
          <div className="prompt-key">E</div>
          <div className="prompt-info">
            <span className="prompt-title">{nearbyLandmark.name}</span>
            <span className="prompt-action">Press [E] or Click to Inspect ({nearbyLandmark.subtitle})</span>
          </div>
          <Sparkles size={16} className="prompt-icon" />
        </div>
      )}

      {/* 3. Desktop Controls Legend (Bottom Left) */}
      {isFreeRoam && (
        <div className="desktop-controls-legend">
          <div className="legend-row">
            <span className="key-badge">W</span>
            <span className="key-badge">A</span>
            <span className="key-badge">S</span>
            <span className="key-badge">D</span>
            <span className="legend-text">Move / Walk</span>
          </div>
          <div className="legend-row">
            <span className="key-badge">Shift</span>
            <span className="legend-text">Sprint</span>
            <span className="key-badge">Space</span>
            <span className="legend-text">Jump</span>
          </div>
          <div className="legend-row">
            <span className="key-badge">Mouse Drag</span>
            <span className="legend-text">Look 360°</span>
            <span className="key-badge">V</span>
            <span className="legend-text">1st/3rd View</span>
          </div>
        </div>
      )}

      {/* 4. Mini-Radar / World Map Widget (Top Left or Collapsible) */}
      <div className="radar-container">
        <div className="radar-header" onClick={() => setShowMinimap((prev) => !prev)}>
          <Navigation size={14} className="radar-icon" />
          <span className="radar-title">World Radar</span>
          <span className="radar-coords">
            {playerPosition.x.toFixed(1)}, {playerPosition.z.toFixed(1)}
          </span>
        </div>

        {showMinimap && (
          <div className="radar-circle">
            {/* Cardinal Directions */}
            <span className="radar-cardinal cardinal-n">N</span>
            <span className="radar-cardinal cardinal-s">S</span>
            <span className="radar-cardinal cardinal-w">W</span>
            <span className="radar-cardinal cardinal-e">E</span>

            {/* Radar Grid Rings */}
            <div className="radar-ring ring-1" />
            <div className="radar-ring ring-2" />

            {/* Central Lake Boundary Indicator */}
            <div className="radar-lake" />

            {/* Landmark Blips */}
            {LANDMARK_TARGETS.map((lm) => {
              // Map world coords (-50 to 50) to radar circle (0 to 100%)
              const left = 50 + (lm.position[0] / 55) * 44;
              const top = 50 + (lm.position[2] / 55) * 44;
              const isNearby = nearbyLandmark?.id === lm.id;

              return (
                <div
                  key={lm.id}
                  className={`radar-blip ${isNearby ? 'active' : ''}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  title={`${lm.name} — ${lm.subtitle}`}
                  onClick={() => onInteractLandmark(lm.id)}
                />
              );
            })}

            {/* Player Avatar Blip & Heading Cone */}
            <div
              className="player-blip"
              style={{
                left: `${50 + (playerPosition.x / 55) * 44}%`,
                top: `${50 + (playerPosition.z / 55) * 44}%`,
                transform: `translate(-50%, -50%) rotate(${playerPosition.heading}rad)`
              }}
            >
              <div className="player-heading-cone" />
              <div className="player-dot" />
            </div>
          </div>
        )}
      </div>

      {/* 5. Mobile / Touch On-Screen Virtual Joystick & Action Buttons */}
      {isFreeRoam && (
        <div className="touch-controls-container">
          {/* Analog Joystick */}
          <div
            ref={joystickBaseRef}
            className="virtual-joystick-base"
            onMouseDown={handleTouchStart}
            onTouchStart={handleTouchStart}
          >
            <div
              className="virtual-joystick-thumb"
              style={{
                transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`
              }}
            />
          </div>

          {/* Action Buttons (Sprint & Jump) */}
          <div className="virtual-actions-group">
            <button
              type="button"
              className={`virtual-action-btn ${isSprinting ? 'active' : ''}`}
              onClick={() => {
                const next = !isSprinting;
                setIsSprinting(next);
                onVirtualMove?.({ x: 0, y: 0, isSprinting: next });
              }}
              title="Toggle Sprint"
            >
              <span>RUN</span>
            </button>
            <button
              type="button"
              className="virtual-action-btn jump-btn"
              onClick={() => {
                onVirtualMove?.({ x: 0, y: 0, isJumping: true });
                setTimeout(() => {
                  onVirtualMove?.({ x: 0, y: 0, isJumping: false });
                }, 200);
              }}
              title="Jump"
            >
              <span>JUMP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
