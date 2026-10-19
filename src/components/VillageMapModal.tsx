import { useState, useMemo } from 'react';
import { X, MapPin, Footprints, BookOpen, Compass, Sparkles, Navigation } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface VillageMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeZone: string;
  playerPosition: { x: number; z: number; heading: number };
  onFastTravelToZone: (zoneId: string) => void;
  onOpenZoneDetails: (zoneId: string) => void;
}

interface MapZoneInfo {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  coords: [number, number]; // [worldX, worldZ]
  highlights: string[];
}

const VILLAGE_ZONES: MapZoneInfo[] = [
  {
    id: 'sanctuary',
    number: '01',
    title: "FADHI'S WORLD",
    subtitle: 'Grand Entrance & Welcome Hub',
    category: 'Gateway',
    description: "The primary portal into Abdulla Fadhi's 3D Zen universe. Features the grand vermilion Torii gate and southern arrival plaza.",
    icon: '⛩️',
    color: '#f59e0b',
    coords: [0, 42],
    highlights: ['Vermilion Torii Gate', 'South Promenade Start', 'Cable Car Station 01']
  },
  {
    id: 'about',
    number: '02',
    title: 'The Lakeside Pavilion',
    subtitle: 'About Abdulla & Philosophy',
    category: 'Profile',
    description: 'Traditional Japanese timber pavilion situated on the southeastern shore. Details physics roots, first-principles mindset, and developer background.',
    icon: '🏯',
    color: '#10b981',
    coords: [34, 20],
    highlights: ['Timber Engawa Deck', 'Physics to Software Journey', 'Cable Car Station 02']
  },
  {
    id: 'projects',
    number: '03',
    title: 'The Project Archipelago',
    subtitle: 'Featured Works & Web Platforms',
    category: 'Projects',
    description: 'Situated on the eastern waterfront right beside the Pavilion. Features an expansive wooden viewing deck and 6 interactive stepping stone pedestals for live platforms.',
    icon: '🏝️',
    color: '#3b82f6',
    coords: [34, 0],
    highlights: ['Tagspot Travel Platform', 'Popular Junction & ConnectCampus', 'Cable Car Station 03']
  },
  {
    id: 'skills',
    number: '04',
    title: 'The Innovation Meadow',
    subtitle: 'Technical Skills & Matrix',
    category: 'Proficiencies',
    description: 'Open meadow continuing northeast along the right bank path. Displays glowing computational monoliths showcasing full-stack and systems skills.',
    icon: '🌸',
    color: '#8b5cf6',
    coords: [24, -22],
    highlights: ['Full-Stack Engineering', 'Systems & Defensive Security', 'Cable Car Station 04']
  },
  {
    id: 'experience',
    number: '05',
    title: 'The Grand Valley Bridge',
    subtitle: 'Career Milestones & Roles',
    category: 'Experience',
    description: 'Graceful arched Moon Bridge spanning the northern river channel. Represents career progression, physics mentorship, and frontend engineering roles.',
    icon: '🌉',
    color: '#ef4444',
    coords: [0, -38],
    highlights: ['Arched Moon Bridge', 'Physics Coaching & Leadership', 'Cable Car Station 05']
  },
  {
    id: 'education',
    number: '06',
    title: 'The Knowledge Summit',
    subtitle: 'Degrees & Scientific Foundations',
    category: 'Academia',
    description: 'Hilltop stone observatory perched along the northwest ridge. Highlights Master of Computer Applications (MCA) and B.Sc. (Hons) Physics degrees.',
    icon: '🔭',
    color: '#06b6d4',
    coords: [-26, -24],
    highlights: ['MCA (Calicut Univ) & B.Sc. Physics', 'Observatory Summit', 'Cable Car Station 06']
  },
  {
    id: 'labs',
    number: '07',
    title: 'The Cybersecurity Bastion',
    subtitle: 'Isolated Attack Labs & Research',
    category: 'Security',
    description: 'Fortress monolith on the western shore dedicated to network enumeration, vulnerability research, Nmap, Wireshark, and TryHackMe CTF rooms.',
    icon: '🛡️',
    color: '#6366f1',
    coords: [-36, 0],
    highlights: ['Isolated Network Labs', 'CTF Labs & Network Defense', 'Cable Car Station 07']
  },
  {
    id: 'contact',
    number: '08',
    title: 'The Communications Outpost',
    subtitle: 'Direct Contact & Inquiries',
    category: 'Contact',
    description: 'Southwestern sacred shrine and messenger bell. Provides verified contact channels, direct email, LinkedIn, GitHub, and verified CV download.',
    icon: '📮',
    color: '#22c55e',
    coords: [-28, 28],
    highlights: ['Direct Inquiries & Socials', 'Verified CV Download', 'Cable Car Station 08']
  }
];

