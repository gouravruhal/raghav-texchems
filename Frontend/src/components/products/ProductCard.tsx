import React from 'react';
import type { Product } from '../../types';
import { FileText, Phone, ShieldCheck, Tag } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface ProductCardProps {
  product: Product;
  onSelectTechSpecs: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectTechSpecs }) => {
  const { companySettings } = useData();

  const handleInquiry = () => {
    const contactName = companySettings.contact1Name;
    const contactPhone = companySettings.contact1Phone;
    const text = `Hello ${contactName}, Official RFQ Notice: Technical Inquiry for ${product.name} (Code: ${product.code}). Please share commercial pricing, minimum order quantity, and TDS.`;
    window.open(`https://wa.me/91${contactPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="gov-product-card">
      {/* Card Header Strip */}
      <div className="gov-product-header">
        <div className="header-tags-group">
          <span className="gov-cat-tag">{product.category}</span>
          {product.featured && (
            <span className="gov-featured-tag">
              <ShieldCheck size={11} /> PRIORITY
            </span>
          )}
        </div>
        <span className="gov-product-code" title="Institutional Product Code">
          <Tag size={11} /> {product.code}
        </span>
      </div>

      {/* Card Body */}
      <div className="gov-product-body">
        <h3 className="gov-product-name">{product.name}</h3>
        <p className="gov-product-desc">{product.description}</p>

        {/* Technical Data Grid */}
        <div className="gov-specs-table">
          <div className="gov-spec-row">
            <span className="spec-name">Appearance</span>
            <span className="spec-val">{product.appearance || 'Standard Liquid'}</span>
          </div>
          <div className="gov-spec-row">
            <span className="spec-name">pH Buffer Range</span>
            <span className="spec-val">{product.ph || 'Neutral'}</span>
          </div>
          <div className="gov-spec-row">
            <span className="spec-name">Active Solid Content</span>
            <span className="spec-val">{product.activeContent || 'High Solids'}</span>
          </div>
          <div className="gov-spec-row">
            <span className="spec-name">Brookfield Viscosity</span>
            <span className="spec-val">{product.viscosity || 'Standard'}</span>
          </div>
        </div>

        {/* Applications Chips */}
        {product.applications && product.applications.length > 0 && (
          <div className="gov-apps-strip">
            {product.applications.slice(0, 3).map((app, i) => (
              <span key={i} className="app-chip">{app}</span>
            ))}
            {product.applications.length > 3 && (
              <span className="app-chip more">+{product.applications.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="gov-product-footer">
        <button
          type="button"
          className="btn-card-tds"
          onClick={() => onSelectTechSpecs(product)}
        >
          <FileText size={14} />
          <span>Technical Data Sheet</span>
        </button>

        <button
          type="button"
          className="btn-card-rfq"
          onClick={handleInquiry}
          title="Direct Commercial Inquiry to Directorate"
        >
          <Phone size={13} />
          <span>Inquire Directorate</span>
        </button>
      </div>
    </div>
  );
};
