import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface GardenCompassProps {
  activeZone: string;
  onSelectZone: (zoneId: string) => void;
  onOpenVillageMap?: () => void;
}

export const GardenCompass = ({ activeZone, onSelectZone, onOpenVillageMap }: GardenCompassProps) => {
  const currentIndex = PORTFOLIO_DATA.gardenZones.findIndex((z) => z.id === activeZone);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  const handlePrev = () => {
    const prevIdx = (safeIndex - 1 + PORTFOLIO_DATA.gardenZones.length) % PORTFOLIO_DATA.gardenZones.length;
    onSelectZone(PORTFOLIO_DATA.gardenZones[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (safeIndex + 1) % PORTFOLIO_DATA.gardenZones.length;
    onSelectZone(PORTFOLIO_DATA.gardenZones[nextIdx].id);
  };

  return (
    <nav className="garden-compass" aria-label="Garden Landmarks Navigation">
      {/* Village Map Trigger Button on Compass */}
      <button
        type="button"
        className="compass-map-trigger-btn"
        onClick={onOpenVillageMap}
        title="Open Village Map of all zones [Press M]"
        aria-label="Open Village Map of all zones"
      >
        <Compass size={17} className="compass-spin-icon" />
        <span className="compass-map-label">Village Map</span>
      </button>

      <div className="compass-divider" />

      <button
        type="button"
        className="compass-nav-btn"
        onClick={handlePrev}
        title="Previous garden landmark"
        aria-label="Previous garden landmark"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="compass-track">
        {PORTFOLIO_DATA.gardenZones.map((zone, idx) => {
          const isActive = zone.id === activeZone;
          return (
            <button
              key={zone.id}
              type="button"
              className={`compass-node ${isActive ? 'active' : ''}`}
              onClick={() => onSelectZone(zone.id)}
              title={`${zone.name} — ${zone.description}`}
              aria-label={zone.name}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="node-dot"></span>
              <span className="node-number">0{idx + 1}</span>
              <span className="node-name">{zone.name}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="compass-nav-btn"
        onClick={handleNext}
        title="Next garden landmark"
        aria-label="Next garden landmark"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
};
