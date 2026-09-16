import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Globe,
  ShieldCheck,
  Award,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Handshake,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/products/ProductCard';
import { TechSpecModal } from '../components/products/TechSpecModal';
import type { Product } from '../types';

export const HomePage: React.FC = () => {
  const { companySettings, stats, collaborations, products } = useData();
  const [selectedTechSpecProduct, setSelectedTechSpecProduct] = useState<Product | null>(null);

  // Active collaborations configured in backend by Admin
  const activeCollaborations = collaborations.filter((c) => c.active);

  // Randomly pick up to 3 active products to showcase on the home page
  const activeProducts = products.filter((product) => product.active !== false);
  const randomThreeProducts = useMemo(() => {
    if (activeProducts.length === 0) return [];
    if (activeProducts.length <= 3) return activeProducts;
    // Stable randomized selection
    const shuffled = [...activeProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [activeProducts]);

  const renderStatIcon = (type: string) => {
    switch (type) {
      case 'flask':
        return <FlaskConical size={24} />;
      case 'globe':
        return <Globe size={24} />;
      case 'shield':
        return <ShieldCheck size={24} />;
      case 'award':
        return <Award size={24} />;
      case 'users':
        return <Users size={24} />;
      case 'trending':
        return <TrendingUp size={24} />;
      default:
        return <Sparkles size={24} />;
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* 1. HERO SECTION (Clean, single "Watch Our Story" button navigating directly to /about) */}
      <section className="hero-section">
        <video className="video-bg" autoPlay muted loop playsInline>
          <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />

        <div className="hero-content-wrapper">
          <div className="hero-content-container">
            <div className="hero-chip">
              <span className="chip-dot" />
              INNOVATING SPECIALTY CHEMICAL SOLUTIONS
            </div>

            <h1 className="hero-title">
              {companySettings.heroHeadline || (
                <>
                  Advancing science.{'\n'}
                  <span className="text-highlight">Transforming</span> chemical connectivity.
                </>
              )}
            </h1>

            <p className="hero-description">
              {companySettings.heroDescription || (
                <>
                  {companySettings.companyName} is at the forefront of chemical manufacturing—developing high-performance Dyestuffs, Polymer Emulsions, Textile Auxiliaries, and Paper Coating innovations under our ethos: <em>"{companySettings.tagline}"</em>.
                </>
              )}
            </p>

            {/* Single Action Button: Directly Navigates to About / Story Page */}
            <div className="hero-actions">
              <Link
                to="/about"
                className="btn btn-hero-story"
                id="hero-watch-story-btn"
              >
                <span>Watch Our Story</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME PUZZLE-FORMAT STATS SECTION (Dynamic & Admin-Operated) */}
      {stats && stats.length > 0 && (
        <section className="section-padding puzzle-stats-section">
          <div className="section-container">
            <div className="section-header text-center" style={{ marginBottom: '2.5rem' }}>
              <div className="section-badge">VERIFIED BENCHMARKS</div>
              <h2 className="section-title">Engineered For Industrial Performance</h2>
              <p className="section-subtitle">
                Real-time operational metrics across our manufacturing plants, testing laboratories, and global distribution hubs.
              </p>
            </div>

            {/* Puzzle Bento Layout */}
            <div className="puzzle-stats-grid">
              {stats.map((item, index) => (
                <div
                  className={`puzzle-card puzzle-card-${(index % 4) + 1}`}
                  key={item.id}
                >
                  <div className="puzzle-card-glow" />
                  <div className="puzzle-card-header">
                    <div className="puzzle-icon-bubble">{renderStatIcon(item.iconType)}</div>
                  </div>

                  <div className="puzzle-card-body">
                    <div className="puzzle-stat-value">{item.value}</div>
                    <div className="puzzle-stat-label">{item.label}</div>
                    {item.description && (
                      <p className="puzzle-stat-desc">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. DYNAMIC PRODUCTS / SERVICES SHOWCASE (Only shown if products exist in backend) */}
      {activeProducts.length > 0 && (
        <section className="section-padding products-showcase-section">
          <div className="section-container">
            <div className="section-header text-center">
              <div className="section-badge">SPECIALTY FORMULATIONS</div>
              <h2 className="section-title">Products & Chemical Solutions</h2>
              <p className="section-subtitle">
                High-yield dyestuffs, polymer emulsions, and sizing chemicals formulated for optimum efficiency and reliability.
              </p>
            </div>

            {/* 3 Randomly Selected Products */}
            <div className="products-grid">
              {randomThreeProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectTechSpecs={(p) => setSelectedTechSpecProduct(p)}
                />
              ))}
            </div>

            {/* Show More Products Button Navigating to Products Page */}
            <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
              <Link to="/products" className="btn btn-primary btn-lg" id="home-show-more-products-btn">
                <span>Show More Products ({activeProducts.length} Total)</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. STRATEGIC COMPANIES & TIE-UPS SECTION (Unified, Animated Pop-out, Admin-Operated, Optional Website Link) */}
      {activeCollaborations.length > 0 && (
        <section className="section-padding companies-tieups-section">
          <div className="section-container">
            <div className="section-header text-center">
              <div className="section-badge">
                <Handshake size={14} style={{ display: 'inline-block', marginRight: '6px' }} />
                STRATEGIC TIE-UPS & ALLIANCES
              </div>
              <h2 className="section-title">Trusted By Leading Manufacturing Hubs</h2>
              <p className="section-subtitle">
                Collaborating with top industrial corporations, export mills, and technical laboratories across international and domestic markets.
              </p>
            </div>

            {/* Pop-out Interactive Companies Grid */}
            <div className="companies-tieups-grid">
              {activeCollaborations.map((collab) => {
                const hasLink = Boolean(collab.websiteUrl && collab.websiteUrl.trim().length > 0);

                const cardContent = (
                  <div className={`company-pop-card ${hasLink ? 'has-link' : ''}`}>
                    <div className="company-card-top">
                      <span className="company-type-tag">{collab.type}</span>
                      {collab.badgeText && (
                        <span className="company-badge-pill">{collab.badgeText}</span>
                      )}
                    </div>

                    <div className="company-card-middle">
                      <div className="company-icon-avatar">
                        <Building2 size={24} />
                      </div>
                      <div className="company-info">
                        <h3 className="company-name">{collab.name}</h3>
                        <p className="company-location">{collab.location}</p>
                      </div>
                    </div>

                    <div className="company-card-bottom">
                      <span className="company-verified-label">
                        <CheckCircle2 size={14} /> Official Alliance
                      </span>
                      {hasLink ? (
                        <span className="company-link-hint">
                          Visit Site <ArrowUpRight size={14} />
                        </span>
                      ) : (
                        <span className="company-alliance-tag">
                          <Layers size={13} /> Integrated Supply
                        </span>
                      )}
                    </div>
                  </div>
                );

                if (hasLink) {
                  return (
                    <a
                      key={collab.id}
                      href={collab.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-card-link-wrapper"
                      title={`Visit ${collab.name} official website`}
                    >
                      {cardContent}
                    </a>
                  );
                }

                return (
                  <div key={collab.id} className="company-card-link-wrapper">
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TECHNICAL SPECIFICATION MODAL (For Product Quick View) */}
      <TechSpecModal
        product={selectedTechSpecProduct}
        onClose={() => setSelectedTechSpecProduct(null)}
      />
    </div>
  );
};
