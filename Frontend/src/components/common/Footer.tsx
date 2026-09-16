import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Phone, Mail, MapPin } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Footer: React.FC = () => {
  const { companySettings, products } = useData();

  // Extract unique active categories for dynamic footer links
  const activeCategories = Array.from(
    new Set(products.filter((product) => product.active !== false).map((p) => p.category).filter(Boolean))
  );
  const activeContacts = companySettings.contacts.filter((contact) => contact.active && contact.name && contact.phone);

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo-container">
            <img
              src={companySettings.logoUrl || '/logo.png'}
              alt={companySettings.companyName || 'Raghav Texchems Chemical Pvt. Ltd.'}
              className="footer-brand-img"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/logo.png')) {
                  target.src = '/logo.png';
                }
              }}
            />
          </div>
          <p className="footer-desc">
            Manufacturer & Exporter of Dyestuff, Polymer Emulsions, Textile Auxiliaries, Paper Coating Chemicals, and Specialty Industrial Resins.
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-on-dark-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-brand-primary)' }} />
            <span>{companySettings.address}</span>
          </div>
        </div>

        {activeCategories.length > 0 && (
          <div>
            <h4 className="footer-heading">Product Lines</h4>
            <ul className="footer-links">
              {activeCategories.map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="footer-link">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/products" className="footer-link">All Formulations</Link></li>
            <li><Link to="/quality" className="footer-link">Quality & Testing</Link></li>
            <li><Link to="/about" className="footer-link">Our Story & Infrastructure</Link></li>
            <li><Link to="/contact" className="footer-link">Contact & Inquiries</Link></li>
            <li style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-bg-dark-border)' }}>
              <Link
                to="/admin"
                className="footer-link"
                style={{ color: 'var(--color-text-on-dark-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Lock size={12} /> Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Contact Team</h4>
          <ul className="footer-links">
            {activeContacts.map((contact) => (
              <React.Fragment key={contact.id}>
                <li style={{ color: 'var(--color-text-on-dark)', fontWeight: 600 }}>{contact.name}</li>
                <li><a href={`tel:${contact.phone}`} className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} color="var(--color-brand-primary)" /> +91 {contact.phone}</a></li>
              </React.Fragment>
            ))}
            <li style={{ color: 'var(--color-text-on-dark)', fontWeight: 600, marginTop: '0.75rem' }}>Email Inquiries</li>
            <li>
              <a href={`mailto:${companySettings.email}`} className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} color="var(--color-brand-primary)" /> {companySettings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} {companySettings.companyName}. All rights reserved. | Tagline: <em>"{companySettings.tagline}"</em>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>ISO 9001:2015 Certified</span>
          <span>REACH Compliant</span>
          <span>Made in India</span>
        </div>
      </div>
    </footer>
  );
};
