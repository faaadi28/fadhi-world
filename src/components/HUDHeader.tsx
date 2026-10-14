import { useState } from 'react';
import { Volume2, VolumeX, Sun, Sunset, Moon, Eye, Menu } from 'lucide-react';
import { zenAudio } from '../audio/zenAudio';

interface HUDHeaderProps {
  timeOfDay: 'day' | 'twilight' | 'night';
  onTimeChange: (time: 'day' | 'twilight' | 'night') => void;
  reducedMotion: boolean;
  onReducedMotionToggle: () => void;
  onOpenIndex: () => void;
  onResetToSanctuary: () => void;
}

export const HUDHeader = ({
  timeOfDay,
  onTimeChange,
  reducedMotion,
  onReducedMotionToggle,
  onOpenIndex,
  onResetToSanctuary
}: HUDHeaderProps) => {
  const [isAudioActive, setIsAudioActive] = useState(zenAudio.getIsPlaying());

  const handleToggleAudio = () => {
    const active = zenAudio.toggle();
    setIsAudioActive(active);
  };

  return (
    <header className="hud-header" role="banner">
      <div className="header-brand" onClick={onResetToSanctuary} role="button" tabIndex={0} title="Return to opening sanctuary">
        <div className="brand-crest">
          <span className="brand-crest-monogram">AF</span>
        </div>
        <div className="brand-text">
          <span className="brand-title">STILLWATER</span>
          <span className="brand-subtitle">Abdulla Fadhi K. — Portfolio</span>
        </div>
      </div>

      <div className="header-controls">
        {/* Day / Night Theme Toggle */}
        <div className="theme-toggle-group" role="group" aria-label="Day and Night Theme">
          <button
            type="button"
            className={`btn-theme-pill ${timeOfDay === 'day' ? 'active' : ''}`}
            onClick={() => onTimeChange('day')}
            title="Day Theme — Blue Sky & White Clouds"
            aria-label="Switch to Day Theme"
          >
            <Sun size={15} />
            <span className="theme-btn-label">Day</span>
          </button>
          <button
            type="button"
            className={`btn-theme-pill ${timeOfDay === 'night' ? 'active' : ''}`}
            onClick={() => onTimeChange('night')}
            title="Night Mode — Moonlit Stars & Lanterns"
            aria-label="Switch to Night Mode"
          >
            <Moon size={15} />
            <span className="theme-btn-label">Night</span>
          </button>
          <button
            type="button"
            className={`btn-icon-subtle ${timeOfDay === 'twilight' ? 'active' : ''}`}
            onClick={() => onTimeChange('twilight')}
            title="Twilight — Sunset Glow"
            aria-label="Switch to Twilight"
          >
            <Sunset size={15} />
          </button>
        </div>

        {/* Ambient Soundscape Toggle */}
        <button
          type="button"
          className={`btn-pill ${isAudioActive ? 'active' : ''}`}
          onClick={handleToggleAudio}
          title={isAudioActive ? 'Mute Zen soundscape' : 'Listen to ambient water & chimes'}
          aria-label={isAudioActive ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
        >
          {isAudioActive ? <Volume2 size={16} className="pulse-icon" /> : <VolumeX size={16} />}
          <span className="pill-text">{isAudioActive ? 'Zen Audio ON' : 'Audio Muted'}</span>
        </button>

        {/* Reduced Motion Toggle */}
        <button
          type="button"
          className={`btn-icon ${reducedMotion ? 'active' : ''}`}
          onClick={onReducedMotionToggle}
          title={reducedMotion ? 'Enable smooth 3D motion' : 'Reduce motion effects'}
          aria-label={reducedMotion ? 'Enable 3D motion' : 'Reduce motion'}
        >
          <Eye size={17} />
        </button>

        {/* Full Accessible Index Trigger */}
        <button
          type="button"
          className="btn-accent"
          onClick={onOpenIndex}
          title="Open conventional portfolio index"
          aria-label="Open portfolio menu"
        >
          <Menu size={16} />
          <span className="btn-label">Index</span>
        </button>
      </div>
    </header>
  );
};
