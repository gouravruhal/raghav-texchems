import React from 'react';
import type { Product } from '../../types';
import { X, Download, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface TechSpecModalProps {
  product: Product | null;
  onClose: () => void;
}

export const TechSpecModal: React.FC<TechSpecModalProps> = ({ product, onClose }) => {
  const { companySettings } = useData();
  const primaryContact = companySettings.contacts.find((contact) => contact.active) || companySettings.contacts[0];

  if (!product) return null;

  const handleWhatsAppQuote = () => {
    const contactName = primaryContact?.name || companySettings.contact1Name;
    const contactPhone = primaryContact?.phone || companySettings.contact1Phone;
    const text = `Hello ${contactName}, I require technical data sheet & pricing quote for ${product.name} (${product.code}).`;
    window.open(`https://wa.me/91${contactPhone}?text=${encodeURIComponent(text)}`, '_blank');
    onClose();
  };

  const handleDownloadTDS = () => {
    alert(`Downloading Technical Data Sheet (TDS / MSDS) for ${product.name}...`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <span className="product-category-tag" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
          {product.category}
        </span>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {product.name}
        </h3>
        <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Product Code: {product.code} | Status: <span style={{ color: '#059669', fontWeight: 600 }}>{product.stockStatus || 'In Stock'}</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {product.description}
        </p>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Technical Parameters Sheet (TDS Summary)
        </h4>

        <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div><strong>Appearance:</strong> {product.appearance}</div>
            <div><strong>pH Range:</strong> {product.ph}</div>
            <div><strong>Active Content:</strong> {product.activeContent}</div>
            <div><strong>Viscosity:</strong> {product.viscosity}</div>
          </div>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Recommended Applications
        </h4>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          {product.applications.map((app) => (
            <li key={app}>{app}</li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={handleDownloadTDS}
          >
            <Download size={16} /> Download MSDS / TDS
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleWhatsAppQuote}
          >
            Direct WhatsApp Quote <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
