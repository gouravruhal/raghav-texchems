import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Lock, Phone, Mail, MapPin, ShieldCheck, ExternalLink, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Footer: React.FC = () => {
  const { companySettings, categories } = useData();

  return (
    <footer className="gov-footer" role="contentinfo" aria-label="Official Corporate Footer">
      {/* 1. TOP STRIP: Directorate Corporate Registrations */}
      <div className="gov-footer-corporate-strip">
        <div className="gov-footer-container">
          <div className="corporate-credentials-row">
            <div className="cred-badge">
              <span className="cred-key">CIN:</span>
              <span className="cred-val">{companySettings.cinNumber || 'U24100HR2020PTC086742'}</span>
            </div>
            <div className="cred-divider" aria-hidden="true">•</div>
            <div className="cred-badge">
              <span className="cred-key">GSTIN:</span>
              <span className="cred-val">{companySettings.gstinNumber || '06AABCR1234F1Z5'}</span>
            </div>
            <div className="cred-divider" aria-hidden="true">•</div>
            <div className="cred-badge">
              <span className="cred-key">QUALITY ACCREDITATION:</span>
              <span className="cred-val">ISO 9001:2015 REGISTERED QMS</span>
            </div>
            <div className="cred-divider" aria-hidden="true">•</div>
            <div className="cred-badge">
              <span className="cred-key">COMPLIANCE:</span>
              <span className="cred-val">ZDHC ROADMAP TO ZERO & REACH COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT COLUMNS */}
      <div className="gov-footer-main">
        <div className="gov-footer-container">
          <div className="gov-footer-grid">
            {/* Col 1: Institutional Nomenclature & Plant */}
            <div className="gov-col-brand">
              <div className="footer-emblem-wrap">
                <div className="footer-emblem-icon">
                  <FlaskConical size={22} />
                </div>
                <div className="footer-emblem-text">
                  <span className="emblem-hindi">{companySettings.hindiName || 'राघव टेक्सकेम्स केमिकल'}</span>
                  <strong className="emblem-title">RAGHAV TEXCHEMS CHEMICAL</strong>
                  <span className="emblem-type">Private Limited • Est. India</span>
                </div>
              </div>

              <p className="footer-mission-snippet">
                Industrial chemical manufacturer & exporter specializing in high-repeatability Dyestuff, Polymer Emulsions, Textile Auxiliaries, and Paper Sizing formulations under the ethos: <em>"chemistry that connects"</em>.
              </p>

              <div className="footer-plant-location">
                <MapPin size={15} className="plant-pin-icon" />
                <div className="plant-address-text">
                  <strong>Registered Plant & Synthesis Complex:</strong>
                  <span>{companySettings.plantLocation || companySettings.address}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Chemical Divisions Directory */}
            <div className="gov-col-links">
              <h4 className="gov-footer-header">Chemical Divisions</h4>
              <ul className="gov-footer-link-list">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="gov-footer-link">
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
                <li style={{ marginTop: '0.5rem' }}>
                  <Link to="/products" className="gov-footer-highlight-link">
                    <span>Access All Formulations & TDS</span>
                    <ExternalLink size={12} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Institutional Navigation & Governance */}
            <div className="gov-col-links">
              <h4 className="gov-footer-header">Governance & Directory</h4>
              <ul className="gov-footer-link-list">
                <li><Link to="/" className="gov-footer-link">Home Portal</Link></li>
                <li><Link to="/about" className="gov-footer-link">Corporate Story & Infrastructure</Link></li>
                <li><Link to="/quality" className="gov-footer-link">Quality Standards & Lab Testing</Link></li>
                <li><Link to="/contact" className="gov-footer-link">e-RFQ & Commercial Desk</Link></li>
                <li style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link to="/login" className="gov-footer-link admin-entry">
                    <Lock size={12} />
                    <span>Directorate & Admin Portal</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Directorate Executive Helpline */}
            <div className="gov-col-contacts">
              <h4 className="gov-footer-header">Directorate Contacts</h4>
              <div className="gov-executive-contacts">
                <div className="exec-contact-row">
                  <span className="exec-name">{companySettings.contact1Name}</span>
                  <span className="exec-role">{companySettings.contact1Title || 'Director / Technical Sales'}</span>
                  <a href={`tel:+91${companySettings.contact1Phone}`} className="exec-phone-link">
                    <Phone size={12} /> +91 {companySettings.contact1Phone}
                  </a>
                </div>

                <div className="exec-contact-row">
                  <span className="exec-name">{companySettings.contact2Name}</span>
                  <span className="exec-role">{companySettings.contact2Title || 'Director / Operations & Logistics'}</span>
                  <a href={`tel:+91${companySettings.contact2Phone}`} className="exec-phone-link">
                    <Phone size={12} /> +91 {companySettings.contact2Phone}
                  </a>
                </div>

                <div className="exec-contact-row">
                  <span className="exec-role">Corporate Dispatch Email</span>
                  <a href={`mailto:${companySettings.email}`} className="exec-email-link">
                    <Mail size={12} /> {companySettings.email}
                  </a>
                </div>

                <div className="exec-hours-row">
                  <Clock size={12} />
                  <span>{companySettings.operatingHours || 'Mon - Sat: 09:00 AM - 06:30 PM IST'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM STATUTORY & COPYRIGHT STRIP */}
      <div className="gov-footer-bottom">
        <div className="gov-footer-container">
          <div className="gov-bottom-row">
            <div className="bottom-copyright">
              &copy; {new Date().getFullYear()} {companySettings.companyName}. All rights reserved. Registered under Ministry of Corporate Affairs, Government of India.
            </div>

            <div className="bottom-badges-strip">
              <span className="stat-pill"><ShieldCheck size={12} /> ISO 9001:2015</span>
              <span className="stat-pill">Make in India</span>
              <span className="stat-pill">ZDHC Level 3</span>
              <span className="stat-pill">REACH (EU)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
