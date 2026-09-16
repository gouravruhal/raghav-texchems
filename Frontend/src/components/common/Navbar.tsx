import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FlaskConical,
  ChevronDown,
  Menu,
  X,
  Phone,
  Droplets,
  Layers,
  FileText,
  Sparkles,
  Activity,
  ChevronRight,
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contrastMode, setContrastMode] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'md' | 'lg'>('md');

  const { products, categories, companySettings } = useData();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Accessibility Font Zoom handler
  const handleFontSizeChange = (size: 'sm' | 'md' | 'lg') => {
    setFontSizeLevel(size);
    document.documentElement.classList.remove('text-zoom-sm', 'text-zoom-lg');
    if (size === 'sm') document.documentElement.classList.add('text-zoom-sm');
    if (size === 'lg') document.documentElement.classList.add('text-zoom-lg');
  };

  // High contrast mode toggle
  const toggleContrast = () => {
    setContrastMode(!contrastMode);
    document.documentElement.classList.toggle('high-contrast-mode');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Icon selector for chemical division categories
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('dye') || lower.includes('color')) return <Droplets size={15} />;
    if (lower.includes('polymer') || lower.includes('emulsion')) return <Layers size={15} />;
    if (lower.includes('paper') || lower.includes('coating')) return <FileText size={15} />;
    if (lower.includes('textile') || lower.includes('auxiliary')) return <Sparkles size={15} />;
    return <Activity size={15} />;
  };

  const activeProducts = products.filter((p) => p.active !== false);

  return (
    <header className={`institutional-header-wrap ${scrolled ? 'is-scrolled' : ''}`}>
      {/* 1. TOP STATUTORY & ACCESSIBILITY UTILITY STRIP (Karmayogi standard) */}
      <div className="gov-utility-strip" role="complementary" aria-label="Statutory Information and Accessibility Toolbar">
        <div className="gov-utility-container">
          {/* Left: Enterprise Accreditation Tag */}
          <div className="gov-utility-left">
            <span className="gov-flag-emblem" aria-hidden="true">🇮🇳</span>
            <span className="gov-entity-tag">
              Raghav Texchems Chemical Pvt. Ltd. | An ISO 9001:2015 Certified Entity | CIN: {companySettings.cinNumber || 'U24100HR2020PTC086742'}
            </span>
          </div>

          {/* Right: Accessibility Controls & Directorate Direct Helpline */}
          <div className="gov-utility-right">
            {/* Direct Helpline */}
            <a
              href={`tel:+91${companySettings.contact1Phone}`}
              className="utility-helpline-link"
              title="Call Technical Sales Directorate"
            >
              <Phone size={11} />
              <span>Direct Desk: +91 {companySettings.contact1Phone}</span>
            </a>

            <span className="utility-divider" aria-hidden="true">|</span>

            {/* Font Size Accessibility Toggles */}
            <div className="accessibility-font-group" role="group" aria-label="Text Size Options">
              <button
                type="button"
                className={`font-size-btn ${fontSizeLevel === 'sm' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('sm')}
                title="Decrease font size"
                aria-label="Decrease text size (A-)"
              >
                A-
              </button>
              <button
                type="button"
                className={`font-size-btn ${fontSizeLevel === 'md' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('md')}
                title="Default font size"
                aria-label="Default text size (A)"
              >
                A
              </button>
              <button
                type="button"
                className={`font-size-btn ${fontSizeLevel === 'lg' ? 'active' : ''}`}
                onClick={() => handleFontSizeChange('lg')}
                title="Increase font size"
                aria-label="Increase text size (A+)"
              >
                A+
              </button>
            </div>

            <span className="utility-divider" aria-hidden="true">|</span>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              className="contrast-toggle-btn"
              onClick={toggleContrast}
              title={contrastMode ? 'Switch to Standard Theme' : 'Switch to High Contrast Theme'}
              aria-label={contrastMode ? 'Standard Theme' : 'High Contrast Theme'}
            >
              {contrastMode ? <Sun size={12} /> : <Moon size={12} />}
              <span className="contrast-label">{contrastMode ? 'Standard' : 'Contrast'}</span>
            </button>

            <span className="utility-divider" aria-hidden="true">|</span>

            {/* Language Tag */}
            <span className="utility-lang-tag" title="Language selection">
              English / <strong>हिन्दी</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL IDENTITY DESK (Crisp White Institutional Branding) */}
      <div className="identity-desk">
        <div className="identity-container">
          <Link to="/" className="identity-brand-link" id="brand-identity-home-link" onClick={() => setIsMobileMenuOpen(false)}>
            {companySettings.logoUrl ? (
              <img
                src={companySettings.logoUrl}
                alt={companySettings.companyName}
                className="identity-custom-logo"
              />
            ) : (
              <div className="identity-crest-wrap">
                <div className="identity-emblem-badge">
                  <FlaskConical size={26} className="identity-crest-icon" />
                  <span className="crest-seal-mark">RTC</span>
                </div>
              </div>
            )}

            <div className="identity-titles">
              <span className="identity-hindi-text">
                {companySettings.hindiName || 'राघव टेक्सकेम्स केमिकल प्राइवेट लिमिटेड'}
              </span>
              <h1 className="identity-english-name">
                {companySettings.companyName.toUpperCase()}
              </h1>
              <span className="identity-tagline">
                {companySettings.tagline} • Est. Industrial Zone, Panipat / Delhi NCR
              </span>
            </div>
          </Link>

          {/* Right Institutional Action Triggers */}
          <div className="identity-desk-actions">
            <Link to="/contact" className="btn-identity-rfq">
              <FileSpreadsheet size={15} />
              <span>e-RFQ & Quotation Desk</span>
            </Link>

            <Link to="/login" className="btn-identity-portal" title="Directorate / Admin Login">
              <Lock size={13} />
              <span>Admin Portal</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="gov-mobile-hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle official navigation menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY INSTITUTIONAL NAVIGATION BAR (Deep Navy Sovereign Bar) */}
      <nav className="institutional-nav-bar" aria-label="Main Directorate Navigation">
        <div className="institutional-nav-container">
          <ul className="gov-nav-menu">
            <li>
              <Link to="/" className={`gov-nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>

            <li>
              <Link to="/about" className={`gov-nav-link ${isActive('/about') ? 'active' : ''}`}>
                Corporate Overview
              </Link>
            </li>

            {/* Chemical Divisions Dropdown */}
            <li
              className="gov-nav-dropdown-item"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link
                to="/products"
                className={`gov-nav-link dropdown-link ${isActive('/products') ? 'active' : ''}`}
                aria-expanded={isDropdownOpen}
              >
                <span>Chemical Divisions & Catalog</span>
                <ChevronDown size={14} className={`gov-chevron ${isDropdownOpen ? 'rotated' : ''}`} />
              </Link>

              {isDropdownOpen && (
                <div className="gov-dropdown-desk animate-fade-in">
                  <div className="gov-dropdown-head">
                    <div className="dropdown-head-title">
                      <ShieldCheck size={14} />
                      <span>Approved Chemical Divisions</span>
                    </div>
                    <span className="dropdown-head-badge">{activeProducts.length} Formulations Live</span>
                  </div>

                  <div className="gov-dropdown-grid">
                    {categories.map((cat) => {
                      const count = activeProducts.filter((p) => p.category === cat.name).length;
                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="gov-dropdown-card"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="gov-drop-icon">{getCategoryIcon(cat.name)}</div>
                          <div className="gov-drop-text">
                            <span className="gov-drop-name">{cat.name}</span>
                            <span className="gov-drop-meta">{count} formulations • {cat.code}</span>
                          </div>
                          <ChevronRight size={13} className="gov-drop-arrow" />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="gov-dropdown-footer">
                    <Link
                      to="/products"
                      className="gov-dropdown-all-btn"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span>Access Full Technical Catalog & TDS Dossiers</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </li>

            <li>
              <Link to="/quality" className={`gov-nav-link ${isActive('/quality') ? 'active' : ''}`}>
                Quality & Lab Standards
              </Link>
            </li>

            <li>
              <Link to="/contact" className={`gov-nav-link ${isActive('/contact') ? 'active' : ''}`}>
                Procurement & Inquiries
              </Link>
            </li>
          </ul>

          {/* Quick Contact Badge on far right of Navy Bar */}
          <div className="nav-contact-pill">
            <span className="pill-dot" />
            <span>Industrial Dispatch Operational</span>
          </div>
        </div>
      </nav>

      {/* 4. RESPONSIVE MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="gov-mobile-drawer animate-slide-down">
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-title">Navigation Directory / मेनू</span>
          </div>

          <div className="mobile-drawer-links">
            <Link to="/" className={`mobile-gov-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>

            <Link to="/about" className={`mobile-gov-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              Corporate Overview & Directorate
            </Link>

            <Link to="/products" className={`mobile-gov-link ${isActive('/products') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              Chemical Divisions & Catalog ({activeProducts.length})
            </Link>

            <div className="mobile-categories-cluster">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="mobile-category-pill"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {getCategoryIcon(cat.name)}
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>

            <Link to="/quality" className={`mobile-gov-link ${isActive('/quality') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              Quality & Lab Accreditations
            </Link>

            <Link to="/contact" className={`mobile-gov-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              e-RFQ & Directorate Desk
            </Link>

            <Link to="/login" className="mobile-gov-link admin-highlight" onClick={() => setIsMobileMenuOpen(false)}>
              <Lock size={14} />
              <span>Admin / Directorate Portal</span>
            </Link>
          </div>

          <div className="mobile-drawer-footer">
            <div className="mobile-contact-block">
              <span className="mobile-contact-label">Direct Technical Sales Desk:</span>
              <a href={`tel:+91${companySettings.contact1Phone}`} className="mobile-contact-val">
                +91 {companySettings.contact1Phone} (Mr. Ravinder Kaushik)
              </a>
              <a href={`tel:+91${companySettings.contact2Phone}`} className="mobile-contact-val">
                +91 {companySettings.contact2Phone} (Mr. Sandeep)
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
