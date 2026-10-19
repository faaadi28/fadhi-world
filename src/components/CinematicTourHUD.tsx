import { useCallback, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, BookOpen, Footprints, Video
} from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface CinematicTourHUDProps {
  isFreeRoam: boolean;
  activeZone: string;
  onSelectZone: (zoneId: string) => void;
  onEnterZoneDetails: (zoneId: string) => void;
  onSwitchToWalk: (zoneId: string) => void;
  isDrawerOpen: boolean;
}

export const CinematicTourHUD = ({
  isFreeRoam,
  activeZone,
  onSelectZone,
  onEnterZoneDetails,
  onSwitchToWalk,
  isDrawerOpen
}: CinematicTourHUDProps) => {
  const zones = PORTFOLIO_DATA.gardenZones;
  const currentIndex = zones.findIndex((z) => z.id === activeZone);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentZone = zones[safeIndex];

  // Advance to next zone in sequence
  const handleNext = useCallback(() => {
    const nextIdx = (safeIndex + 1) % zones.length;
    onSelectZone(zones[nextIdx].id);
  }, [safeIndex, zones, onSelectZone]);

  // Go to previous zone
  const handlePrev = useCallback(() => {
    const prevIdx = (safeIndex - 1 + zones.length) % zones.length;
    onSelectZone(zones[prevIdx].id);
  }, [safeIndex, zones, onSelectZone]);

  // Keyboard navigation during Cinematic Tour
  useEffect(() => {
    if (isFreeRoam || isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter or 'E' to open Zone Details
      if (e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onEnterZoneDetails(currentZone.id);
        return;
      }
      // Right arrow or 'N' to jump to next zone
      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNext();
        return;
      }
      // Left arrow or 'B' to jump to previous zone
      if (e.key === 'ArrowLeft' || e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handlePrev();
        return;
      }
      // 'W' to switch to walking on foot
      if (e.key === 'w' || e.key === 'W') {
        onSwitchToWalk(currentZone.id);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFreeRoam, isDrawerOpen, currentZone, handleNext, handlePrev, onEnterZoneDetails, onSwitchToWalk]);

  if (isFreeRoam) {
    return null;
  }

  const nextIndex = (safeIndex + 1) % zones.length;
  const nextZone = zones[nextIndex];

  return (
    <aside className="cinematic-show-hud animate-slide-up" aria-label="Cinematic Tour Viewpoint">
      {/* Top Header Badge & Zone Counter */}
      <div className="show-header">
        <div className="show-badge-cluster">
          <span className="show-live-pill">
            <Video size={13} />
            CINEMATIC TOUR
          </span>
          <span className="show-zone-index">
            ZONE 0{safeIndex + 1} OF 0{zones.length}
          </span>
        </div>

        <div className="show-zone-step-hint">
          <span>Explore at your own pace</span>
        </div>
      </div>

      {/* Main Zone Feature Display */}
      <div className="show-main-content">
        <div className="show-zone-info">
          <span className="show-zone-tag">{currentZone.zoneTag}</span>
          <h2 className="show-zone-title">{currentZone.name}</h2>
          <p className="show-zone-desc">{currentZone.description}</p>
        </div>
      </div>

      {/* Action Decision Row: Enter Details, Walk on Foot, Next/Prev Zone */}
      <div className="show-actions-row">
        {/* 1. Enter Zone Details Page Option */}
        <button
          type="button"
          className="btn-show-action btn-enter-details"
          onClick={() => onEnterZoneDetails(currentZone.id)}
          title={`Open ${currentZone.zoneTag} Details [Enter or E]`}
        >
          <BookOpen size={15} />
          <span>Enter {currentZone.zoneTag.includes('—') ? currentZone.zoneTag.split('—')[1].trim() : 'Details'} Page</span>
          <span className="key-shortcut-tag">Enter ↵</span>
        </button>

        {/* 2. Walk on Foot Option */}
        <button
          type="button"
          className="btn-show-action btn-walk-here"
          onClick={() => onSwitchToWalk(currentZone.id)}
          title="Teleport avatar here and start walking on foot [Key W]"
        >
          <Footprints size={14} />
          <span>Walk On Foot</span>
        </button>

        {/* 3. Previous & Next Stepper */}
        <div className="show-nav-stepper">
          <button
            type="button"
            className="btn-step-prev"
            onClick={handlePrev}
            title="Previous Zone [Left Arrow]"
            aria-label="Previous Zone"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <button
            type="button"
            className="btn-step-next"
            onClick={handleNext}
            title={`Glide to ${nextZone.zoneTag} [Right Arrow]`}
          >
            <span>Next Zone</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Guidance Hint */}
      <div className="show-footer-hint">
        <span>Press <strong>[Enter]</strong> to open page • <strong>[➔]</strong> for next zone • <strong>[W]</strong> to walk on foot</span>
      </div>
    </aside>
  );
};
