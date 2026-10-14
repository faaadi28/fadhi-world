import { ArrowRight, Compass, Sparkles, MapPin, Mail, Shield, Code, GraduationCap } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface HeroOverlayProps {
  onExplore: () => void;
  onViewProjects: () => void;
  onJumpToContact: () => void;
}

export const HeroOverlay = ({ onExplore, onViewProjects, onJumpToContact }: HeroOverlayProps) => {
  return (
    <section className="hero-overlay" aria-label="Introduction">
      <div className="hero-content hero-gateway-content">
        {/* First Gate Badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          <span className="hero-badge-text">FIRST GATE • FADHI'S WORLD</span>
        </div>

        <h1 className="hero-name">FADHI'S WORLD</h1>
        
        <p className="hero-headline">
          "{PORTFOLIO_DATA.personal.headline}"
        </p>

        {/* Dedicated "About Me" Gateway Introduction Card */}
        <div className="gateway-about-card">
          <div className="gateway-about-header">
            <span className="gateway-about-tag">ABOUT ME</span>
            <span className="gateway-about-name">{PORTFOLIO_DATA.personal.name}</span>
          </div>

          <p className="gateway-about-text">
            I am an <strong>MCA student</strong> and <strong>B.Sc. (Hons) Physics</strong> graduate actively transitioning into <strong>cybersecurity</strong> and web development. Grounded in first-principles inquiry, I explore how complex software systems operate, where security failure modes emerge, and how to engineer resilient digital platforms.
          </p>

          <div className="gateway-pill-row">
            <span className="gateway-pill"><GraduationCap size={13} /> MCA Student</span>
            <span className="gateway-pill"><Code size={13} /> Web Developer</span>
            <span className="gateway-pill"><Shield size={13} /> Cybersecurity</span>
          </div>

          <div className="gateway-meta-row">
            <div className="hero-location">
              <MapPin size={13} className="location-icon" />
              <span>{PORTFOLIO_DATA.personal.location}</span>
            </div>
            <div className="hero-location">
              <Mail size={13} className="location-icon" />
              <span>{PORTFOLIO_DATA.personal.email}</span>
            </div>
          </div>
        </div>

        {/* Action Navigation */}
        <div className="hero-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={onExplore}
            id="hero-explore-btn"
          >
            <span>Proceed to About Me (Lakeside Pavilion)</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onViewProjects}
            id="hero-projects-btn"
          >
            <Compass size={17} />
            <span>View Projects</span>
          </button>

          <button
            type="button"
            className="btn-pill"
            onClick={onJumpToContact}
            id="hero-contact-btn"
          >
            <span>Contact & Links</span>
          </button>
        </div>

        <div className="hero-hint">
          <Sparkles size={13} className="hint-icon" />
          <span>Walk through the gate with [W A S D] • Ride the scenic aerial cable car • Inspect zone signboards</span>
        </div>
      </div>
    </section>
  );
};
