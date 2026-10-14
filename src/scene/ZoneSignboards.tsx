import { Html } from '@react-three/drei';

export interface ZoneSignboardData {
  zoneId: string;
  badge: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  rotationY: number;
  items: string[];
}

export const ZONE_SIGNBOARDS: ZoneSignboardData[] = [
  {
    zoneId: 'sanctuary',
    badge: 'ZONE 01 • GATEWAY',
    title: "FADHI'S WORLD",
    subtitle: 'Grand Entrance & Welcome Hub',
    position: [3.6, 0.38, 45.0],
    rotationY: -0.35,
    items: [
      "Official 3D Universe of Abdulla Fadhi K.",
      "About Me: MCA Student & Aspiring Cybersecurity Professional",
      "Cable Car Station 1: Direct aerial line to About Me Pavilion",
      "Grand Cobblestone Promenade & Illuminated Lantern Avenue"
    ]
  },
  {
    zoneId: 'about',
    badge: 'ZONE 02 • BIOGRAPHY',
    title: 'THE LAKESIDE PAVILION',
    subtitle: 'About Me & Core Philosophy',
    position: [28.0, 0.40, 17.5],
    rotationY: -0.60,
    items: [
      "Personal background, first-principles mindset & bio",
      "B.Sc. (Hons) Physics to Cybersecurity journey",
      "Cable Car Station 2: Line to Experience Valley Bridge",
      "Reflective Zen sand terrace & lakeside koi pond"
    ]
  },
  {
    zoneId: 'projects',
    badge: 'ZONE 03 • SHOWCASE',
    title: 'PROJECT ARCHIPELAGO',
    subtitle: 'Web & Security Applications',
    position: [-7.5, 0.38, 23.5],
    rotationY: 0.40,
    items: [
      "6 Interactive Project Stepping Stones over water",
      "Live Production Platforms: Tagspot & Popular Junction",
      "Security Engineering: Vulnerability Scanner & Crypto Hub",
      "Campus Connect & Collaborative Event Systems"
    ]
  },
  {
    zoneId: 'experience',
    badge: 'ZONE 05 • CAREER',
    title: 'THE GRAND VALLEY BRIDGE',
    subtitle: 'Professional Roles & Milestones',
    position: [-3.8, 0.65, -26.0],
    rotationY: 0.15,
    items: [
      "Front-End Web Development on live production platforms",
      "Physics Teaching & Lab Mentorship at Calicut University",
      "Collaborative Agile Git workflows & code reviews",
      "Cable Car Station 3: Mountain canyon transit terminal"
    ]
  },
  {
    zoneId: 'labs',
    badge: 'ZONE 07 • SECURITY LABS',
    title: 'CYBERSECURITY BASTION',
    subtitle: 'Security Testing & Tooling',
    position: [-26.5, 0.85, -15.5],
    rotationY: 0.75,
    items: [
      "Linux System Administration & Terminal Audit Station",
      "Network Penetration Testing: Nmap, Wireshark, Metasploit",
      "Web Security Testing: OWASP Top 10 & Burp Suite",
      "Defensive Architecture & Cryptography Tooling"
    ]
  },
  {
    zoneId: 'contact',
    badge: 'ZONE 08 • CONNECT',
    title: 'COMMUNICATIONS OUTPOST',
    subtitle: 'Contact Hub & Social Links',
    position: [-20.5, 0.36, 36.5],
    rotationY: 0.0,
    items: [
      "Direct Email: abdullafadhi28@gmail.com",
      "Verified GitHub (@faaadi28) & LinkedIn Profiles",
      "Curriculum Vitae & Technical Resume Access",
      "Physical Base: Vazhakkad, Malappuram, Kerala, India"
    ]
  },
  {
    zoneId: 'education',
    badge: 'ZONE 06 • ACADEMICS',
    title: 'THE KNOWLEDGE SUMMIT',
    subtitle: 'Degrees & Scientific Foundations',
    position: [31.5, 1.05, -4.5],
    rotationY: -0.45,
    items: [
      "MCA (Master of Computer Applications) — Current Degree",
      "B.Sc. (Hons) Physics Foundation — First Principles Rigor",
      "Higher Secondary Education in Science & Mathematics",
      "Celestial Armillary Sphere at the mountain summit"
    ]
  },
  {
    zoneId: 'skills',
    badge: 'ZONE 04 • EXPERTISE',
    title: 'THE INNOVATION MEADOW',
    subtitle: 'Technical Proficiencies Grove',
    position: [25.0, 0.45, 37.0],
    rotationY: 0.55,
    items: [
      "Languages & Frameworks: React, Next.js, Node.js, Python, TypeScript",
      "Security Tooling: Linux, Nmap, Wireshark, Metasploit",
      "Systems: Networking, Bash Scripting, Web Security",
      "UI/UX: Modern 3D Web & Human-Centered Design"
    ]
  }
];

