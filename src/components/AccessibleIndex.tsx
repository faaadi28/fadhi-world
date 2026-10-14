import { X, ArrowRight, Compass, Shield, User, Briefcase, GraduationCap, Mail, Code2 } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface AccessibleIndexProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zoneId: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const AccessibleIndex = ({
  isOpen,
  onClose,
  onSelectZone,
  onSelectProject
}: AccessibleIndexProps) => {
  if (!isOpen) return null;

  const handleNavigate = (zoneId: string) => {
    onSelectZone(zoneId);
    onClose();
  };

  const handleOpenProject = (projectId: string) => {
    onSelectProject(projectId);
    onSelectZone('projects');
    onClose();
  };

  const getZoneIcon = (id: string) => {
    switch (id) {
      case 'sanctuary': return <Compass size={18} />;
      case 'about': return <User size={18} />;
      case 'projects': return <Code2 size={18} />;
      case 'skills': return <Code2 size={18} />;
      case 'experience': return <Briefcase size={18} />;
      case 'education': return <GraduationCap size={18} />;
      case 'labs': return <Shield size={18} />;
      case 'contact': return <Mail size={18} />;
      default: return <Compass size={18} />;
    }
  };

  return (
    <div className="index-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Portfolio Index">
      <div className="index-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="index-header">
          <div className="index-brand">
            <span className="index-monogram">AF</span>
            <div>
              <h2 className="index-title">Portfolio Directory</h2>
              <p className="index-sub">Accessible Navigation for STILLWATER</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon index-close"
            onClick={onClose}
            aria-label="Close index"
          >
            <X size={20} />
          </button>
        </div>

        <div className="index-body">
          {/* Garden Zones List */}
          <div className="index-section">
            <h3 className="index-section-title">World Landmarks & Sections</h3>
            <div className="index-zones-list">
              {PORTFOLIO_DATA.gardenZones.map((z, idx) => (
                <button
                  key={z.id}
                  type="button"
                  className="index-zone-btn"
                  onClick={() => handleNavigate(z.id)}
                >
                  <div className="zone-icon-box">{getZoneIcon(z.id)}</div>
                  <div className="zone-meta">
                    <span className="zone-tag">{z.zoneTag}</span>
                    <span className="zone-title">0{idx + 1}. {z.name}</span>
                    <span className="zone-desc">{z.description}</span>
                  </div>
                  <ArrowRight size={16} className="zone-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Projects Directory */}
          <div className="index-section">
            <h3 className="index-section-title">Direct Projects Index</h3>
            <div className="index-projects-list">
              {PORTFOLIO_DATA.projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="index-project-row"
                  onClick={() => handleOpenProject(p.id)}
                >
                  <div className="row-main">
                    <span className="row-tag">{p.tag}</span>
                    <h4 className="row-title">{p.title}</h4>
                    <span className="row-tech">{p.technologies.join(' • ')}</span>
                  </div>
                  <ArrowRight size={16} className="row-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Contact Coordinates */}
          <div className="index-section contact-preview">
            <h3 className="index-section-title">Direct Contact</h3>
            <p className="contact-text">
              {PORTFOLIO_DATA.personal.name} • {PORTFOLIO_DATA.personal.email} • {PORTFOLIO_DATA.personal.phone}
            </p>
            <div className="quick-links">
              <a href={PORTFOLIO_DATA.personal.linkedin} target="_blank" rel="noreferrer" className="quick-link">
                LinkedIn
              </a>
              <a href={PORTFOLIO_DATA.personal.github} target="_blank" rel="noreferrer" className="quick-link">
                GitHub
              </a>
              <button
                type="button"
                className="quick-link btn-jump-contact"
                onClick={() => handleNavigate('contact')}
              >
                Full Contact & Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
