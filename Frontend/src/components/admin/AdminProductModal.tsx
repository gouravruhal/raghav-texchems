import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { X, Save, Plus } from 'lucide-react';

interface AdminProductModalProps {
  product: Product | null; // Null if adding new product
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'> | Product) => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    name: '',
    code: '',
    category: CATEGORIES[1] || 'Dyestuff & Colorants',
    description: '',
    appearance: '',
    ph: '',
    activeContent: '',
    viscosity: '',
    applications: [],
    featured: false,
    active: true,
    stockStatus: 'In Stock'
  });

  const [applicationInput, setApplicationInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        code: product.code,
        category: product.category,
        description: product.description,
        appearance: product.appearance,
        ph: product.ph,
        activeContent: product.activeContent,
        viscosity: product.viscosity,
        applications: product.applications || [],
        featured: product.featured || false,
        active: product.active !== false,
        stockStatus: product.stockStatus || 'In Stock'
      });
    } else {
      setFormData({
        name: '',
        code: `RTC-CHEM-${Math.floor(100 + Math.random() * 900)}`,
        category: CATEGORIES[1] || 'Dyestuff & Colorants',
        description: '',
        appearance: 'Milky Liquid',
        ph: '6.5 - 7.5',
        activeContent: '50%',
        viscosity: '200 cP',
        applications: ['Industrial Application'],
        featured: false,
        active: true,
        stockStatus: 'In Stock'
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddApplication = () => {
    if (applicationInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        applications: [...prev.applications, applicationInput.trim()]
      }));
      setApplicationInput('');
    }
  };

  const handleRemoveApplication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSave({ ...formData, id: product.id, createdAt: product.createdAt });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
          {product ? 'Edit Chemical Product' : 'Add New Chemical Product'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Update chemical properties, active content percentage, and TDS parameters in catalog.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Poly-Bind Emulsion 50"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Code *</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. RTC-POLY-204"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'All Products').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Status</label>
              <select
                className="form-control"
                value={formData.stockStatus}
                onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as any })}
              >
                <option value="In Stock">In Stock</option>
                <option value="Custom Order">Custom Order</option>
                <option value="High Demand">High Demand</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              required
              className="form-control"
              style={{ minHeight: '80px' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the chemical application and performance..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Appearance</label>
              <input
                type="text"
                className="form-control"
                value={formData.appearance}
                onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">pH Range</label>
              <input
                type="text"
                className="form-control"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Active Solids</label>
              <input
                type="text"
                className="form-control"
                value={formData.activeContent}
                onChange={(e) => setFormData({ ...formData, activeContent: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Viscosity</label>
              <input
                type="text"
                className="form-control"
                value={formData.viscosity}
                onChange={(e) => setFormData({ ...formData, viscosity: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Applications</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Add application (e.g. Textile Dyeing)"
                value={applicationInput}
                onChange={(e) => setApplicationInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddApplication}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.applications.map((app, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--primary-brand-light)',
                    color: 'var(--primary-brand)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {app}
                  <X
                    size={14}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveApplication(idx)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="featured-check"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <label htmlFor="featured-check" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Mark as Featured Product on Homepage
            </label>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="product-active-check"
              checked={formData.active !== false}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="product-active-check" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Show this product on the public website
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
