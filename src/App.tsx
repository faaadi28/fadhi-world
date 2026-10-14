import { useState, useEffect, useRef } from 'react';
import { ZenWorld } from './scene/ZenWorld';
import { HUDHeader } from './components/HUDHeader';
import { HeroOverlay } from './components/HeroOverlay';
import { GardenCompass } from './components/GardenCompass';
import { SectionDrawer } from './components/SectionDrawer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AccessibleIndex } from './components/AccessibleIndex';
import { OpenWorldControls } from './components/OpenWorldControls';
import type { LandmarkTarget } from './scene/PlayerController';
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
      if (target.closest('.drawer-body') || target.closest('.modal-card') || target.closest('.index-drawer')) {
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

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [selectedProjectId, isIndexOpen, isDrawerOpen, isRidingCableCar]);

  const handleSelectZone = (zoneId: string) => {
    setActiveZone(zoneId);
    if (zoneId !== 'sanctuary') {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
    }
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

      {/* Opening Screen Hero Overlay (Shows on start, dismissable on click or walk) */}
      {activeZone === 'sanctuary' && !isDrawerOpen && (
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

      {/* Interactive Landmark Drawer */}
      {isDrawerOpen && (
        <SectionDrawer
          activeZone={activeZone}
          onClose={() => {
            setIsDrawerOpen(false);
            if (!isFreeRoam) setActiveZone('sanctuary');
          }}
          onSelectProject={(id) => setSelectedProjectId(id)}
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
