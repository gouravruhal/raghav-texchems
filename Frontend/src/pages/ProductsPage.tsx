import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/products/ProductCard';
import { TechSpecModal } from '../components/products/TechSpecModal';
import type { Product } from '../types';
import {
  Search,
  X,
  Droplets,
  Layers,
  FileText,
  Sparkles,
  Package,
  Activity,
  ArrowRight,
  FlaskConical,
  CheckCircle2
} from 'lucide-react';

import { sanitizeSearchQuery } from '../lib/validation';

export const ProductsPage: React.FC = () => {
  const { products } = useData();
  const activeProducts = products.filter((product) => product.active !== false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Active category derived directly from searchParams (syncs with navbar dropdown links!)
  const activeCategory = searchParams.get('category') || 'All Products';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dynamically extract unique categories that actually have active products
  const dynamicCategories = useMemo(() => {
    const unique = Array.from(new Set(activeProducts.map((p) => p.category).filter(Boolean)));
    return ['All Products', ...unique];
  }, [activeProducts]);

  // If the activeCategory in URL is not valid anymore, fallback cleanly
  const handleCategorySelect = (cat: string) => {
    if (cat === 'All Products') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  // Helper to map category names to distinct icons
  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('all')) return <FlaskConical size={16} />;
    if (lower.includes('dye') || lower.includes('color')) return <Droplets size={16} />;
    if (lower.includes('polymer') || lower.includes('emulsion')) return <Layers size={16} />;
    if (lower.includes('paper') || lower.includes('coating')) return <FileText size={16} />;
    if (lower.includes('textile') || lower.includes('auxiliary')) return <Sparkles size={16} />;
    if (lower.includes('pack') || lower.includes('resin')) return <Package size={16} />;
    return <Activity size={16} />;
  };

  // Filter products by category and reactive search
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const matchesCategory =
        activeCategory === 'All Products' || p.category.toLowerCase() === activeCategory.toLowerCase();

      const query = sanitizeSearchQuery(searchQuery).toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.appearance.toLowerCase().includes(query) ||
        p.activeContent.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.applications && p.applications.some((app) => app.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [activeProducts, activeCategory, searchQuery]);

  return (
    <div className="products-page-container">
      {/* HEADER SECTION */}
      <section className="products-hero-header">
        <div className="section-container">
          <div className="section-badge">SPECIALTY CHEMICAL CATALOG</div>
          <h1 className="section-title">Formulation Catalog & Solutions</h1>
          <p className="section-subtitle">
            Browse our technical specifications, TDS parameters, and industrial applications for Dyestuffs, Polymers, Auxiliary Emulsions, and Coating Resins.
          </p>
        </div>
      </section>

      <div className="section-container products-content-layout">
        {/* DYNAMIC CATEGORY FILTER TABS (Generated directly from active backend products) */}
        {dynamicCategories.length > 1 && (
          <div className="categories-filter-wrapper">
            <div className="categories-filter-bar">
              {dynamicCategories.map((cat) => {
                const count =
                  cat === 'All Products'
                    ? activeProducts.length
                    : activeProducts.filter((p) => p.category === cat).length;
                const isSelected =
                  cat === 'All Products'
                    ? activeCategory === 'All Products'
                    : activeCategory.toLowerCase() === cat.toLowerCase();

                return (
                  <button
                    key={cat}
                    className={`category-pill-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span className="category-pill-icon">{getCategoryIcon(cat)}</span>
                    <span className="category-pill-name">{cat}</span>
                    <span className="category-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SEARCH AND FILTER CONTROLS */}
        <div className="products-toolbar">
          <div className="search-box-wrapper products-search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by chemical name, code (e.g. RTC-DYE), solids %, or application..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="products-results-badge">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{activeProducts.length}</strong> formulations
              {activeCategory !== 'All Products' && (
                <> in <span className="highlight-cat">{activeCategory}</span></>
              )}
            </span>
            {(activeCategory !== 'All Products' || searchQuery) && (
              <button className="reset-filter-btn" onClick={handleClearFilters}>
                <X size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectTechSpecs={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="products-empty-state animate-fade-in">
            <div className="empty-state-icon">
              <FlaskConical size={36} />
            </div>
            <h3 className="empty-state-title">No Matching Chemical Formulations</h3>
            <p className="empty-state-text">
              {activeProducts.length === 0
                ? 'No active products are currently configured in the database. Please check back shortly.'
                : `We couldn't find any formulations matching your filter "${activeCategory}" ${searchQuery ? `and search "${searchQuery}"` : ''}.`}
            </p>
            {(activeCategory !== 'All Products' || searchQuery) && (
              <button className="btn btn-primary" onClick={handleClearFilters} style={{ marginTop: '1rem' }}>
                View All Formulations ({activeProducts.length})
              </button>
            )}
          </div>
        )}

        {/* CONTACT / CUSTOM FORMULATION BANNER */}
        <div className="custom-formulation-strip">
          <div className="formulation-strip-content">
            <CheckCircle2 size={24} className="strip-check-icon" />
            <div>
              <h4 className="strip-title">Require a Custom Chemical Specification or Pilot Batch?</h4>
              <p className="strip-subtitle">
                Our analytical laboratory synthesizes custom molecular weights, solid percentages, and viscosity profiles.
              </p>
            </div>
          </div>
          <Link to="/contact" className="btn btn-secondary strip-cta-btn">
            Request Custom Synthesis <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* TECHNICAL DATA SHEET MODAL */}
      <TechSpecModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
