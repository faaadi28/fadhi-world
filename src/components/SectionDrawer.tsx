import { useState } from 'react';
import {
  X, ExternalLink, Code2, Globe, Shield, Layers, Cpu, Terminal,
  Mail, Phone, MapPin, FileText, ChevronRight
} from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolioData';

interface SectionDrawerProps {
  activeZone: string;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onSelectZone?: (zoneId: string) => void;
}

export const SectionDrawer = ({ activeZone, onClose, onSelectProject, onSelectZone }: SectionDrawerProps) => {
  const currentZone = PORTFOLIO_DATA.gardenZones.find((z) => z.id === activeZone);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'web' | 'security' | 'concept' | 'blockchain'>('all');

  if (!currentZone) {
    return null;
  }

  const filteredProjects = PORTFOLIO_DATA.projects.filter(p => {
    if (selectedFilter === 'all') return true;
    return p.category === selectedFilter;
  });

  const getSkillIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code2 size={18} />;
      case 'Globe': return <Globe size={18} />;
      case 'Shield': return <Shield size={18} />;
      case 'Layers': return <Layers size={18} />;
      case 'Cpu': return <Cpu size={18} />;
      case 'Terminal': return <Terminal size={18} />;
      default: return <Code2 size={18} />;
    }
  };

  const handleDownloadResume = () => {
    // Generate clean downloadable summary
    const resumeText = `# Abdulla Fadhi K. — Professional Profile & Resume
Email: ${PORTFOLIO_DATA.personal.email} | Phone: ${PORTFOLIO_DATA.personal.phone}
Location: ${PORTFOLIO_DATA.personal.location}
LinkedIn: ${PORTFOLIO_DATA.personal.linkedin}
GitHub: ${PORTFOLIO_DATA.personal.github}

${PORTFOLIO_DATA.personal.narrative}

## Education
${PORTFOLIO_DATA.education.map(e => `- ${e.degree} | ${e.institution} (${e.period})${e.grade ? ' — ' + e.grade : ''}`).join('\n')}

## Experience
${PORTFOLIO_DATA.experience.map(exp => `- ${exp.role} at ${exp.organization} (${exp.period})\n  ${exp.highlights.join('\n  ')}`).join('\n\n')}

## Live Projects & Platforms
${PORTFOLIO_DATA.projects.map(p => `- ${p.title} (${p.status}) - ${p.technologies.join(', ')}\n  ${p.summary}\n  Role: ${p.roleContribution}`).join('\n\n')}

## Technical Domains
${PORTFOLIO_DATA.skills.map(s => `- ${s.title}: ${s.skills.map(sk => sk.name).join(', ')}`).join('\n')}
`;
    const blob = new Blob([resumeText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Abdulla_Fadhi_K_Resume.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="section-drawer" role="complementary" aria-label={currentZone.name}>
      <div className="drawer-header">
        <div className="drawer-titles">
          <span className="drawer-zone-tag">{currentZone.zoneTag}</span>
          <h2 className="drawer-title">{currentZone.name}</h2>
          <p className="drawer-sub">{currentZone.description}</p>
        </div>
        <button
          type="button"
          className="btn-icon drawer-close-btn"
          onClick={onClose}
          aria-label="Close section details"
          title="Return to contemplative 3D garden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="drawer-body">
        {/* ZONE 01: SANCTUARY / FIRST GATE */}
        {activeZone === 'sanctuary' && (
          <div className="drawer-section">
            <div className="sanctuary-welcome-card">
              <span className="sanctuary-badge">ZONE 01 • WELCOME HUB</span>
              <h3 className="card-headline">Welcome to FADHI'S WORLD</h3>
              <p className="narrative-text">
                {PORTFOLIO_DATA.personal.headline}
              </p>
              <p className="sanctuary-tagline-text">
                {PORTFOLIO_DATA.personal.tagline}
              </p>
            </div>

            <div className="about-grid">
              <div className="info-block">
                <span className="info-label">Creator</span>
                <span className="info-val">{PORTFOLIO_DATA.personal.name}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Base Location</span>
                <span className="info-val">{PORTFOLIO_DATA.personal.location}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Direct Email</span>
                <span className="info-val">{PORTFOLIO_DATA.personal.email}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Direct Phone</span>
                <span className="info-val">{PORTFOLIO_DATA.personal.phone}</span>
              </div>
            </div>

            <div className="sanctuary-zones-directory">
              <h4 className="directory-heading">Garden Landmarks & Zones</h4>
              <p className="directory-sub">Walk to any zone on foot or jump directly below:</p>
              <div className="directory-grid">
                {PORTFOLIO_DATA.gardenZones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className={`directory-zone-pill ${z.id === activeZone ? 'active' : ''}`}
                    onClick={() => onSelectZone?.(z.id)}
                  >
                    <span className="dir-tag">{z.zoneTag}</span>
                    <span className="dir-name">{z.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="resume-download-box">
              <button
                type="button"
                className="btn-primary resume-btn"
                onClick={handleDownloadResume}
              >
                <FileText size={18} />
                <span>Download Curriculum Vitae (.md)</span>
              </button>
            </div>
          </div>
        )}

        {/* ZONE 02: ABOUT (The Lakeside Pavilion) */}
        {activeZone === 'about' && (
          <div className="drawer-section">
            <div className="narrative-card">
              <h3 className="card-headline">First Principles: Physics, Systems, and Security</h3>
              <p className="narrative-text">
                {PORTFOLIO_DATA.personal.narrative}
              </p>
            </div>

            <div className="about-grid">
              <div className="info-block">
                <span className="info-label">Current Academic Standing</span>
                <span className="info-val">MCA Student at APJ Abdul Kalam Technological University</span>
              </div>
              <div className="info-block">
                <span className="info-label">Foundational Degree</span>
                <span className="info-val">B.Sc. (Hons) Physics, University of Delhi</span>
              </div>
              <div className="info-block">
                <span className="info-label">Primary Technical Focus</span>
                <span className="info-val">Full-Stack Web Engineering, Linux, Network Reconnaissance & Security</span>
              </div>
              <div className="info-block">
                <span className="info-label">Location</span>
                <span className="info-val">{PORTFOLIO_DATA.personal.location}</span>
              </div>
            </div>

            <div className="quote-block">
              <p className="quote-text">
                "Security is not a detached veneer added at the end; it is an inherent property of understanding systems down to their memory models, network packets, and logic boundaries."
              </p>
            </div>
          </div>
        )}

        {/* ZONE 2: PROJECTS (The Stone Path) */}
        {activeZone === 'projects' && (
          <div className="drawer-section">
            {/* Filter bar */}
            <div className="category-filter">
              {(['all', 'web', 'security', 'concept', 'blockchain'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn ${selectedFilter === cat ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="projects-grid">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="project-card"
                  onClick={() => onSelectProject(proj.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="project-card-header">
                    <span className="project-badge">{proj.tag}</span>
                    {proj.liveUrl && (
                      <span className="live-indicator">
                        <span className="live-dot"></span> Live Site
                      </span>
                    )}
                  </div>
                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-subtitle">{proj.subtitle}</p>
                  <p className="project-summary">{proj.summary}</p>
                  
                  <div className="tech-pills">
                    {proj.technologies.slice(0, 4).map((tech, i) => (
                      <span key={i} className="tech-pill">{tech}</span>
                    ))}
                    {proj.technologies.length > 4 && (
                      <span className="tech-pill more">+{proj.technologies.length - 4}</span>
                    )}
                  </div>

                  <div className="project-action-link">
                    <span>Inspect Architecture & Details</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZONE 3: SKILLS (The Garden Map) */}
        {activeZone === 'skills' && (
          <div className="drawer-section">
            <p className="section-intro">
              Structured map of technical competencies grounded in practical application, academic rigor, and isolated lab environments. Represented without artificial percentage meters.
            </p>
            <div className="skills-matrix">
              {PORTFOLIO_DATA.skills.map((category, idx) => (
                <div key={idx} className="skill-cat-card">
                  <div className="cat-header">
                    <div className="cat-icon-box">{getSkillIcon(category.iconName)}</div>
                    <div>
                      <h3 className="cat-title">{category.title}</h3>
                      <p className="cat-desc">{category.description}</p>
                    </div>
                  </div>
                  <div className="cat-skill-list">
                    {category.skills.map((sk, sIdx) => (
                      <div key={sIdx} className="skill-item">
                        <span className="skill-item-name">{sk.name}</span>
                        <span className="skill-item-ctx">{sk.context}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZONE 4: EXPERIENCE (The Moon Bridge) */}
        {activeZone === 'experience' && (
          <div className="drawer-section">
            <div className="timeline-container">
              {PORTFOLIO_DATA.experience.map((exp, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-card">
                    <div className="timeline-period">{exp.period}</div>
                    <h3 className="timeline-role">{exp.role}</h3>
                    <h4 className="timeline-org">{exp.organization} — {exp.location}</h4>
                    <ul className="timeline-highlights">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                    <div className="accurate-scope-tag">
                      <span className="scope-label">Verified Scope:</span> {exp.accurateScope}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZONE 5: EDUCATION (The Quiet Clearing) */}
        {activeZone === 'education' && (
          <div className="drawer-section">
            <div className="education-grid">
              {PORTFOLIO_DATA.education.map((edu, idx) => (
                <div key={idx} className="edu-card">
                  <div className="edu-badge">{edu.period}</div>
                  <h3 className="edu-degree">{edu.degree}</h3>
                  <h4 className="edu-inst">{edu.institution}</h4>
                  {edu.grade && <div className="edu-grade">Distinction / Score: <strong>{edu.grade}</strong></div>}
                  <p className="edu-focus">{edu.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZONE 6: CYBERSECURITY LABS (The Hidden Garden) */}
        {activeZone === 'labs' && (
          <div className="drawer-section">
            <div className="labs-intro-card">
              <Shield className="labs-icon" size={24} />
              <div>
                <h3 className="labs-intro-title">Isolated Practical Security Research</h3>
                <p className="labs-intro-text">
                  Rigorous hands-on practice conducted strictly within isolated VMware host-only subnets and verified TryHackMe challenge rooms. No simulated production attacks; everything is documented systematically.
                </p>
              </div>
            </div>

            <div className="labs-list">
              {PORTFOLIO_DATA.securityLabs.map((lab) => (
                <div key={lab.id} className="lab-card">
                  <div className="lab-header">
                    <span className="lab-badge">Isolated Environment</span>
                    <h3 className="lab-title">{lab.title}</h3>
                    <div className="lab-env">Topology: <code>{lab.environment}</code></div>
                  </div>

                  <div className="lab-body">
                    <div className="lab-tools">
                      <span className="tools-title">Tools Deployed:</span>
                      <div className="tools-tags">
                        {lab.toolsUsed.map((tool, tIdx) => (
                          <span key={tIdx} className="tool-tag">{tool}</span>
                        ))}
                      </div>
                    </div>

                    <div className="lab-methodology">
                      <span className="meth-title">Execution Methodology:</span>
                      <ol className="meth-list">
                        {lab.methodology.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {lab.commandSnippet && (
                      <div className="terminal-snippet">
                        <div className="terminal-header">
                          <span className="term-dot red"></span>
                          <span className="term-dot yellow"></span>
                          <span className="term-dot green"></span>
                          <span className="term-title">kali-linux@terminal:~$</span>
                        </div>
                        <pre className="term-code"><code>{lab.commandSnippet}</code></pre>
                      </div>
                    )}

                    <div className="lab-outcome">
                      <span className="outcome-label">Key Analytical Finding:</span>
                      <p className="outcome-text">{lab.learningOutcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZONE 7: CONTACT (The Garden Gate) */}
        {activeZone === 'contact' && (
          <div className="drawer-section">
            <div className="contact-card">
              <h3 className="contact-headline">Reach Out Directly</h3>
              <p className="contact-intro">
                I welcome conversations about cybersecurity initiatives, full-stack web engineering, or academic collaboration.
              </p>

              <div className="contact-methods">
                <a href={`mailto:${PORTFOLIO_DATA.personal.email}`} className="contact-item" target="_blank" rel="noreferrer">
                  <div className="contact-icon-box"><Mail size={20} /></div>
                  <div className="contact-info">
                    <span className="contact-label">Email</span>
                    <span className="contact-val">{PORTFOLIO_DATA.personal.email}</span>
                  </div>
                </a>

                <a href={`tel:${PORTFOLIO_DATA.personal.phone.replace(/\s+/g, '')}`} className="contact-item">
                  <div className="contact-icon-box"><Phone size={20} /></div>
                  <div className="contact-info">
                    <span className="contact-label">Phone</span>
                    <span className="contact-val">{PORTFOLIO_DATA.personal.phone}</span>
                  </div>
                </a>

                <a href={PORTFOLIO_DATA.personal.linkedin} className="contact-item" target="_blank" rel="noreferrer">
                  <div className="contact-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">LinkedIn</span>
                    <span className="contact-val">linkedin.com/in/abdulla-fadhi-k</span>
                  </div>
                  <ExternalLink size={16} className="contact-ext" />
                </a>

                <a href={PORTFOLIO_DATA.personal.github} className="contact-item" target="_blank" rel="noreferrer">
                  <div className="contact-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">GitHub</span>
                    <span className="contact-val">github.com/faaadi28</span>
                  </div>
                  <ExternalLink size={16} className="contact-ext" />
                </a>

                <div className="contact-item location-item">
                  <div className="contact-icon-box"><MapPin size={20} /></div>
                  <div className="contact-info">
                    <span className="contact-label">Location</span>
                    <span className="contact-val">{PORTFOLIO_DATA.personal.location}</span>
                  </div>
                </div>
              </div>

              <div className="resume-download-box">
                <button
                  type="button"
                  className="btn-primary resume-btn"
                  onClick={handleDownloadResume}
                >
                  <FileText size={18} />
                  <span>Download Curriculum Vitae (.md)</span>
                </button>
                <span className="resume-note">Verified plain-text & markdown export of resume credentials</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
