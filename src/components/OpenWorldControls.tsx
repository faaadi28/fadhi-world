import { useState, useRef, useEffect } from 'react';
import { Footprints, Video, Sparkles, Navigation, ChevronRight, X } from 'lucide-react';
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
  isDrawerOpen?: boolean;
  onOpenVillageMap?: () => void;
}

export const OpenWorldControls = ({
  isFreeRoam,
  onToggleFreeRoam,
  nearbyLandmark,
  onInteractLandmark,
  playerPosition,
  onVirtualMove,
  isRidingCableCar = false,
  onToggleRideCableCar,
  isDrawerOpen = false,
  onOpenVillageMap
}: OpenWorldControlsProps) => {
  const [showMinimap, setShowMinimap] = useState(true);
  const [isSprinting, setIsSprinting] = useState(false);
  const [dismissedLandmarkId, setDismissedLandmarkId] = useState<string | null>(null);
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

      {/* 2. Interactive Zone Arrival Prompt (Appears when reaching any of the 8 zones) */}
      {isFreeRoam && !isDrawerOpen && nearbyLandmark && dismissedLandmarkId !== nearbyLandmark.id && (
        <div
          className="zone-arrival-banner animate-slide-up"
          role="dialog"
          aria-label={`Arrival at ${nearbyLandmark.zoneTag}`}
        >
          <div className="arrival-top-row">
            <div className="arrival-badge">
              <span className="arrival-pulse-dot" />
              <span className="arrival-zone-tag">{nearbyLandmark.zoneTag}</span>
            </div>
            {nearbyLandmark.hasCableCarStation && (
              <span className="cable-car-available-pill">🚠 Aerial Station</span>
            )}
            <button
              type="button"
              className="arrival-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setDismissedLandmarkId(nearbyLandmark.id);
              }}
              title="Dismiss prompt & keep exploring"
              aria-label="Dismiss arrival prompt"
            >
              <X size={15} />
            </button>
          </div>

          <div className="arrival-main-body">
            <div className="arrival-info-col">
              <h3 className="arrival-title">{nearbyLandmark.name}</h3>
              <p className="arrival-description">{nearbyLandmark.description}</p>
            </div>
          </div>

          <div className="arrival-actions-row">
            <button
              type="button"
              className="btn-arrival-enter"
              onClick={() => onInteractLandmark(nearbyLandmark.id)}
              title={`Enter ${nearbyLandmark.zoneTag} Page [Press Enter or E]`}
            >
              <span className="key-shortcut-tag">Enter ↵</span>
              <span className="action-label">
                Enter {nearbyLandmark.zoneTag.includes('—') ? nearbyLandmark.zoneTag.split('—')[1].trim() : nearbyLandmark.name} Page
              </span>
              <ChevronRight size={16} className="action-arrow" />
            </button>

            {nearbyLandmark.hasCableCarStation && (
              <button
                type="button"
                className="btn-arrival-cablecar"
                onClick={() => onToggleRideCableCar?.(true)}
                title="Board aerial cable car [Press C]"
              >
                <span>🚠 Cable Car [C]</span>
              </button>
            )}
          </div>

          <div className="arrival-footer-hint">
            <span>Press <strong>[Enter]</strong> or <strong>[E]</strong> or click button to open zone details</span>
          </div>
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
        <div className="radar-header">
          <div
            className="radar-title-box"
            onClick={() => setShowMinimap((prev) => !prev)}
            role="button"
            tabIndex={0}
            title="Toggle Mini-Radar visibility"
          >
            <Navigation size={14} className="radar-icon" />
            <span className="radar-title">World Radar</span>
            <span className="radar-coords">
              {playerPosition.x.toFixed(1)}, {playerPosition.z.toFixed(1)}
            </span>
          </div>
          {onOpenVillageMap && (
            <button
              type="button"
              className="radar-map-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVillageMap();
              }}
              title="Open Full Village Map & All Zones [Press M]"
            >
              <span>Map [M]</span>
            </button>
          )}
        </div>

        {showMinimap && (
          <div
            className="radar-circle"
            onClick={onOpenVillageMap}
            title="Click to open Full Village Map of all zones [Press M]"
            style={{ cursor: onOpenVillageMap ? 'pointer' : 'default' }}
          >
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
                  title={`${lm.zoneTag}: ${lm.name} — ${lm.subtitle}`}
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