export const VillageMapModal = ({
  isOpen,
  onClose,
  activeZone,
  playerPosition,
  onFastTravelToZone,
  onOpenZoneDetails
}: VillageMapModalProps) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(activeZone);

  const selectedZone = useMemo(() => {
    return VILLAGE_ZONES.find((z) => z.id === selectedZoneId) || VILLAGE_ZONES[0];
  }, [selectedZoneId]);

  if (!isOpen) return null;

  // Transform 3D world coordinates (-55 to 55) into SVG viewBox (800 x 800)
  const mapScale = 6.2; // pixels per world meter
  const mapCenter = 400; // SVG center

  const toSvgX = (x: number) => mapCenter + x * mapScale;
  const toSvgY = (z: number) => mapCenter + z * mapScale; // z maps to SVG y

  // SVG path definition for the circular promenade around the pond
  const circularPathSvg = VILLAGE_ZONES.map((z, idx) => {
    const x = toSvgX(z.coords[0]);
    const y = toSvgY(z.coords[1]);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  // Player position in SVG
  const playerSvgX = toSvgX(playerPosition.x);
  const playerSvgY = toSvgY(playerPosition.z);

  return (
    <div className="village-map-backdrop" onClick={onClose}>
      <div className="village-map-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="village-map-header">
          <div className="map-title-group">
            <div className="map-emblem">
              <Compass size={22} className="map-compass-spin" />
            </div>
            <div>
              <div className="map-pretitle">VILLAGE CARTOGRAPHY & ZONE DIRECTORY • 集落地図</div>
              <h2 className="map-title">Stillwater Garden — 8 Circular Zones</h2>
            </div>
          </div>

          <div className="map-header-actions">
            <span className="map-legend-hint">
              <Navigation size={13} />
              <span>Click any zone to inspect & fast-travel</span>
            </span>
            <button
              type="button"
              className="map-close-btn"
              onClick={onClose}
              title="Close Map [Press M or Esc]"
              aria-label="Close Map"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Body: Map Canvas (Left) + Zone Detail Card (Right) */}
        <div className="village-map-content">
          {/* Interactive Vector Map Canvas */}
          <div className="village-map-canvas-container">
            <svg
              className="village-map-svg"
              viewBox="0 0 800 800"
              role="img"
              aria-label="Interactive map of Stillwater Village"
            >
              <defs>
                {/* Radial gradient for terrain base */}
                <radialGradient id="terrainGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e2c22" />
                  <stop offset="55%" stopColor="#18231c" />
                  <stop offset="85%" stopColor="#121a15" />
                  <stop offset="100%" stopColor="#0b100d" />
                </radialGradient>

                {/* Central Lake water gradient */}
                <radialGradient id="lakeWaterGrad" cx="45%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.35" />
                  <stop offset="85%" stopColor="#0369a1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.15" />
                </radialGradient>

                {/* Glow filter for active elements */}
                <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Base Terrain Grass Disk */}
              <circle cx="400" cy="400" r="375" fill="url(#terrainGrad)" stroke="#2f4233" strokeWidth="2" />

              {/* Elevation Rings framing the outer garden */}
              <circle cx="400" cy="400" r="340" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="6 6" />
              <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

              {/* 2. Central Lake Basin */}
              {/* Center (-4, 2) with semi-axes (16, 26) mapped to SVG */}
              <ellipse
                cx={toSvgX(-4)}
                cy={toSvgY(2)}
                rx={16 * mapScale}
                ry={26 * mapScale}
                fill="url(#lakeWaterGrad)"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeOpacity="0.4"
              />
              <ellipse
                cx={toSvgX(-4)}
                cy={toSvgY(2)}
                rx={11 * mapScale}
                ry={18 * mapScale}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeOpacity="0.2"
                strokeDasharray="4 8"
              />
              <text
                x={toSvgX(-4)}
                y={toSvgY(2)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#38bdf8"
                fillOpacity="0.75"
                fontSize="12"
                fontWeight="600"
                letterSpacing="3"
                fontFamily="sans-serif"
              >
                CENTRAL LAKE • 湖
              </text>

              {/* 3. Aerial Cable Car Loop connecting all 8 Zones */}
              <path
                d={`M ${toSvgX(5)} ${toSvgY(40)} L ${toSvgX(36)} ${toSvgY(22)} L ${toSvgX(36)} ${toSvgY(0)} L ${toSvgX(26)} ${toSvgY(-22)} L ${toSvgX(4)} ${toSvgY(-36)} L ${toSvgX(-28)} ${toSvgY(-24)} L ${toSvgX(-38)} ${toSvgY(0)} L ${toSvgX(-30)} ${toSvgY(28)} Z`}
                fill="none"
                stroke="#eab308"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                strokeOpacity="0.75"
              />
              {/* Cable Car Station Badges along the loop */}
              {[
                { name: '01', x: 5, z: 40 },
                { name: '02', x: 36, z: 22 },
                { name: '03', x: 36, z: 0 },
                { name: '04', x: 26, z: -22 },
                { name: '05', x: 4, z: -36 },
                { name: '06', x: -28, z: -24 },
                { name: '07', x: -38, z: 0 },
                { name: '08', x: -30, z: 28 },
              ].map((st, i) => (
                <g key={`cable-map-st-${i}`}>
                  <circle cx={toSvgX(st.x)} cy={toSvgY(st.z)} r="5" fill="#facc15" stroke="#1c1917" strokeWidth="1.5" />
                  <circle cx={toSvgX(st.x)} cy={toSvgY(st.z)} r="8" fill="none" stroke="#facc15" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2 2" />
                </g>
              ))}
              <text x={toSvgX(14)} y={toSvgY(33)} fill="#facc15" fontSize="10" fillOpacity="0.9" fontStyle="italic" fontWeight="600">
                Aerial Cable Car Loop (8 Stops) 🚠
              </text>

              {/* 4. Continuous Circular Promenade Footpath */}
              <path
                d={circularPathSvg}
                fill="none"
                stroke="#a89884"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.8"
              />
              {/* Promenade Centerline highlight */}
              <path
                d={circularPathSvg}
                fill="none"
                stroke="#fef3c7"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.6"
              />

              {/* 5. All 8 Zone Nodes along the Circular Promenade */}
              {VILLAGE_ZONES.map((zone) => {
                const zX = toSvgX(zone.coords[0]);
                const zY = toSvgY(zone.coords[1]);
                const isSelected = selectedZoneId === zone.id;
                const isCurrent = activeZone === zone.id;

                return (
                  <g
                    key={zone.id}
                    className={`map-zone-node ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedZoneId(zone.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer pulse wave if selected */}
                    {isSelected && (
                      <circle
                        cx={zX}
                        cy={zY}
                        r="34"
                        fill="none"
                        stroke={zone.color}
                        strokeWidth="2.5"
                        strokeOpacity="0.75"
                        className="map-node-pulse"
                      />
                    )}

                    {/* Zone Base Disc */}
                    <circle
                      cx={zX}
                      cy={zY}
                      r={isSelected ? 22 : 18}
                      fill="#1e262a"
                      stroke={zone.color}
                      strokeWidth={isSelected ? 3.5 : 2}
                      filter={isSelected ? 'url(#goldGlow)' : undefined}
                    />

                    {/* Zone Icon Emoji or Number */}
                    <text
                      x={zX}
                      y={zY + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isSelected ? '14' : '12'}
                      fontWeight="700"
                      fill="#ffffff"
                    >
                      {zone.number}
                    </text>

                    {/* Zone Title Label on Map */}
                    <rect
                      x={zX - 55}
                      y={zY + (zone.coords[1] > 0 ? 24 : -38)}
                      width="110"
                      height="20"
                      rx="10"
                      fill="rgba(15, 23, 42, 0.88)"
                      stroke={isSelected ? zone.color : 'rgba(255,255,255,0.15)'}
                      strokeWidth="1"
                    />
                    <text
                      x={zX}
                      y={zY + (zone.coords[1] > 0 ? 34 : -28)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9.5"
                      fontWeight="600"
                      fill={isSelected ? '#fde047' : '#e2e8f0'}
                    >
                      {zone.number}. {zone.title.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* 6. Real-Time Player Position Marker */}
              <g
                className="map-player-pin"
                transform={`translate(${playerSvgX}, ${playerSvgY})`}
              >
                {/* Heading directional pointer */}
                <g transform={`rotate(${(playerPosition.heading * 180) / Math.PI})`}>
                  <polygon points="0,-16 -7,0 7,0" fill="#f59e0b" />
                </g>
                {/* Pulsing rings */}
                <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6" className="player-ring-pulse" />
                <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <rect x="-42" y="-36" width="84" height="18" rx="9" fill="#f59e0b" />
                <text x="0" y="-27" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="800" fill="#18181b">
                  YOU ARE HERE
                </text>
              </g>
            </svg>
          </div>

          {/* Side Zone Card & Fast-Travel Controls */}
          <div className="village-map-sidebar">
            <div className="zone-inspect-card" style={{ borderColor: selectedZone.color }}>
              <div className="zone-inspect-header">
                <span className="zone-inspect-badge" style={{ backgroundColor: `${selectedZone.color}22`, color: selectedZone.color }}>
                  ZONE {selectedZone.number} • {selectedZone.category.toUpperCase()}
                </span>
                <span className="zone-inspect-coords">
                  [{selectedZone.coords[0].toFixed(1)}, {selectedZone.coords[1].toFixed(1)}]
                </span>
              </div>

              <div className="zone-inspect-title-row">
                <span className="zone-inspect-icon">{selectedZone.icon}</span>
                <div>
                  <h3 className="zone-inspect-title">{selectedZone.title}</h3>
                  <div className="zone-inspect-sub">{selectedZone.subtitle}</div>
                </div>
              </div>

              <p className="zone-inspect-desc">{selectedZone.description}</p>

              {/* Highlights List */}
              <div className="zone-inspect-highlights">
                <span className="highlights-label">Zone Key Features:</span>
                <ul>
                  {selectedZone.highlights.map((h, i) => (
                    <li key={i}>
                      <span className="highlight-bullet" style={{ backgroundColor: selectedZone.color }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="zone-inspect-actions">
                <button
                  type="button"
                  className="btn-fast-travel"
                  style={{ backgroundColor: selectedZone.color }}
                  onClick={() => {
                    onFastTravelToZone(selectedZone.id);
                    onClose();
                  }}
                  title="Teleport to this zone along the circular promenade"
                >
                  <Footprints size={16} />
                  <span>Walk Here / Fast Travel</span>
                </button>

                <button
                  type="button"
                  className="btn-open-zone-page"
                  onClick={() => {
                    onOpenZoneDetails(selectedZone.id);
                    onClose();
                  }}
                  title="Open full section drawer for this zone"
                >
                  <BookOpen size={16} />
                  <span>View Full Details Page</span>
                </button>
              </div>
            </div>

            {/* Quick 8-Zone Selector Pills */}
            <div className="map-quick-zone-list">
              <span className="quick-list-title">All 8 Village Zones:</span>
              <div className="quick-zone-grid">
                {VILLAGE_ZONES.map((z) => {
                  const isCurrent = selectedZoneId === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      className={`quick-zone-btn ${isCurrent ? 'active' : ''}`}
                      onClick={() => setSelectedZoneId(z.id)}
                      style={{
                        borderColor: isCurrent ? z.color : undefined,
                        boxShadow: isCurrent ? `0 0 10px ${z.color}44` : undefined
                      }}
                    >
                      <span className="quick-zone-num" style={{ color: z.color }}>{z.number}</span>
                      <span className="quick-zone-name">{z.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="village-map-footer">
          <span>Shortcuts: Press <strong>[M]</strong> or <strong>[Esc]</strong> to toggle Village Map • Click any zone node to select</span>
        </div>
      </div>
    </div>
  );
};
