import React from 'react';
import type { Product } from '../../types';
import { FileText, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface ProductCardProps {
  product: Product;
  onSelectTechSpecs: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectTechSpecs }) => {
  const { companySettings } = useData();
  const primaryContact = companySettings.contacts.find((contact) => contact.active) || companySettings.contacts[0];

  const handleWhatsAppInquiry = () => {
    const contactName = primaryContact?.name || companySettings.contact1Name;
    const contactPhone = primaryContact?.phone || companySettings.contact1Phone;
    const text = `Hello ${contactName}, I am interested in technical specs & quotation for ${product.name} (${product.code}).`;
    window.open(`https://wa.me/91${contactPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="product-card">
      <div className="product-card-header">
        <span className="product-category-tag">{product.category}</span>
        <span className="product-code">{product.code}</span>
      </div>

      <div className="product-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className="product-name">{product.name}</h3>
          {product.featured && (
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
              FEATURED
            </span>
          )}
        </div>
        <p className="product-description">{product.description}</p>

        <div className="product-specs-list">
          <div className="spec-item">
            <span className="spec-label">Appearance</span>
            <span className="spec-value">{product.appearance}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">pH Value</span>
            <span className="spec-value">{product.ph}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Active Solids</span>
            <span className="spec-value">{product.activeContent}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Viscosity</span>
            <span className="spec-value">{product.viscosity}</span>
          </div>
        </div>
      </div>

      <div className="product-card-footer">
        <button
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={() => onSelectTechSpecs(product)}
        >
          <FileText size={15} /> Tech Specs
        </button>
        <button
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={handleWhatsAppInquiry}
        >
          Inquire Now <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
