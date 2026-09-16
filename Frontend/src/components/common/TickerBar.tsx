import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Pause, Play } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const TickerBar: React.FC = () => {
  const { announcements } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeAnnouncements = announcements.filter((a) => a.active);

  useEffect(() => {
    if (activeAnnouncements.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeAnnouncements.length, isPaused]);

  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentIndex] || activeAnnouncements[0];

  return (
    <div className="ticker-bar-wrapper" role="region" aria-label="Official Circulars and Notices">
      <div className="ticker-container">
        {/* Left Official Badge */}
        <div className="ticker-badge-pill">
          <span className="ticker-pulse-dot" />
          <Bell size={13} className="ticker-badge-icon" />
          <span className="ticker-badge-text">NOTICES & CIRCULARS / परिपत्र</span>
        </div>

        {/* Center Live Announcement Stream */}
        <div
          className="ticker-content-track"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div key={current.id} className="ticker-item animate-fade-in">
            <span className="ticker-tag">{current.badgeText || current.category.toUpperCase()}</span>
            <span className="ticker-title-text">{current.title}</span>
            {current.linkUrl && (
              <Link to={current.linkUrl} className="ticker-action-link">
                <span>View Details</span>
                <ChevronRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* Right Controls & Counter */}
        <div className="ticker-controls">
          <span className="ticker-counter">
            {currentIndex + 1} / {activeAnnouncements.length}
          </span>
          <button
            type="button"
            className="ticker-ctrl-btn"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Ticker' : 'Pause Ticker'}
            aria-label={isPaused ? 'Resume Ticker' : 'Pause Ticker'}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
};
