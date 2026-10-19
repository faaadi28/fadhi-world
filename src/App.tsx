import { useState, useEffect, useRef } from 'react';
import { ZenWorld } from './scene/ZenWorld';
import { HUDHeader } from './components/HUDHeader';
import { HeroOverlay } from './components/HeroOverlay';
import { GardenCompass } from './components/GardenCompass';
import { SectionDrawer } from './components/SectionDrawer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AccessibleIndex } from './components/AccessibleIndex';
import { OpenWorldControls } from './components/OpenWorldControls';
import { CinematicTourHUD } from './components/CinematicTourHUD';
import type { LandmarkTarget } from './scene/PlayerController';
import type { CableCarSpeed, StationArrivalInfo } from './scene/CableCarSystem';
import { PORTFOLIO_DATA } from './data/portfolioData';

export function App() {
  const [activeZone, setActiveZone] = useState<string>('sanctuary');
  // Default to 'day' so user immediately sees the blue sky & simple white clouds requested
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'twilight' | 'night'>('day');
  const [isFreeRoam, setIsFreeRoam] = useState<boolean>(true);
  const [nearbyLandmark, setNearbyLandmark] = useState<LandmarkTarget | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 47.0, heading: 0 });
  const [virtualInput, setVirtualInput] = useState<{ x: number; y: number; isSprinting?: boolean; isJumping?: boolean }>({ x: 0, y: 0 });
  
  const [isRidingCableCar, setIsRidingCableCar] = useState<boolean>(false);
  const [cableCarStationName, setCableCarStationName] = useState<string>("FADHI'S WORLD Station");
  const [cableCarSpeed, setCableCarSpeed] = useState<CableCarSpeed>(1);
  const [stationArrivalInfo, setStationArrivalInfo] = useState<StationArrivalInfo | null>(null);
  const [isStationPromptActive, setIsStationPromptActive] = useState<boolean>(false);
  const [playerTeleportTarget, setPlayerTeleportTarget] = useState<[number, number, number] | null>(null);
  const [continueNudge, setContinueNudge] = useState<number>(0);
  
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const lastScrollTime = useRef<number>(0);

  // Wheel-driven landmark transition in Cinematic mode
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isFreeRoam) return; // In free roam, wheel zooms camera
      const target = e.target as HTMLElement;
      if (target.closest('.drawer-body') || target.closest('.modal-card') || target.closest('.index-drawer') || target.closest('.station-arrival-card')) {
        return;
      }

      const now = Date.now();
      if (now - lastScrollTime.current < 650) return;

      const zones = PORTFOLIO_DATA.gardenZones;
      const currentIdx = zones.findIndex((z) => z.id === activeZone);
      if (currentIdx === -1) return;

      if (e.deltaY > 35) {
        const nextIdx = Math.min(currentIdx + 1, zones.length - 1);
        if (nextIdx !== currentIdx) {
          lastScrollTime.current = now;
          setActiveZone(zones[nextIdx].id);
        }
      } else if (e.deltaY < -35) {
        const prevIdx = Math.max(currentIdx - 1, 0);
        if (prevIdx !== currentIdx) {
          lastScrollTime.current = now;
          setActiveZone(zones[prevIdx].id);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeZone, isFreeRoam]);

  // Cable Car Station Interaction Handlers
  const handleStationArrival = (info: StationArrivalInfo) => {
    setStationArrivalInfo(info);
    setIsStationPromptActive(true);
    setCableCarStationName(info.currentStation.name);
  };

  const handleContinueNextDestination = () => {
    setIsStationPromptActive(false);
    setStationArrivalInfo(null);
    setContinueNudge((n) => n + 1);
  };

  const handleExitAtStation = () => {
    const currentStation = stationArrivalInfo?.currentStation;
    setIsRidingCableCar(false);
    setIsStationPromptActive(false);
    setStationArrivalInfo(null);

    if (currentStation) {
      setPlayerTeleportTarget([...currentStation.stationPlatform]);
      setActiveZone(currentStation.stationId);
      if (currentStation.stationId !== 'sanctuary') {
        setIsDrawerOpen(true);
      } else {
        setIsDrawerOpen(false);
      }
    }
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Station Prompt active shortcuts
      if (isStationPromptActive && stationArrivalInfo) {
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          handleExitAtStation();
          return;
        }
        if (e.key === 'c' || e.key === 'C' || e.key === 'Enter') {
          e.preventDefault();
          handleContinueNextDestination();
          return;
        }
        if (e.key === '1') {
          setCableCarSpeed(1);
          return;
        }
        if (e.key === '2') {
          setCableCarSpeed(2);
          return;
        }
        if (e.key === '3') {
          setCableCarSpeed(4);
          return;
        }
      }

      // Cable Car Speed shortcuts while riding
      if (isRidingCableCar) {
        if (e.key === '1') {
          setCableCarSpeed(1);
          return;
        }
        if (e.key === '2') {
          setCableCarSpeed(2);
          return;
        }
        if (e.key === '3') {
          setCableCarSpeed(4);
          return;
        }
      }

      if (e.key === 'Escape') {
        if (isStationPromptActive) {
          handleContinueNextDestination();
          return;
        }
        if (isRidingCableCar) {
          setIsRidingCableCar(false);
          return;
        }
        if (selectedProjectId) {
          setSelectedProjectId(null);
          return;
        }
        if (isIndexOpen) {
          setIsIndexOpen(false);
          return;
        }
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectId, isIndexOpen, isDrawerOpen, isRidingCableCar, isStationPromptActive, stationArrivalInfo]);

  const handleSwitchToWalkAtZone = (zoneId: string) => {
    const targetMap: Record<string, [number, number, number]> = {
      sanctuary: [0, 0.4, 42],
      about: [34, 0.5, 20],
      projects: [34, 0.4, 0],
      skills: [24, 0.6, -22],
      experience: [0, 1.4, -38],
      education: [-26, 1.5, -24],
      labs: [-36, 1.2, 0],
      contact: [-28, 0.4, 28],
    };
    if (targetMap[zoneId]) {
      setPlayerTeleportTarget(targetMap[zoneId]);
    }
    setActiveZone(zoneId);
    setIsFreeRoam(true);
    setIsRidingCableCar(false);
  };

  const handleSelectZone = (zoneId: string) => {
    setActiveZone(zoneId);
    setIsDrawerOpen(true);
  };

  return (
    <div className={`app-container theme-${timeOfDay} ${reducedMotion ? 'reduced-motion' : ''} ${isFreeRoam ? 'mode-free-roam' : 'mode-cinematic'}`}>
      {/* 3D Real-Time Open World Zen Garden Canvas */}
      <ZenWorld
        activeZone={activeZone}
        timeOfDay={timeOfDay}
        reducedMotion={reducedMotion}
        isFreeRoam={isFreeRoam}
        onSelectZone={handleSelectZone}
        onSelectProject={(id) => {
          setSelectedProjectId(id);
          setIsDrawerOpen(false);
        }}
        selectedProjectId={selectedProjectId}
        onNearLandmark={setNearbyLandmark}
        onPlayerPositionChange={setPlayerPosition}
        virtualInput={virtualInput}
        isRidingCableCar={isRidingCableCar}
        onToggleRideCableCar={setIsRidingCableCar}
        onCableCarStationName={setCableCarStationName}
        cableCarSpeed={cableCarSpeed}
        isStationPromptActive={isStationPromptActive}
        onStationArrival={handleStationArrival}
        continueNudge={continueNudge}
        teleportTarget={playerTeleportTarget}
      />

      {/* Persistent HUD Top Header (with Day / Night Theme Toggle) */}
      <HUDHeader
        timeOfDay={timeOfDay}
        onTimeChange={setTimeOfDay}
        reducedMotion={reducedMotion}
        onReducedMotionToggle={() => setReducedMotion((prev) => !prev)}
        onOpenIndex={() => setIsIndexOpen(true)}
        onResetToSanctuary={() => {
          setActiveZone('sanctuary');
          setSelectedProjectId(null);
          setIsDrawerOpen(false);
          setIsRidingCableCar(false);
          setIsStationPromptActive(false);
        }}
      />

      {/* Open World Exploration Controls & Radar */}
      <OpenWorldControls
        isFreeRoam={isFreeRoam}
        onToggleFreeRoam={setIsFreeRoam}
        nearbyLandmark={nearbyLandmark}
        onInteractLandmark={(id) => handleSelectZone(id)}
        playerPosition={playerPosition}
        onVirtualMove={setVirtualInput}
        isRidingCableCar={isRidingCableCar}
        onToggleRideCableCar={setIsRidingCableCar}
        isDrawerOpen={isDrawerOpen}
      />

      {/* Cable Car Transit HUD Overlay when Riding */}
      {isRidingCableCar && (
        <div className="cable-car-transit-banner">
          <div className="transit-icon-pulse">🚠</div>
          <div className="transit-info">
            <span className="transit-tag">AERIAL CABLE CAR TRANSIT</span>
            <span className="transit-station">{cableCarStationName}</span>
            <span className="transit-route">Route: FADHI'S WORLD ➔ About Me (Pavilion) ➔ Experience (Valley Bridge)</span>
          </div>

          {/* Interactive Speed Option Controller */}
          <div className="transit-speed-selector">
            <span className="transit-speed-tag">SPEED:</span>
            <button
              type="button"
              className={`transit-speed-pill ${cableCarSpeed === 1 ? 'active' : ''}`}
              onClick={() => setCableCarSpeed(1)}
              title="1x Scenic Cruise [Key 1]"
            >
              1x
            </button>
            <button
              type="button"
              className={`transit-speed-pill ${cableCarSpeed === 2 ? 'active' : ''}`}
              onClick={() => setCableCarSpeed(2)}
              title="2x Fast Travel [Key 2]"
            >
              2x
            </button>
            <button
              type="button"
              className={`transit-speed-pill ${cableCarSpeed === 4 ? 'active' : ''}`}
              onClick={() => setCableCarSpeed(4)}
              title="4x Express Shuttle [Key 3]"
            >
              4x
            </button>
          </div>

          <button
            type="button"
            className="btn-transit-exit"
            onClick={() => setIsRidingCableCar(false)}
            title="Step off cable car to walk on foot"
          >
            <span>Exit to Ground Walk [E]</span>
          </button>
        </div>
      )}

      {/* Station Arrival Decision Prompt Modal (Exit or Next Destination + Speed Option) */}
      {isRidingCableCar && isStationPromptActive && stationArrivalInfo && (
        <div className="station-arrival-modal-backdrop">
          <div className="station-arrival-card animate-slide-up">
            <div className="station-modal-badge">
              <span className="station-badge-icon">🚉</span>
              <span className="station-badge-text">STATION ARRIVAL</span>
            </div>

            <h2 className="station-modal-title">{stationArrivalInfo.currentStation.name}</h2>
            <p className="station-modal-desc">{stationArrivalInfo.currentStation.description}</p>

            <div className="station-next-destination-box">
              <div className="next-dest-header">
                <span className="next-dest-label">NEXT DESTINATION</span>
                <span className="next-dest-arrow">➔</span>
              </div>
              <div className="next-dest-name">{stationArrivalInfo.nextStation.name}</div>
              <div className="next-dest-sub">{stationArrivalInfo.nextStation.description}</div>
            </div>

            {/* Cable Car Speed Option Pills */}
            <div className="station-speed-selector">
              <span className="speed-control-label">⚡ Transit Speed Option:</span>
              <div className="speed-pills-row">
                <button
                  type="button"
                  className={`speed-option-btn ${cableCarSpeed === 1 ? 'active' : ''}`}
                  onClick={() => setCableCarSpeed(1)}
                >
                  <span className="speed-tag">1x</span>
                  <span className="speed-name">Scenic Cruise [1]</span>
                </button>
                <button
                  type="button"
                  className={`speed-option-btn ${cableCarSpeed === 2 ? 'active' : ''}`}
                  onClick={() => setCableCarSpeed(2)}
                >
                  <span className="speed-tag">2x</span>
                  <span className="speed-name">Fast Travel [2]</span>
                </button>
                <button
                  type="button"
                  className={`speed-option-btn ${cableCarSpeed === 4 ? 'active' : ''}`}
                  onClick={() => setCableCarSpeed(4)}
                >
                  <span className="speed-tag">4x</span>
                  <span className="speed-name">Express Shuttle [3]</span>
                </button>
              </div>
            </div>

            {/* Decision Actions: Exit at Station or Continue to Next Destination */}
            <div className="station-modal-actions">
              <button
                type="button"
                className="btn-station-exit"
                onClick={handleExitAtStation}
                title="Step off cable car to explore this station on foot"
              >
                <span className="action-icon">🚶</span>
                <span className="action-text">Exit & Explore Station [E]</span>
              </button>
              <button
                type="button"
                className="btn-station-continue"
                onClick={handleContinueNextDestination}
                title="Stay on cable car and glide to the next station"
              >
                <span className="action-text">Continue to Next Destination [C]</span>
                <span className="action-icon">➔</span>
              </button>
            </div>

            <div className="station-modal-hint">
              <span>Shortcuts: Press <strong>[E]</strong> to Exit • <strong>[C]</strong> to Continue • <strong>[1, 2, 3]</strong> for Speed</span>
            </div>
          </div>
        </div>
      )}

      {/* Opening Screen Hero Overlay (Shows on start in free-roam, dismissable on click or walk) */}
      {isFreeRoam && activeZone === 'sanctuary' && !isDrawerOpen && (
        <HeroOverlay
          onExplore={() => {
            setIsFreeRoam(true);
            setActiveZone('about');
          }}
          onViewProjects={() => {
            setActiveZone('projects');
            setIsDrawerOpen(true);
          }}
          onJumpToContact={() => {
            setActiveZone('contact');
            setIsDrawerOpen(true);
          }}
        />
      )}

      {/* Automated Cinematic Tour Showcase Controller & HUD (Active during Cinematic Tour) */}
      {!isFreeRoam && (
        <CinematicTourHUD
          isFreeRoam={isFreeRoam}
          activeZone={activeZone}
          onSelectZone={setActiveZone}
          onEnterZoneDetails={(zoneId) => {
            setActiveZone(zoneId);
            setIsDrawerOpen(true);
          }}
          onSwitchToWalk={handleSwitchToWalkAtZone}
          isDrawerOpen={isDrawerOpen}
        />
      )}

      {/* Interactive Landmark Drawer */}
      {isDrawerOpen && (
        <SectionDrawer
          activeZone={activeZone}
          onClose={() => {
            setIsDrawerOpen(false);
            if (!isFreeRoam) setActiveZone('sanctuary');
          }}
          onSelectProject={(id) => setSelectedProjectId(id)}
          onSelectZone={handleSelectZone}
        />
      )}

      {/* Bottom Landmark Navigation Stepper */}
      <GardenCompass
        activeZone={activeZone}
        onSelectZone={handleSelectZone}
      />

      {/* Deep Project Detail Inspection Modal */}
      <ProjectDetailModal
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />

      {/* Full Conventional Accessible Navigation Drawer */}
      <AccessibleIndex
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        onSelectZone={handleSelectZone}
        onSelectProject={setSelectedProjectId}
      />
    </div>
  );
}

export default App;
