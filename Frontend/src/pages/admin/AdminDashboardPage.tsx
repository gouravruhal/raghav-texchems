import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  EyeOff,
  Star,
  Plus,
  ArrowRight,
  FlaskConical,
  Eye,
  Settings2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

import { useData } from '../../context/DataContext';
import { CATEGORIES } from '../../data/initialData';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, toggleProductActive } = useData();

  const isSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname === 'admin.localhost');

  const basePath = isSubdomain ? '' : '/admin';

  const activeProducts = products.filter((p) => p.active !== false);
  const disabledProducts = products.filter((p) => p.active === false);
  const featuredProducts = products.filter((p) => p.featured);
  const recentProducts = products.slice(0, 6);

  // Compute category statistics cleanly
  const categoryStats = CATEGORIES.filter((c) => c !== 'All Products').map(
    (category) => {
      const count = products.filter((p) => p.category === category).length;
      const percentage =
        products.length > 0 ? Math.round((count / products.length) * 100) : 0;
      return { category, count, percentage };
    },
  );

  return (
    <div className="admin-page-container">
      {/* =========================================================
          PAGE HEADER
          ========================================================= */}
      <div className="admin-page-header">
        <div className="admin-header-title-block">
          <h1 className="admin-page-title">Catalog Dashboard</h1>
          <p className="admin-page-subtitle">
            Overview of chemical formulations, category distributions, and website catalog visibility.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link
            to={`${basePath}/settings`}
            className="btn btn-secondary"
          >
            <Settings2 size={16} />
            <span>Edit Website Content</span>
          </Link>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`${basePath}/products/new`)}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          STATISTICS CARDS (4-COL CLEAN GRID)
          ========================================================= */}
      <div className="admin-stats-grid">
        {/* Total Products */}
        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#eff6ff', color: '#1d4ed8' }}
          >
            <Package size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Total Catalog</div>
            <div className="stat-number">{products.length}</div>
            <div className="stat-subtext">Registered Formulations</div>
          </div>
        </div>

        {/* Active Products */}
        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#ecfdf5', color: '#047857' }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Active on Website</div>
            <div className="stat-number" style={{ color: '#047857' }}>
              {activeProducts.length}
            </div>
            <div className="stat-subtext">
              {products.length > 0
                ? `${Math.round((activeProducts.length / products.length) * 100)}% of catalog live`
                : 'No products'}
            </div>
          </div>
        </div>

        {/* Disabled Products */}
        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#fef2f2', color: '#b91c1c' }}
          >
            <EyeOff size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Disabled / Hidden</div>
            <div className="stat-number" style={{ color: '#b91c1c' }}>
              {disabledProducts.length}
            </div>
            <div className="stat-subtext">Hidden from public view</div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#fffbeb', color: '#b45309' }}
          >
            <Star size={22} fill="#f59e0b" color="#f59e0b" />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Featured Showcase</div>
            <div className="stat-number" style={{ color: '#b45309' }}>
              {featuredProducts.length}
            </div>
            <div className="stat-subtext">Pinned to Homepage Hero</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MIDDLE SECTION: CATEGORY DISTRIBUTION & QUICK SHORTCUTS
          ========================================================= */}
      <div className="admin-dashboard-split">
        {/* Category Breakdown Panel */}
        <div className="admin-panel-card category-breakdown-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">Product Categories Distribution</h3>
              <p className="panel-card-subtitle">
                Formulation inventory breakdown across chemical manufacturing segments.
              </p>
            </div>

            <Link
              to={`${basePath}/products`}
              className="admin-link-inline"
            >
              <span>View All</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="category-bars-container">
            {categoryStats.map(({ category, count, percentage }) => (
              <div key={category} className="category-bar-row">
                <div className="category-bar-header">
                  <span className="category-name-text">{category}</span>
                  <span className="category-count-badge">
                    {count} {count === 1 ? 'product' : 'products'} ({percentage}%)
                  </span>
                </div>

                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${Math.max(percentage, count > 0 ? 5 : 0)}%`,
                      background:
                        category.includes('Dyestuff')
                          ? '#1d4ed8'
                          : category.includes('Finishing')
                          ? '#059669'
                          : category.includes('Pretreatment')
                          ? '#d97706'
                          : category.includes('Enzymes')
                          ? '#7c3aed'
                          : category.includes('Printing')
                          ? '#db2777'
                          : '#0284c7',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Actions & Highlights */}
        <div className="admin-panel-card quick-mgmt-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">Quick Actions</h3>
              <p className="panel-card-subtitle">
                Core shortcuts for catalog updates and website adjustments.
              </p>
            </div>
          </div>

          <div className="quick-actions-list">
            <Link
              to={`${basePath}/products/new`}
              className="quick-action-btn primary"
            >
              <div className="quick-action-icon">
                <Plus size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Create Chemical Product</strong>
                <span>Add a new formulation with TDS specifications</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link
              to={`${basePath}/products`}
              className="quick-action-btn"
            >
              <div className="quick-action-icon">
                <Package size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Manage Product Catalogue</strong>
                <span>View, filter, edit, or toggle visibility</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>

            <Link
              to={`${basePath}/settings`}
              className="quick-action-btn"
            >
              <div className="quick-action-icon">
                <Settings2 size={18} />
              </div>
              <div className="quick-action-text">
                <strong>Edit Website Content</strong>
                <span>Hero text, stats, tie-ups & story</span>
              </div>
              <ArrowRight size={16} className="quick-action-arrow" />
            </Link>
          </div>

          <div className="admin-card-note">
            <Sparkles size={16} color="#2563eb" />
            <span>
              Changes made in Product Catalogue or Website Content are reflected immediately on the live website.
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          RECENT PRODUCTS CATALOGUE TABLE
          ========================================================= */}
      <div className="admin-panel-card" style={{ marginTop: '1.75rem' }}>
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Recent Catalogue Additions</h3>
            <p className="panel-card-subtitle">
              Latest chemical formulations added to the catalog.
            </p>
          </div>

          <Link
            to={`${basePath}/products`}
            className="admin-link-inline"
          >
            <span>Full Catalogue</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="admin-empty-table">
            <Package size={40} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
            <p>No chemical products registered yet.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`${basePath}/products/new`)}
            >
              <Plus size={16} /> Add First Product
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Product Details</th>
                  <th style={{ width: '16%' }}>SKU Code</th>
                  <th style={{ width: '20%' }}>Category</th>
                  <th style={{ width: '14%' }}>Visibility</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => {
                  const isActive = product.active !== false;

                  return (
                    <tr key={product.id}>
                      {/* Product details */}
                      <td>
                        <div className="product-cell-wrapper">
                          <div className="product-thumb-box">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <FlaskConical size={18} color="#94a3b8" />
                            )}
                          </div>
                          <div className="product-info-column">
                            <strong className="product-cell-name">
                              {product.name}
                            </strong>
                            <span className="product-cell-sub">
                              {product.appearance || 'Standard technical grade'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td>
                        <span className="sku-badge">{product.code}</span>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="product-category-tag">
                          {product.category}
                        </span>
                      </td>

                      {/* Visibility Status */}
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${
                            isActive ? 'active' : 'inactive'
                          }`}
                          onClick={() => toggleProductActive(product.id)}
                          title={
                            isActive
                              ? 'Click to disable'
                              : 'Click to enable'
                          }
                        >
                          {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            navigate(`${basePath}/products/${product.id}/edit`)
                          }
                        >
                          Edit
                        </button>
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