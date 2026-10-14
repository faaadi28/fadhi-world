# STILLWATER — Real-Time 3D Zen Garden Portfolio
### Personal Portfolio for Abdulla Fadhi K.

An original, interactive, real-time 3D web experience inspired by Japanese Zen garden philosophy (*Seijaku* - tranquil stillness). Built to represent the multifaceted journey of **Abdulla Fadhi K.** — B.Sc. (Hons) Physics graduate, Web Developer, MCA student, and aspiring Cybersecurity professional.

---

## 🌟 Creative Direction & Narrative Architecture

Instead of a generic template or a stereotypical hacker dashboard, **STILLWATER** approaches technology from first principles:
- **Natural Depth & Composition**: Ground-level asymmetrical camera composition framing a living reflective pond, weathered granite stepping stones (*tobi-ishi*), an authentic wooden tea pavilion (*azumaya*), an arched vermilion moon bridge (*taiko-bashi*), a traditional stone lantern (*tōrō*), and an autumn red Japanese maple (*momiji*).
- **Interactive Shaders & Living Physics**:
  - **Dynamic Water Shader**: Custom GLSL vertex & fragment shaders with wave harmonics, caustic patterns, Fresnel transparency, and pointer-driven ripple propagation with procedural water sound synthesis.
  - **Living Kinematics**: Graceful Kohaku and Yamabuki koi fish swimming beneath the pond surface with undulating tail oscillation.
  - **Atmospheric Drift**: Instanced falling autumn leaves tumbling with wind turbulence, soft rolling ground mist, and glowing twilight fireflies.
  - **Atmosphere Modes**: Live toggle between **Day** (Morning Mist), **Twilight** (Sunset Glow with fireflies & lantern illumination), and **Night** (Moonlit reflections).
  - **Procedural Zen Audio**: Pure Web Audio API synthesized water stream murmur and pentatonic harmonic chimes (opt-in, muted by default, zero external audio asset dependencies).

---

## 🗺️ Environmental Landmarks & Resume Mapping

Visitors explore Abdulla Fadhi K.'s resume through 8 carefully choreographed garden landmarks:

| Landmark | Japanese | Portfolio Domain | Highlights |
| :--- | :--- | :--- | :--- |
| **01. The Sanctuary** | 静寂 (Seijaku) | Opening Composition | Asymmetrical vantage, primary headline, quick discovery triggers. |
| **02. The Pavilion** | 東屋 (Azumaya) | About Abdulla Fadhi K. | Transition from Physics (Univ. of Delhi) to Cybersecurity & Full-Stack. |
| **03. The Stone Path** | 飛石 (Tobi-ishi) | Interactive Projects | Live platforms: **Tagspot**, **Popular Junction**, **ConnectCampus**, **Cybersecurity Lab**. |
| **04. The Garden Map** | 庭絵 (Niwa-e) | Technical Matrix | Categorized competencies across Programming, Web Dev, UI/UX, Security, Blockchain & Tools. |
| **05. The Moon Bridge** | 太鼓橋 (Taiko-bashi) | Experience | Teaching Mathematics & Science (New Taj Public High School) & JHF IT Innovations. |
| **06. The Quiet Clearing** | 草庵 (Sōan) | Education | MCA (APJ Abdul Kalam Tech Univ), B.Sc. Physics (Univ. of Delhi), GHSS Vazhakkad. |
| **07. The Hidden Garden** | 奥庭 (Oku-niwa) | Cybersecurity Labs | Hands-on isolated network reconnaissance (Kali, VMware, Metasploitable, Nmap, TryHackMe). |
| **08. The Garden Gate** | 山門 (Sammon) | Contact & Coordinates | Verified email, phone, LinkedIn, GitHub, and one-click resume export. |

---

## 🛠️ Technology Stack

- **Core Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **3D Graphics Engine**: Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Soundscape**: Web Audio API Procedural Generator (`src/audio/zenAudio.ts`)
- **Icons**: Lucide Icons + Custom SVG Vectors
- **Design & Layout**: Pure modern Vanilla CSS with design tokens, glassmorphism, responsive grid & flexbox, and accessibility overrides.

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended, tested on Node v24)
- **npm** (v9.0.0 or higher)

### 2. Installation
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

### 5. Preview Production Build
```bash
npm run preview
```

---

## ♿ Accessibility & Navigation Features

1. **Dual Navigation**:
   - Environmental 3D journey driven by clicking landmarks, stepping stones, or using mouse-wheel / trackpad scroll.
   - Conventional **Index Drawer** accessible via the top-right `Index` button or keyboard shortcuts.
2. **Keyboard Accessibility**:
   - `ArrowRight` / `ArrowDown`: Move to next garden landmark.
   - `ArrowLeft` / `ArrowUp`: Move to previous garden landmark.
   - `Escape`: Close active modal or drawer, or return to opening Sanctuary.
3. **Reduced Motion**:
   - Automatically detects user OS `prefers-reduced-motion` settings.
   - Toggle button in top header to disable parallax easing and particle animations instantly.
4. **Honest Scope Disclosure**:
   - No fake percentages, simulated terminal hacks, or invented credentials. Every project and lab is documented with its verified scope and real links.

---

## 📄 License & Attribution

Designed and engineered for **Abdulla Fadhi K.** All project and educational references are verified.
