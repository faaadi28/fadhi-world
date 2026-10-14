export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'web' | 'concept' | 'security' | 'blockchain';
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  summary: string;
  roleContribution: string;
  architectureDetails: string[];
  status: 'Live Platform' | 'Platform Concept' | 'Active Research Lab' | 'Interactive Coursework';
  tag: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  location: string;
  period: string;
  highlights: string[];
  accurateScope: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  grade?: string;
  focus: string;
}

export interface SecurityLab {
  id: string;
  title: string;
  environment: string;
  toolsUsed: string[];
  methodology: string[];
  learningOutcome: string;
  commandSnippet?: string;
}

export interface SkillCategory {
  title: string;
  iconName: string;
  description: string;
  skills: { name: string; context: string }[];
}

export const PORTFOLIO_DATA = {
  personal: {
    name: "Abdulla Fadhi K.",
    headline: "Curiosity is where everything begins.",
    tagline: "Physics graduate. Web developer. MCA student exploring the intersection of technology, systems, and security.",
    location: "Vazhakkad, Malappuram, Kerala, India",
    email: "abdullafadhi28@gmail.com",
    phone: "+91 82817 05826",
    linkedin: "https://www.linkedin.com/in/abdulla-fadhi-k",
    github: "https://github.com/faaadi28",
    narrative: `I have a foundational background in physics and web development and am actively transitioning into cybersecurity. My approach is grounded in first principles: understanding how digital systems operate at a fundamental level, how complex applications are constructed, where their failure modes emerge, and how they can be systematically defended. Through rigorous practical labs in isolated environments, Linux system administration, and network analysis, I explore security as both an art of inspection and an engineering discipline.`
  },

  gardenZones: [
    { id: 'sanctuary', name: "FADHI'S WORLD", zoneTag: 'Zone 01 — First Gate', description: "Grand entrance gateway and introductory welcome to Abdulla Fadhi's digital universe" },
    { id: 'about', name: 'The Lakeside Pavilion', zoneTag: 'Zone 02 — About Me', description: 'Architectural sanctuary detailing my background, philosophy & journey' },
    { id: 'projects', name: 'The Project Archipelago', zoneTag: 'Zone 03 — Featured Works', description: 'Waterfront boardwalk showcasing live platforms & Web3 projects' },
    { id: 'skills', name: 'The Innovation Meadow', zoneTag: 'Zone 04 — Core Skills', description: 'Open meadow presenting computational, security, and UI/UX proficiencies' },
    { id: 'experience', name: 'The Grand Valley Bridge', zoneTag: 'Zone 05 — Experience', description: 'Arched canyon bridge marking professional teaching & research milestones' },
    { id: 'education', name: 'The Knowledge Summit', zoneTag: 'Zone 06 — Education', description: 'Hilltop observatory highlighting MCA, Physics (Hons), and schooling' },
    { id: 'labs', name: 'The Cybersecurity Bastion', zoneTag: 'Zone 07 — Security Labs', description: 'High-tech testing fortress for network enumeration, CTFs, and defense' },
    { id: 'contact', name: 'The Communications Outpost', zoneTag: 'Zone 08 — Connect', description: 'Direct contact hub, social verification, and resume download' },
  ],

  projects: [
    {
      id: 'tagspot',
      title: 'Tagspot',
      subtitle: 'Travel Discovery & Mapping Platform',
      category: 'web',
      technologies: ['Next.js', 'React', 'JavaScript', 'Tailwind CSS', 'Map APIs'],
      liveUrl: 'https://tagspot.in/',
      summary: 'A live platform engineered for travelers and wanderers to discover hidden spots, curate custom travel routes, and map experiential journeys.',
      roleContribution: 'Contributed to front-end application features and user-facing functionality within a collaborative development team, ensuring responsive layouts and seamless location discovery interactions.',
      architectureDetails: [
        'Component-driven UI built with Next.js and React',
        'Interactive location mapping with responsive card views',
        'Collaborative git workflow with feature branch reviews'
      ],
      status: 'Live Platform',
      tag: 'Production Platform'
    },
    {
      id: 'popular-junction',
      title: 'Popular Junction',
      subtitle: 'Business Networking & Directory Platform',
      category: 'web',
      technologies: ['React', 'JavaScript', 'CSS Modules', 'REST APIs'],
      liveUrl: 'https://popularjunction.com/',
      summary: 'A live business directory and networking ecosystem helping commercial enterprises establish a verified online identity and connect with targeted regional clients.',
      roleContribution: 'Contributed to the development and testing of customer-facing features, directory filtering workflows, and verified business listing interfaces.',
      architectureDetails: [
        'Directory search filtering with category-based routing',
        'Responsive customer inquiry interfaces',
        'Integration and testing against staging REST endpoints'
      ],
      status: 'Live Platform',
      tag: 'Production Platform'
    },
    {
      id: 'connect-campus',
      title: 'ConnectCampus',
      subtitle: 'Student, College & Enterprise Career Gateway',
      category: 'concept',
      technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Figma'],
      summary: 'A comprehensive academic and career platform concept designed to bridge students, higher educational institutions, and hiring enterprises through workshops, verified internships, and placement channels.',
      roleContribution: 'Conducted platform research, designed role-based access workflows (Student / Faculty / Recruiter), developed UI/UX wireframes in Figma, and contributed to system architecture discussions.',
      architectureDetails: [
        'Role-based access matrix separating student, mentor, and employer portals',
        'UI/UX design specs for opportunity discovery and authentication flows',
        'Normalized MongoDB data schema proposals for multi-tenant colleges'
      ],
      status: 'Platform Concept',
      tag: 'Architecture & UI/UX'
    },
    {
      id: 'cyber-lab',
      title: 'Cybersecurity Home Lab',
      subtitle: 'Isolated Network Defense & Enumeration Lab',
      category: 'security',
      technologies: ['Kali Linux', 'Metasploitable', 'VMware', 'Nmap', 'Wireshark', 'Burp Suite'],
      summary: 'A purpose-built, isolated virtualized laboratory designed to systematically practice host reconnaissance, service version enumeration, network packet inspection, and vulnerability verification.',
      roleContribution: 'Independently architected the virtual networking topology, configured target machines with intentionally vulnerable attack surfaces, and authored structured security assessment write-ups.',
      architectureDetails: [
        'Host-only virtual network isolating attack vectors from local subnet',
        'Systematic scanning methodologies: TCP SYN, UDP, and service version probes',
        'Documentation of misconfigurations, open attack surfaces, and defensive remediations'
      ],
      status: 'Active Research Lab',
      tag: 'Practical Security Lab'
    },
    {
      id: 'tryhackme',
      title: 'TryHackMe Practical Labs',
      subtitle: 'Hands-on Reconnaissance & Privilege Escalation Rooms',
      category: 'security',
      technologies: ['Linux CLI', 'Hydra', 'Gobuster', 'John the Ripper', 'Nmap'],
      summary: 'Hands-on offensive and defensive challenge rooms focusing on realistic penetration testing phases: reconnaissance, content discovery, and authentication testing.',
      roleContribution: 'Completed dedicated security exercises including the "Brute It" room, cataloging tool flags, attack methodologies, and remediation recommendations in private lab logs.',
      architectureDetails: [
        'Directory fuzzing and hidden endpoint reconnaissance with Gobuster',
        'Hash identification and offline password analysis testing',
        'SSH service brute-force verification and rate-limiting remediation notes'
      ],
      status: 'Active Research Lab',
      tag: 'CTF & Security Rooms'
    },
    {
      id: 'cryptozombies',
      title: 'CryptoZombies & Solidity Lab',
      subtitle: 'Interactive Smart Contract Engineering',
      category: 'blockchain',
      technologies: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts'],
      summary: 'Practical coursework diving into EVM architecture, deterministic state transitions, ERC721 non-fungible token logic, and smart contract security patterns.',
      roleContribution: 'Completed interactive lessons covering state variables, function visibility modifiers (view, pure, internal, external), mappings, and dApp interaction mechanics.',
      architectureDetails: [
        'Solidity state machines with strict access control modifiers',
        'Contract inheritance and interface-driven composition',
        'Gas optimization awareness and integer overflow protection practices'
      ],
      status: 'Interactive Coursework',
      tag: 'Web3 & Smart Contracts'
    }
  ] as Project[],

  skills: [
    {
      title: 'Programming & Foundations',
      iconName: 'Code',
      description: 'Algorithmic thinking, memory awareness, and strong computational foundations.',
      skills: [
        { name: 'C', context: 'Procedural logic, pointers, memory models' },
        { name: 'C++', context: 'Object-oriented programming, data structures' },
        { name: 'JavaScript (ES6+)', context: 'Asynchronous event loops, DOM, modern JS' },
        { name: 'Python', context: 'Scripting, automation, network analysis scripts' }
      ]
    },
    {
      title: 'Web Application Development',
      iconName: 'Globe',
      description: 'Building responsive, component-driven, production-ready interfaces and APIs.',
      skills: [
        { name: 'React', context: 'Hooks, state management, component lifecycles' },
        { name: 'HTML5 & CSS3', context: 'Semantic layout, responsive design, animations' },
        { name: 'Node.js & Express.js', context: 'RESTful API construction, middleware' },
        { name: 'MongoDB', context: 'Document modeling, aggregation, CRUD' },
        { name: 'REST APIs', context: 'Endpoint architecture, status codes, JSON handling' }
      ]
    },
    {
      title: 'Cybersecurity & Infrastructure',
      iconName: 'Shield',
      description: 'System inspection, network reconnaissance, and threat mitigation in isolated environments.',
      skills: [
        { name: 'Linux & Kali Linux', context: 'System administration, bash scripting, permissions' },
        { name: 'Nmap', context: 'Host discovery, port scanning, OS/service detection' },
        { name: 'Burp Suite', context: 'HTTP proxying, request inspection, parameter tampering' },
        { name: 'Metasploitable', context: 'Target vulnerability research in isolated labs' },
        { name: 'Networking (TCP/IP)', context: 'Subnetting, packet routing, DNS, OSI model' },
        { name: 'HTTP & HTTPS', context: 'Headers, cookies, TLS/SSL handshakes, auth flows' }
      ]
    },
    {
      title: 'UI/UX & Visual Design',
      iconName: 'Layers',
      description: 'Designing intuitive, purposeful, and aesthetically cohesive user experiences.',
      skills: [
        { name: 'User-Centered Design', context: 'Persona journeys, accessibility, cognitive load' },
        { name: 'Figma Wireframing', context: 'Low & high-fidelity prototyping, design tokens' },
        { name: 'Visual Layout Strategies', context: 'Typography hierarchy, grid systems, negative space' }
      ]
    },
    {
      title: 'Blockchain & Web3 Fundamentals',
      iconName: 'Cpu',
      description: 'Decentralized systems, smart contract syntax, and EVM mechanics.',
      skills: [
        { name: 'Solidity', context: 'Contract structure, state modifiers, events' },
        { name: 'Ethereum Fundamentals', context: 'Gas, transactions, blocks, EVM state' },
        { name: 'Web3.js & dApps', context: 'RPC node connection, wallet interaction flows' }
      ]
    },
    {
      title: 'Tools & Virtualization',
      iconName: 'Terminal',
      description: 'Version control, virtualization environments, and daily terminal operations.',
      skills: [
        { name: 'Git & GitHub', context: 'Branching strategies, pull requests, merge conflict resolution' },
        { name: 'VMware & VirtualBox', context: 'Virtual network adapter configuration, snapshot management' },
        { name: 'Linux CLI', context: 'Grep, sed, awk, curl, netstat, system monitoring' }
      ]
    }
  ] as SkillCategory[],

  experience: [
    {
      role: 'R&D and Group Discussion Contributor',
      organization: 'JHF IT Innovations Pvt. Ltd. — ConnectCampus',
      location: 'India',
      period: 'August 2026',
      highlights: [
        'Researched and conceptualized user workflows for students, colleges, and enterprise recruiters.',
        'Contributed to UI/UX and graphic design deliverables, including platform dashboards, opportunity discovery feeds, and secure authentication screens.',
        'Participated in system architecture group discussions regarding multi-tenant academic database modeling and project presentations.'
      ],
      accurateScope: 'Contributed as part of a collaborative research and UI/UX design group; not an independent founder or executive.'
    },
    {
      role: 'Mathematics and Science Teacher',
      organization: 'New Taj Public High School',
      location: 'Bathindi, Jammu, India',
      period: '2024 – 2025',
      highlights: [
        'Delivered structured pedagogy in high-school Mathematics and Physics/Chemistry to foster empirical problem-solving.',
        'Authored comprehensive lesson plans, integrated digital learning tools and interactive visual aids for complex topics.',
        'Mentored students individually on academic progression, study discipline, and conducted regular diagnostic assessments.'
      ],
      accurateScope: 'Full-time high-school teaching appointment mentoring senior secondary cohorts.'
    }
  ] as ExperienceItem[],

  education: [
    {
      degree: 'Master of Computer Applications (MCA)',
      institution: 'APJ Abdul Kalam Technological University, Kerala',
      period: '2026 – Present',
      focus: 'Advanced Computer Science, Distributed Systems, Software Engineering, and Information Security.'
    },
    {
      degree: 'B.Sc. (Hons) Physics',
      institution: 'University of Delhi, Delhi',
      period: '2021 – 2024',
      focus: 'Classical Mechanics, Electromagnetism, Quantum Mechanics, Computational Physics, and Mathematical Methods.'
    },
    {
      degree: 'Higher Secondary (Class XII)',
      institution: 'GHSS Vazhakkad, Kerala',
      period: '2019 – 2021',
      grade: '93%',
      focus: 'Science Stream (Physics, Chemistry, Mathematics, Biology).'
    },
    {
      degree: 'Secondary School (Class X)',
      institution: 'GHSS Vazhakkad, Kerala',
      period: '2018 – 2019',
      grade: '99%',
      focus: 'General Academics with honors distinction.'
    }
  ] as EducationItem[],

  securityLabs: [
    {
      id: 'homelab-recon',
      title: 'Isolated Network Reconnaissance & Port Enumeration',
      environment: 'VMware Workstation | Kali Linux 2024.x -> Target Metasploitable2 (Host-Only)',
      toolsUsed: ['Nmap', 'Netdiscover', 'Wireshark'],
      methodology: [
        'Configured host-only virtual subnet (192.168.56.0/24) to ensure absolute physical isolation.',
        'Executed ARP broadcast ping sweeps with netdiscover to map active hosts without triggering ICMP alerts.',
        'Conducted full-range TCP SYN scans (-sS -p- -T4) and targeted aggressive service detection (-sV -sC -O).'
      ],
      learningOutcome: 'Identified legacy service banners (e.g. vsftpd 2.3.4, bind9, Apache 2.2.8) and mapped attack surfaces while observing Wireshark packet capture behaviors for half-open scans.',
      commandSnippet: 'sudo nmap -sS -sV -sC -Pn -oN initial_recon.txt 192.168.56.101'
    },
    {
      id: 'thm-bruteit',
      title: 'Authentication Boundary & Privilege Testing (TryHackMe)',
      environment: 'TryHackMe Dedicated Security VPN Room: "Brute It"',
      toolsUsed: ['Gobuster', 'Hydra', 'John the Ripper', 'Linux CLI'],
      methodology: [
        'Conducted web directory enumeration to locate hidden administrative login endpoints.',
        'Inspected HTML source and network response payloads for client-side validation logic.',
        'Constructed targeted dictionary attacks against HTTP POST form authentication utilizing custom wordlists.',
        'Demonstrated defensive remediation through rate limiting, account lockout policies, and SSH key enforcement.'
      ],
      learningOutcome: 'Deepened hands-on understanding of credential stuffing, session persistence, and defensive hardening configurations.',
      commandSnippet: 'gobuster dir -u http://TARGET_IP/ -w /usr/share/wordlists/dirb/common.txt -t 30'
    },
    {
      id: 'web-inspection',
      title: 'Web Application Protocol & Parameter Tampering',
      environment: 'Local OWASP Juice Shop / Isolated Lab Instances',
      toolsUsed: ['Burp Suite Community', 'Firefox Developer Edition', 'cURL'],
      methodology: [
        'Configured browser traffic through local loopback proxy (127.0.0.1:8080).',
        'Intercepted and analyzed raw HTTP requests/responses, inspecting session tokens and cookie flags (HttpOnly, Secure, SameSite).',
        'Tested server response behaviors against modified query parameters and crafted payload headers.'
      ],
      learningOutcome: 'Gained practical insight into how client-side assumptions can diverge from server-side verification, reinforcing why defense-in-depth is essential in full-stack engineering.',
      commandSnippet: 'curl -i -X POST -H "Content-Type: application/json" -d \'{"debug":true}\' http://target/api'
    }
  ] as SecurityLab[]
};
