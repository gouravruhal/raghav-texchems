import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  FlaskConical,
  Globe,
  ShieldCheck,
  Award,
  Users,
  TrendingUp,
  Heart,
  Target,
  Play,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const { aboutContent, companySettings } = useData();

  // Extract YouTube embed ID from various URL formats
  const youtubeEmbedUrl = useMemo(() => {
    if (aboutContent.videoType !== 'youtube') return null;
    const url = aboutContent.videoUrl;
    let videoId = '';
    // Handle youtube.com/watch?v=ID
    const match1 = url.match(/[?&]v=([^&#]+)/);
    if (match1) videoId = match1[1];
    // Handle youtu.be/ID
    const match2 = url.match(/youtu\.be\/([^?&#]+)/);
    if (match2) videoId = match2[1];
    // Handle youtube.com/embed/ID
    const match3 = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (match3) videoId = match3[1];

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1`;
  }, [aboutContent.videoUrl, aboutContent.videoType]);

  const getValueIcon = (iconType: string, size: number = 24) => {
    switch (iconType) {
      case 'flask': return <FlaskConical size={size} />;
      case 'globe': return <Globe size={size} />;
      case 'shield': return <ShieldCheck size={size} />;
      case 'award': return <Award size={size} />;
      case 'users': return <Users size={size} />;
      case 'trending': return <TrendingUp size={size} />;
      case 'heart': return <Heart size={size} />;
      case 'target': return <Target size={size} />;
      default: return <Sparkles size={size} />;
    }
  };

  return (
    <div className="about-page">
      {/* ─── Video Hero Section ─── */}
      <section className="about-video-hero">
        <div className="about-video-wrapper">
          {aboutContent.videoType === 'youtube' && youtubeEmbedUrl ? (
            <iframe
              className="about-video-iframe"
              src={youtubeEmbedUrl}
              title="Company Story Video"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : aboutContent.videoType === 'direct' && aboutContent.videoUrl ? (
            <video
              className="about-video-direct"
              src={aboutContent.videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="about-video-placeholder">
              <Play size={64} />
              <p>Company video will appear here</p>
            </div>
          )}
          <div className="about-video-overlay" />
        </div>

        <div className="about-video-hero-content">
          <div className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)' }}>
            OUR STORY
          </div>
          <h1 className="about-hero-title">{aboutContent.storyTitle}</h1>
          <p className="about-hero-subtitle">
            {companySettings.tagline && <em>"{companySettings.tagline}"</em>}
          </p>
        </div>
      </section>

      {/* ─── Company Story Section ─── */}
      <section className="about-story-section section-padding">
        <div className="about-story-container">
          <div className="about-story-label">
            <Sparkles size={16} />
            About {companySettings.companyName}
          </div>
          <div className="about-story-content">
            {aboutContent.storyParagraphs.map((para, idx) => (
              <p key={idx} className="about-story-paragraph">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission & Vision Cards ─── */}
      <section className="about-mv-section section-padding">
        <div className="about-mv-grid">
          <div className="about-mv-card mission">
            <div className="about-mv-icon-wrap">
              <Target size={28} />
            </div>
            <h3 className="about-mv-title">{aboutContent.missionTitle}</h3>
            <p className="about-mv-text">{aboutContent.missionText}</p>
          </div>
          <div className="about-mv-card vision">
            <div className="about-mv-icon-wrap">
              <Globe size={28} />
            </div>
            <h3 className="about-mv-title">{aboutContent.visionTitle}</h3>
            <p className="about-mv-text">{aboutContent.visionText}</p>
          </div>
        </div>
      </section>

      {/* ─── Milestones Timeline ─── */}
      {aboutContent.milestones.length > 0 && (
        <section className="about-milestones-section section-padding">
          <div className="section-header">
            <div className="section-badge">OUR JOURNEY</div>
            <h2 className="section-title">Key Milestones</h2>
            <p className="section-subtitle">
              A timeline of growth, innovation, and expanding chemical excellence across industries and borders.
            </p>
          </div>

          <div className="about-timeline">
            {aboutContent.milestones.map((ms, idx) => (
              <div key={ms.id} className={`about-timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}>
                <div className="about-timeline-dot">
                  <Calendar size={14} />
                </div>
                <div className="about-timeline-card">
                  <span className="about-timeline-year">{ms.year}</span>
                  <h4 className="about-timeline-title">{ms.title}</h4>
                  <p className="about-timeline-desc">{ms.description}</p>
                </div>
              </div>
            ))}
            <div className="about-timeline-line" />
          </div>
        </section>
      )}

      {/* ─── Core Values Grid ─── */}
      {aboutContent.coreValues.length > 0 && (
        <section className="about-values-section section-padding">
          <div className="section-header">
            <div className="section-badge">WHAT DRIVES US</div>
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">
              The principles that define our chemistry, our partnerships, and our commitment to excellence.
            </p>
          </div>

          <div className="about-values-grid">
            {aboutContent.coreValues.map((val, idx) => (
              <div
                key={val.id}
                className="about-value-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="about-value-icon">
                  {getValueIcon(val.iconType, 26)}
                </div>
                <h4 className="about-value-title">{val.title}</h4>
                <p className="about-value-desc">{val.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Bottom CTA ─── */}
      <section className="about-cta-section">
        <div className="about-cta-content">
          <h3 className="about-cta-title">Ready to partner with us?</h3>
          <p className="about-cta-subtitle">
            Explore our complete range of specialty chemical formulations or get in touch with our team.
          </p>
          <div className="about-cta-actions">
            <Link to="/products" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