interface ZoneSignboardsProps {
  onSelectZone: (zoneId: string) => void;
  activeZone: string;
}

export const ZoneSignboards = ({ onSelectZone, activeZone }: ZoneSignboardsProps) => {
  return (
    <group>
      {ZONE_SIGNBOARDS.map((data) => (
        <SingleZoneSignboard
          key={data.zoneId}
          data={data}
          isActive={activeZone === data.zoneId}
          onSelect={() => onSelectZone(data.zoneId)}
        />
      ))}
    </group>
  );
};

interface SingleSignboardProps {
  data: ZoneSignboardData;
  isActive: boolean;
  onSelect: () => void;
}

const SingleZoneSignboard = ({ data, isActive, onSelect }: SingleSignboardProps) => {
  return (
    <group
      position={data.position}
      rotation={[0, data.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Stone Foundation Footing Blocks */}
      <mesh position={[-0.75, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.16, 8]} />
        <meshStandardMaterial color="#444a46" roughness={0.9} />
      </mesh>
      <mesh position={[0.75, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.16, 8]} />
        <meshStandardMaterial color="#444a46" roughness={0.9} />
      </mesh>

      {/* Two Dark Timber Vertical Posts */}
      <mesh position={[-0.75, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 1.9, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.85} />
      </mesh>
      <mesh position={[0.75, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 1.9, 8]} />
        <meshStandardMaterial color="#2d221c" roughness={0.85} />
      </mesh>

      {/* Crossbeams Behind Board */}
      <mesh position={[0, 0.8, -0.04]} castShadow>
        <boxGeometry args={[1.7, 0.08, 0.06]} />
        <meshStandardMaterial color="#261c16" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, -0.04]} castShadow>
        <boxGeometry args={[1.7, 0.08, 0.06]} />
        <meshStandardMaterial color="#261c16" roughness={0.85} />
      </mesh>

      {/* Backing Wooden Board Plaque */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.68, 1.05, 0.07]} />
        <meshStandardMaterial color="#362921" roughness={0.78} />
      </mesh>

      {/* Traditional Protective Angled Rooflet */}
      <mesh position={[0, 1.76, 0]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.9, 0.06, 0.42]} />
        <meshStandardMaterial color="#1b2126" roughness={0.8} />
      </mesh>
      {/* Roof Ridge Cap */}
      <mesh position={[0, 1.82, -0.05]} castShadow>
        <boxGeometry args={[1.94, 0.06, 0.08]} />
        <meshStandardMaterial color="#14181c" roughness={0.85} />
      </mesh>

      {/* Small Lantern Lamp under Roof */}
      <pointLight position={[0, 1.62, 0.15]} color="#ffecd1" intensity={0.8} distance={2.5} />

      {/* Interactive 3D Informational Signboard Card (Outside the Zone) */}
      <Html position={[0, 1.15, 0.06]} center distanceFactor={15}>
        <div className={`zone-outdoor-board ${isActive ? 'active' : ''}`} onClick={onSelect}>
          <div className="board-header">
            <span className="board-badge">{data.badge}</span>
            <span className="board-status">OUTSIDE BOARD</span>
          </div>

          <h3 className="board-title">{data.title}</h3>
          <p className="board-subtitle">{data.subtitle}</p>

          <div className="board-content-list">
            <div className="board-section-label">WHAT IS HERE:</div>
            <ul>
              {data.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="board-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <span>Inspect & Enter Zone [E]</span>
            <span className="board-arrow">➔</span>
          </button>
        </div>
      </Html>
    </group>
  );
};
