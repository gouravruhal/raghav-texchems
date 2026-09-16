import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Droplets,
  Layers,
  FileText,
  Sparkles,
  Package,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { products, companySettings } = useData();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 15);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Dynamic category extraction: only show categories that currently have products in the database
  const activeProducts = products.filter((product) => product.active !== false);
  const activeCategories = Array.from(
    new Set(activeProducts.map((p) => p.category).filter(Boolean))
  );

  const hasActiveProducts = activeProducts.length > 0 && activeCategories.length > 0;

  // Helper to map category names to distinct Lucide icons
  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('dye') || lower.includes('color')) return <Droplets size={16} />;
    if (lower.includes('polymer') || lower.includes('emulsion')) return <Layers size={16} />;
    if (lower.includes('paper') || lower.includes('coating')) return <FileText size={16} />;
    if (lower.includes('textile') || lower.includes('auxiliary')) return <Sparkles size={16} />;
    if (lower.includes('pack') || lower.includes('resin')) return <Package size={16} />;
    return <Activity size={16} />;
  };

  return (
    <header className={`navbar-header-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar" aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link to="/" className="logo-container" id="brand-logo-link" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="custom-brand-logo-wrap">
            <img
              src={companySettings.logoUrl || '/logo.png'}
              alt={companySettings.companyName || 'Raghav Texchems Chemical Pvt. Ltd.'}
              className="navbar-brand-img"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/logo.png')) {
                  target.src = '/logo.png';
                }
              }}
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
          </li>

          {/* Dynamic Products Menu: ONLY displayed when backend has active products */}
          {hasActiveProducts && (
            <li
              className="dropdown-wrapper"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link
                to="/products"
                className={`nav-link dropdown-trigger ${isActive('/products') ? 'active' : ''}`}
                aria-expanded={isDropdownOpen}
              >
                Products & Solutions <ChevronDown size={15} className={`chevron-icon ${isDropdownOpen ? 'rotated' : ''}`} />
              </Link>

              {isDropdownOpen && (
                <div className="dropdown-menu animate-fade-in">
                  <div className="dropdown-header-bar">
                    <span className="dropdown-header-title">Active Formulations</span>
                    <span className="dropdown-count-badge">{activeProducts.length} Products</span>
                  </div>

                  <div className="dropdown-list">
                    {activeCategories.map((cat) => {
                      const count = activeProducts.filter((p) => p.category === cat).length;
                      return (
                        <Link
                          key={cat}
                          to={`/products?category=${encodeURIComponent(cat)}`}
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="dropdown-icon">{getCategoryIcon(cat)}</div>
                          <div className="dropdown-item-content">
                            <div className="dropdown-item-name">{cat}</div>
                            <span className="dropdown-item-meta">{count} formulations</span>
                          </div>
                          <ChevronRight size={14} className="dropdown-arrow-hint" />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="dropdown-footer-bar">
                    <Link
                      to="/products"
                      className="dropdown-all-link"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View All Formulations & Technical Data Sheets <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </li>
          )}

          <li>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
              Our Story
            </Link>
          </li>

          <li>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-drawer animate-slide-down">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>

            {hasActiveProducts && (
              <div className="mobile-dropdown-group">
                <Link to="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <strong>Products & Solutions ({activeProducts.length})</strong>
                </Link>
                <div className="mobile-category-list">
                  {activeCategories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className="mobile-category-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {getCategoryIcon(cat)}
                      <span>{cat}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Our Story
            </Link>
            <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Contact Us
            </Link>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--divider)' }}>
              <Link
                to="/contact"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inquire Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
