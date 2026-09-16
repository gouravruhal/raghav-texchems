import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit2,
  Eye,
  EyeOff,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  Filter
} from 'lucide-react';

import { useData } from '../../context/DataContext';
import { CATEGORIES } from '../../data/initialData';
import { sanitizeSearchQuery } from '../../lib/validation';

type ProductFilter = 'all' | 'active' | 'disabled';
type StockFilter = 'all' | 'In Stock' | 'High Demand' | 'Custom Order';

export const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    products,
    updateProduct,
    deleteProduct,
    toggleProductActive,
  } = useData();

  const isSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname === 'admin.localhost');

  const basePath = isSubdomain ? '' : '/admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [statusFilter, setStatusFilter] = useState<ProductFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${name}" from the product catalog?`,
    );

    if (!confirmed) return;
    deleteProduct(id);
  };

  const handleToggleActive = (id: string) => {
    toggleProductActive(id);
  };

  const handleToggleFeatured = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      updateProduct({ ...prod, featured: !prod.featured });
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      alert('No products available to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Code',
      'Category',
      'Active',
      'Featured',
      'Stock Status',
      'pH',
      'Active Content',
      'Viscosity',
      'Appearance',
      'Applications',
      'Description'
    ];

    // OWASP A03: Neutralize CSV Formula Injection
    const sanitizeCsvCell = (val: string | undefined | null): string => {
      if (!val) return '""';
      const clean = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(clean)) {
        return `"'${clean}"`;
      }
      return `"${clean}"`;
    };

    const rows = products.map((p) => [
      sanitizeCsvCell(p.id),
      sanitizeCsvCell(p.name),
      sanitizeCsvCell(p.code),
      sanitizeCsvCell(p.category),
      p.active !== false ? 'Yes' : 'No',
      p.featured ? 'Yes' : 'No',
      sanitizeCsvCell(p.stockStatus || 'In Stock'),
      sanitizeCsvCell(p.ph),
      sanitizeCsvCell(p.activeContent),
      sanitizeCsvCell(p.viscosity),
      sanitizeCsvCell(p.appearance),
      sanitizeCsvCell((p.applications || []).join(', ')),
      sanitizeCsvCell(p.description),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `raghav_texchems_catalog_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All Products');
    setStatusFilter('all');
    setStockFilter('all');
    setFeaturedOnly(false);
  };

  const filteredProducts = useMemo(() => {
    const query = sanitizeSearchQuery(searchQuery).toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.appearance && product.appearance.toLowerCase().includes(query)) ||
        (product.applications &&
          product.applications.some((app) =>
            app.toLowerCase().includes(query)
          ));

      const matchesCategory =
        activeCategory === 'All Products' ||
        product.category === activeCategory;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.active !== false) ||
        (statusFilter === 'disabled' && product.active === false);

      const matchesStock =
        stockFilter === 'all' || (product.stockStatus || 'In Stock') === stockFilter;

      const matchesFeatured = !featuredOnly || product.featured;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesStock &&
        matchesFeatured
      );
    });
  }, [
    products,
    searchQuery,
    activeCategory,
    statusFilter,
    stockFilter,
    featuredOnly,
  ]);

  const activeCount = products.filter((p) => p.active !== false).length;
  const disabledCount = products.filter((p) => p.active === false).length;
  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <div className="admin-page-container">
      {/* =========================================================
          HEADER
          ========================================================= */}
      <div className="admin-page-header">
        <div className="admin-header-title-block">
          <h1 className="admin-page-title">Chemical Products</h1>
          <p className="admin-page-subtitle">
            Manage formulations, TDS specifications, public visibility, and featured highlights.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            title="Export catalog to CSV spreadsheet"
          >
            <Download size={16} />
            <span>Export Catalog</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`${basePath}/products/new`)}
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          SUMMARY CARDS (DEFINED 4-COL GRID)
          ========================================================= */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#eff6ff', color: '#1d4ed8' }}
          >
            <Package size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Total Catalog</div>
            <div className="stat-number">{products.length}</div>
            <div className="stat-subtext">All registered chemicals</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#ecfdf5', color: '#047857' }}
          >
            <Eye size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Active / Visible</div>
            <div className="stat-number" style={{ color: '#047857' }}>
              {activeCount}
            </div>
            <div className="stat-subtext">Live on public catalog</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#fef2f2', color: '#b91c1c' }}
          >
            <EyeOff size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Disabled / Draft</div>
            <div className="stat-number" style={{ color: '#b91c1c' }}>
              {disabledCount}
            </div>
            <div className="stat-subtext">Hidden from public view</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#fffbeb', color: '#b45309' }}
          >
            <Sparkles size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Featured Products</div>
            <div className="stat-number" style={{ color: '#b45309' }}>
              {featuredCount}
            </div>
            <div className="stat-subtext">Pinned to Homepage</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FILTERS & TOOLBAR
          ========================================================= */}
      <div
        className="admin-panel-card"
        style={{ marginBottom: '1.5rem', padding: '1.25rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {/* Search */}
          <div
            className="search-box-wrapper"
            style={{ margin: 0, flex: '1 1 260px', maxWidth: '400px' }}
          >
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, code, category, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Category Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="form-control"
                style={{
                  width: 'auto',
                  minWidth: '170px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <option value="All Products">All Categories</option>
                {CATEGORIES.filter((c) => c !== 'All Products').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                type="button"
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                Active
              </button>
              <button
                type="button"
                className={`filter-btn ${statusFilter === 'disabled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('disabled')}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                Disabled
              </button>
            </div>

            {/* Featured toggle button */}
            <button
              type="button"
              className={`filter-btn ${featuredOnly ? 'active' : ''}`}
              onClick={() => setFeaturedOnly(!featuredOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
              }}
            >
              <Star
                size={14}
                fill={featuredOnly ? 'currentColor' : 'none'}
              />
              Featured Only
            </button>

            {/* Reset Button */}
            {(searchQuery ||
              activeCategory !== 'All Products' ||
              statusFilter !== 'all' ||
              featuredOnly) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          PRODUCT LIST TABLE
          ========================================================= */}
      <div className="admin-panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Product Catalog</h3>
            <p
              style={{
                marginTop: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              Showing <strong>{filteredProducts.length}</strong> of{' '}
              <strong>{products.length}</strong> products
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              padding: '4rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <Package
              size={44}
              strokeWidth={1.5}
              style={{ marginBottom: '0.75rem', opacity: 0.4 }}
            />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
              No products found
            </h3>
            <p style={{ margin: '0.4rem 0 1.25rem', fontSize: '0.88rem' }}>
              No products match your active search and filter criteria.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetFilters}
              >
                <RotateCcw size={15} /> Clear Filters
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`${basePath}/products/new`)}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product & Details</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Chemical Specs</th>
                  <th>Visibility</th>
                  <th>Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const isActive = product.active !== false;

                  return (
                    <tr key={product.id}>
                      {/* Product */}
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            minWidth: '240px',
                          }}
                        >
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              flexShrink: 0,
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1px solid var(--divider)',
                              background: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Package
                                size={22}
                                style={{ opacity: 0.35, color: 'var(--primary-brand)' }}
                              />
                            )}
                          </div>

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                {product.name}
                              </strong>
                            </div>

                            <div
                              style={{
                                marginTop: '0.2rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxWidth: '280px',
                              }}
                            >
                              {product.appearance || product.description || 'No description'}
                            </div>

                            {product.applications && product.applications.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                {product.applications.slice(0, 2).map((app, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '0.68rem',
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {app}
                                  </span>
                                ))}
                                {product.applications.length > 2 && (
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                    +{product.applications.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            background: '#f8fafc',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {product.code}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="product-category-tag">
                          {product.category}
                        </span>
                      </td>

                      {/* Specifications */}
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          <span><strong>pH:</strong> {product.ph || '—'}</span>
                          <span><strong>Active:</strong> {product.activeContent || '—'}</span>
                          <span><strong>Visc:</strong> {product.viscosity || '—'}</span>
                        </div>
                      </td>

                      {/* Visibility Status */}
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isActive ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleActive(product.id)}
                          title={isActive ? 'Click to hide from website' : 'Click to publish on website'}
                        >
                          {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          {isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product.id)}
                          title={product.featured ? 'Pinned on Homepage (Click to unpin)' : 'Click to Pin on Homepage'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            border: '1px solid',
                            borderColor: product.featured ? '#fde68a' : 'var(--divider)',
                            background: product.featured ? '#fffbeb' : 'transparent',
                            color: product.featured ? '#b45309' : 'var(--text-secondary)',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Star
                            size={13}
                            fill={product.featured ? '#f59e0b' : 'none'}
                            color={product.featured ? '#f59e0b' : 'currentColor'}
                          />
                          {product.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.45rem',
                          }}
                        >
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() =>
                              navigate(`${basePath}/products/${product.id}/edit`)
                            }
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            className="admin-icon-btn danger"
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};