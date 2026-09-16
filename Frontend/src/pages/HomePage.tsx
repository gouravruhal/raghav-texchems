import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Globe,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Droplets,
  Layers,
  FileText,
  Phone,
  Send,
  Building2,
  ExternalLink,
  Clock,
  MapPin,
  Mail
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/products/ProductCard';
import { TechSpecModal } from '../components/products/TechSpecModal';
import type { Product } from '../types';

export const HomePage: React.FC = () => {
  const { companySettings, stats, categories, products, certifications, addInquiry } = useData();
  const [selectedTechSpecProduct, setSelectedTechSpecProduct] = useState<Product | null>(null);

  // RFQ Form state
  const [rfqName, setRfqName] = useState('');
  const [rfqCompany, setRfqCompany] = useState('');
  const [rfqPhone, setRfqPhone] = useState('');
  const [rfqEmail, setRfqEmail] = useState('');
  const [rfqCategory, setRfqCategory] = useState(categories[0]?.name || 'Textile Auxiliaries & Pre-treatment');
  const [rfqVolume, setRfqVolume] = useState('');
  const [rfqCity, setRfqCity] = useState('');
  const [rfqMessage, setRfqMessage] = useState('');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);

  const activeProducts = products.filter((p) => p.active !== false);
  const featuredProducts = activeProducts.filter((p) => p.featured).slice(0, 3);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : activeProducts.slice(0, 3);

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqName || !rfqPhone || !rfqMessage) {
      setRfqError('Please fill in your name, contact phone, and requirement details.');
      return;
    }

    setRfqSubmitting(true);
    setRfqError(null);

    const res = await addInquiry({
      customerName: rfqName,
      companyName: rfqCompany,
      phone: rfqPhone,
      email: rfqEmail || 'not-provided@rfq.local',
      productCategory: rfqCategory,
      inquiryType: 'RFQ',
      estimatedVolume: rfqVolume,
      destinationCity: rfqCity,
      message: rfqMessage,
      assignedTo: 'Mr. Ravinder Kaushik',
      adminNotes: 'Direct RFQ submitted via Institutional Homepage Desk',
    });

    setRfqSubmitting(false);
    if (res.success) {
      setRfqSubmitted(true);
      setRfqName('');
      setRfqCompany('');
      setRfqPhone('');
      setRfqEmail('');
      setRfqVolume('');
      setRfqCity('');
      setRfqMessage('');
    } else {
      setRfqError(res.error || 'Failed to submit inquiry. Please contact directorate directly.');
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets size={20} />;
      case 'Layers': return <Layers size={20} />;
      case 'FileText': return <FileText size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      default: return <FlaskConical size={20} />;
    }
  };

  const renderStatIcon = (type: string) => {
    switch (type) {
      case 'flask': return <FlaskConical size={22} />;
      case 'globe': return <Globe size={22} />;
      case 'shield': return <ShieldCheck size={22} />;
      case 'award': return <Award size={22} />;
      case 'users': return <Users size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  return (
    <div className="institutional-homepage">
      {/* ================================================================
          1. DIGNIFIED INSTITUTIONAL HERO SECTION
          ================================================================ */}
      <section className="gov-hero-section" aria-labelledby="hero-title">
        <div className="gov-hero-overlay" />
        <div className="gov-hero-container">
          <div className="gov-hero-grid">
            {/* Left Column: Institutional Mission & Calls to Action */}
            <div className="gov-hero-left">
              {/* Compliance Badges Ribbon */}
              <div className="gov-pill-cluster">
                <span className="gov-badge-tag verified">
                  <ShieldCheck size={13} />
                  ISO 9001:2015 Certified
                </span>
                <span className="gov-badge-tag neutral">
                  Make in India Registered
                </span>
                <span className="gov-badge-tag eco">
                  ZDHC Level 3 Compliant
                </span>
              </div>

              <h1 id="hero-title" className="gov-hero-heading">
                {companySettings.heroHeadline || 'National Industrial Chemical Formulations & Advanced Specialty Polymers'}
              </h1>

              <p className="gov-hero-desc">
                {companySettings.heroDescription || (
                  <>
                    Raghav Texchems Chemical Private Limited manufactures high-purity Dyestuffs, Polymer & Acrylic Emulsions, Textile Auxiliaries, and Paper Sizing chemicals engineered for heavy industrial utility under our corporate commitment: <em>"chemistry that connects"</em>.
                  </>
                )}
              </p>

              {/* Direct Institutional Actions */}
              <div className="gov-hero-cta-group">
                <Link to="/products" className="btn-gov-primary" id="hero-explore-catalog-btn">
                  <span>Explore Chemical Catalog</span>
                  <ArrowRight size={16} />
                </Link>

                <a href="#rfq-desk" className="btn-gov-secondary">
                  <FileSpreadsheet size={16} />
                  <span>Submit Official RFQ</span>
                </a>

                <Link to="/about" className="btn-gov-outline">
                  <span>Directorate Story</span>
                </Link>
              </div>

              {/* Statutory Guarantee Badges */}
              <div className="gov-trust-strip">
                <div className="trust-item">
                  <CheckCircle2 size={15} className="trust-icon" />
                  <span>100% Pre-Dispatch COA</span>
                </div>
                <div className="trust-item">
                  <CheckCircle2 size={15} className="trust-icon" />
                  <span>Zero Formaldehyde Formulations</span>
                </div>
                <div className="trust-item">
                  <CheckCircle2 size={15} className="trust-icon" />
                  <span>Pan-India Direct Logistics</span>
                </div>
              </div>
            </div>

            {/* Right Column: Directorate Executive Contacts & Dispatch Card */}
            <div className="gov-hero-right">
              <div className="directorate-access-card">
                <div className="card-top-strip">
                  <Building2 size={16} />
                  <span>OFFICIAL DIRECTORATE & DISPATCH DESK</span>
                </div>

                <div className="card-body">
                  <p className="card-intro">
                    Direct communication desk with senior chemical technologists for commercial orders, custom reactor synthesis, and institutional tenders.
                  </p>

                  <div className="director-profile-item">
                    <div className="director-meta">
                      <span className="director-name">{companySettings.contact1Name}</span>
                      <span className="director-title">{companySettings.contact1Title || 'Director / Technical Sales'}</span>
                    </div>
                    <a
                      href={`tel:+91${companySettings.contact1Phone}`}
                      className="director-call-btn"
                      title="Call Director"
                    >
                      <Phone size={14} />
                      <span>+91 {companySettings.contact1Phone}</span>
                    </a>
                  </div>

                  <div className="director-profile-item">
                    <div className="director-meta">
                      <span className="director-name">{companySettings.contact2Name}</span>
                      <span className="director-title">{companySettings.contact2Title || 'Director / Operations & Supply'}</span>
                    </div>
                    <a
                      href={`tel:+91${companySettings.contact2Phone}`}
                      className="director-call-btn"
                      title="Call Director"
                    >
                      <Phone size={14} />
                      <span>+91 {companySettings.contact2Phone}</span>
                    </a>
                  </div>

                  <div className="dispatch-details-grid">
                    <div className="dispatch-row">
                      <MapPin size={13} className="dispatch-icon" />
                      <span><strong>Plant:</strong> Sector 29 Industrial Zone, Panipat, Haryana</span>
                    </div>
                    <div className="dispatch-row">
                      <Mail size={13} className="dispatch-icon" />
                      <span><strong>Official:</strong> {companySettings.email}</span>
                    </div>
                    <div className="dispatch-row">
                      <Clock size={13} className="dispatch-icon" />
                      <span><strong>Hours:</strong> {companySettings.operatingHours || 'Mon - Sat: 09:00 AM - 06:30 PM'}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer-strip">
                  <Link to="/contact" className="card-footer-link">
                    <span>File Commercial Procurement Notice</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. INSTITUTIONAL METRICS BAND (4 Stat Counters)
          ================================================================ */}
      <section className="gov-metrics-band" aria-label="Key Performance Figures">
        <div className="gov-metrics-container">
          <div className="metrics-grid">
            {stats.map((st) => (
              <div key={st.id} className="metric-cell">
                <div className="metric-icon-wrap">
                  {renderStatIcon(st.iconType)}
                </div>
                <div className="metric-content">
                  <span className="metric-number">{st.value}</span>
                  <span className="metric-label">{st.label}</span>
                  {st.description && <span className="metric-sub">{st.description}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          3. APPROVED CHEMICAL DIVISIONS
          ================================================================ */}
      <section className="gov-divisions-section" aria-labelledby="divisions-heading">
        <div className="gov-section-container">
          <div className="section-header-block">
            <div className="section-pre-tag">INDUSTRIAL MANUFACTURING DOMAINS</div>
            <h2 id="divisions-heading" className="section-title">
              Approved Chemical Divisions & Synthesis Portfolios
            </h2>
            <div className="section-accent-rule" />
            <p className="section-lead">
              Our continuous reactors and formulation facilities engineer five core specialized chemical streams to support textiles, paper coating, printing, and industrial manufacturing.
            </p>
          </div>

          <div className="divisions-grid">
            {categories.map((cat) => {
              const matchingProds = activeProducts.filter((p) => p.category === cat.name);
              return (
                <div key={cat.id} className="division-card">
                  <div className="division-card-head">
                    <div className="division-icon-wrap">{getCategoryIcon(cat.iconName)}</div>
                    <span className="division-code-badge">{cat.code}</span>
                  </div>

                  <div className="division-card-body">
                    {cat.hindiTitle && (
                      <span className="division-hindi-title">{cat.hindiTitle}</span>
                    )}
                    <h3 className="division-name">{cat.name}</h3>
                    <p className="division-desc">{cat.description}</p>

                    <div className="division-meta-row">
                      <span className="division-stat">
                        <strong>{matchingProds.length}</strong> Registered Formulations
                      </span>
                    </div>
                  </div>

                  <div className="division-card-footer">
                    <Link
                      to={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="division-action-link"
                    >
                      <span>Explore Formulations</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          4. FEATURED CHEMICAL FORMULATIONS (TDS Spec Strip)
          ================================================================ */}
      <section className="gov-formulations-section" aria-labelledby="formulations-heading">
        <div className="gov-section-container">
          <div className="section-header-split">
            <div>
              <div className="section-pre-tag">TECHNICAL DOSSIERS & SPECIFICATIONS</div>
              <h2 id="formulations-heading" className="section-title">
                Active Chemical Formulations
              </h2>
            </div>
            <Link to="/products" className="btn-view-all-catalog">
              <span>View Complete Catalog ({activeProducts.length} Products)</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="products-grid">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectTechSpecs={(prod) => setSelectedTechSpecProduct(prod)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          5. OFFICIAL RFQ (REQUEST FOR QUOTATION) & PROCUREMENT DESK
          ================================================================ */}
      <section id="rfq-desk" className="gov-rfq-section" aria-labelledby="rfq-heading">
        <div className="gov-section-container">
          <div className="rfq-desk-container">
            <div className="rfq-desk-grid">
              {/* Left Column: Guidance & Instructions */}
              <div className="rfq-guidance-side">
                <div className="rfq-pre-tag">INSTITUTIONAL TENDER & COMMERCIAL RFQ</div>
                <h2 id="rfq-heading" className="rfq-title">
                  Submit Official Request for Quotation
                </h2>
                <div className="rfq-rule" />
                <p className="rfq-desc">
                  This electronic desk allows industrial manufacturing plants, dye houses, paper mills, and government tender authorities to request binding price quotations, volume rate cards, and pre-dispatch laboratory samples.
                </p>

                <div className="rfq-process-steps">
                  <div className="rfq-step">
                    <div className="step-num">01</div>
                    <div className="step-text">
                      <strong>Submission & Verification:</strong> Your requirements are logged with our sales engineering desk.
                    </div>
                  </div>
                  <div className="rfq-step">
                    <div className="step-num">02</div>
                    <div className="step-text">
                      <strong>Technical Evaluation:</strong> Chemical specifications and volume logistics are verified.
                    </div>
                  </div>
                  <div className="rfq-step">
                    <div className="step-num">03</div>
                    <div className="step-text">
                      <strong>Official Quotation:</strong> Directorate issues formal commercial rate & dispatch schedule.
                    </div>
                  </div>
                </div>

                <div className="rfq-emergency-notice">
                  <span className="notice-lead">Need Urgent Dispatch within 24 Hours?</span>
                  <a href={`tel:+91${companySettings.contact1Phone}`} className="notice-phone">
                    <Phone size={14} /> Call Mr. Ravinder Kaushik: +91 {companySettings.contact1Phone}
                  </a>
                </div>
              </div>

              {/* Right Column: High-Density Interactive RFQ Form */}
              <div className="rfq-form-side">
                <div className="rfq-form-card">
                  <div className="rfq-form-header">
                    <FileSpreadsheet size={18} />
                    <span>COMMERCIAL PROCUREMENT FORM</span>
                  </div>

                  {rfqSubmitted ? (
                    <div className="rfq-success-message animate-fade-in">
                      <CheckCircle2 size={48} className="success-icon" />
                      <h3 className="success-title">RFQ Successfully Transmitted</h3>
                      <p className="success-desc">
                        Your inquiry has been cataloged under reference registry. Directorate executives <strong>Mr. Ravinder Kaushik</strong> or <strong>Mr. Sandeep</strong> will review your specifications and issue a formal quote within 1 business day.
                      </p>
                      <button
                        type="button"
                        className="btn-gov-primary"
                        onClick={() => setRfqSubmitted(false)}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRfqSubmit} className="rfq-form">
                      {rfqError && (
                        <div className="rfq-error-box" role="alert">
                          {rfqError}
                        </div>
                      )}

                      <div className="rfq-form-row two-col">
                        <div className="form-field">
                          <label htmlFor="rfq-name">
                            Authorized Representative Name <span className="req">*</span>
                          </label>
                          <input
                            id="rfq-name"
                            type="text"
                            required
                            placeholder="e.g. Ramesh Chandra"
                            value={rfqName}
                            onChange={(e) => setRfqName(e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label htmlFor="rfq-company">Enterprise / Mill Name</label>
                          <input
                            id="rfq-company"
                            type="text"
                            placeholder="e.g. Haryana Textile Mills Ltd."
                            value={rfqCompany}
                            onChange={(e) => setRfqCompany(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="rfq-form-row two-col">
                        <div className="form-field">
                          <label htmlFor="rfq-phone">
                            Direct Contact Number <span className="req">*</span>
                          </label>
                          <input
                            id="rfq-phone"
                            type="tel"
                            required
                            placeholder="10-digit mobile number"
                            value={rfqPhone}
                            onChange={(e) => setRfqPhone(e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label htmlFor="rfq-email">Official Corporate Email</label>
                          <input
                            id="rfq-email"
                            type="email"
                            placeholder="procurement@company.com"
                            value={rfqEmail}
                            onChange={(e) => setRfqEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="rfq-form-row two-col">
                        <div className="form-field">
                          <label htmlFor="rfq-category">Chemical Division of Interest</label>
                          <select
                            id="rfq-category"
                            value={rfqCategory}
                            onChange={(e) => setRfqCategory(e.target.value)}
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name} ({c.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor="rfq-volume">Estimated Requirement Volume</label>
                          <input
                            id="rfq-volume"
                            type="text"
                            placeholder="e.g. 5 Metric Tonnes / 20 Drums"
                            value={rfqVolume}
                            onChange={(e) => setRfqVolume(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="rfq-city">Delivery Destination Industrial City / State</label>
                        <input
                          id="rfq-city"
                          type="text"
                          placeholder="e.g. Panipat, Surat, Bhilwara, Ludhiana, Ahmedabad"
                          value={rfqCity}
                          onChange={(e) => setRfqCity(e.target.value)}
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="rfq-msg">
                          Technical Specifications / Commercial Inquiry <span className="req">*</span>
                        </label>
                        <textarea
                          id="rfq-msg"
                          rows={3}
                          required
                          placeholder="Specify target viscosity, pH, fabric/paper type, or specific brand equivalent..."
                          value={rfqMessage}
                          onChange={(e) => setRfqMessage(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-submit-rfq"
                        disabled={rfqSubmitting}
                      >
                        <Send size={15} />
                        <span>{rfqSubmitting ? 'Transmitting to Directorate...' : 'Transmit RFQ to Directorate'}</span>
                      </button>

                      <span className="form-privacy-note">
                        🔒 Communications are recorded securely. We respect enterprise procurement confidentiality.
                      </span>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          6. STATUTORY COMPLIANCE & QUALITY MATRIX
          ================================================================ */}
      <section className="gov-compliance-section" aria-labelledby="compliance-heading">
        <div className="gov-section-container">
          <div className="section-header-block">
            <div className="section-pre-tag">NATIONAL & INTERNATIONAL AUDIT STANDARDS</div>
            <h2 id="compliance-heading" className="section-title">
              Statutory Quality Accreditations
            </h2>
            <div className="section-accent-rule" />
          </div>

          <div className="compliance-grid">
            {certifications.map((cert) => (
              <div key={cert.id} className="compliance-card">
                <div className="compliance-head">
                  <ShieldCheck size={20} className="compliance-icon" />
                  {cert.certificateNumber && (
                    <span className="cert-code">{cert.certificateNumber}</span>
                  )}
                </div>
                <h3 className="compliance-title">{cert.title}</h3>
                <span className="compliance-body">{cert.issuingBody}</span>
                <p className="compliance-desc">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications Modal */}
      {selectedTechSpecProduct && (
        <TechSpecModal
          product={selectedTechSpecProduct}
          onClose={() => setSelectedTechSpecProduct(null)}
        />
      )}
    </div>
  );
};
