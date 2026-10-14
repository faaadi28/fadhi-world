import { X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface ProjectDetailModalProps {
  projectId: string | null;
  onClose: () => void;
}

export const ProjectDetailModal = ({ projectId, onClose }: ProjectDetailModalProps) => {
  if (!projectId) return null;

  const project = PORTFOLIO_DATA.projects.find((p) => p.id === projectId);
  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-badge-group">
            <span className="modal-badge">{project.tag}</span>
            <span className="modal-status">{project.status}</span>
          </div>
          <button
            type="button"
            className="btn-icon modal-close"
            onClick={onClose}
            aria-label="Close project modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <h2 id="modal-title" className="modal-title">{project.title}</h2>
          <p className="modal-subtitle">{project.subtitle}</p>

          <div className="modal-summary-box">
            <h3 className="section-label">Overview & Purpose</h3>
            <p className="summary-text">{project.summary}</p>
          </div>

          <div className="modal-contribution-box">
            <h3 className="section-label">Personal Contribution & Scope</h3>
            <p className="contribution-text">{project.roleContribution}</p>
          </div>

          <div className="modal-arch-box">
            <h3 className="section-label">Key Architectural Points</h3>
            <ul className="arch-list">
              {project.architectureDetails.map((detail, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={16} className="check-icon" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-tech-box">
            <h3 className="section-label">Technologies Deployed</h3>
            <div className="tech-pills">
              {project.technologies.map((t, idx) => (
                <span key={idx} className="tech-pill active">{t}</span>
              ))}
            </div>
          </div>

          {project.liveUrl && (
            <div className="modal-actions">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <span>Visit Live Platform</span>
                <ExternalLink size={16} />
              </a>
              <span className="live-url-note">{project.liveUrl}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
