import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  FlaskConical,
  Eye
} from 'lucide-react';

import { useData } from '../../context/DataContext';
import type { Product } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { uploadProductImage } from '../../lib/storage';
import { validateProductData, validateImageFile, sanitizeString, LIMITS } from '../../lib/validation';

export const AdminAddProductPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useData();

  const isSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname === 'admin.localhost');

  const basePath = isSubdomain ? '' : '/admin';

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [applicationInput, setApplicationInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt'>>({
    name: '',
    code: '',
    category: CATEGORIES[1] || 'Dyestuff & Colorants',
    description: '',
    imageUrl: '',
    imagePath: '',
    appearance: '',
    ph: '',
    activeContent: '',
    viscosity: '',
    applications: [],
    featured: false,
    active: true,
    stockStatus: 'In Stock',
  });

  // Load existing product if in Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      const existingProduct = products.find((p) => p.id === id);
      if (existingProduct) {
        setForm({
          name: existingProduct.name || '',
          code: existingProduct.code || '',
          category: existingProduct.category || CATEGORIES[1] || 'Dyestuff & Colorants',
          description: existingProduct.description || '',
          imageUrl: existingProduct.imageUrl || '',
          imagePath: existingProduct.imagePath || '',
          appearance: existingProduct.appearance || '',
          ph: existingProduct.ph || '',
          activeContent: existingProduct.activeContent || '',
          viscosity: existingProduct.viscosity || '',
          applications: existingProduct.applications || [],
          featured: existingProduct.featured || false,
          active: existingProduct.active !== false,
          stockStatus: existingProduct.stockStatus || 'In Stock',
        });

        if (existingProduct.imageUrl) {
          setImagePreview(existingProduct.imageUrl);
          if (existingProduct.imageUrl.startsWith('http')) {
            setUseUrlInput(true);
          }
        }
      } else {
        setError('Product not found in catalog.');
      }
    } else {
      // Create new default code suggestion
      const randomNum = Math.floor(100 + Math.random() * 900);
      setForm((prev) => ({
        ...prev,
        code: `RTC-CHEM-${randomNum}`,
      }));
    }
  }, [id, isEditMode, products]);

  const updateField = <K extends keyof Omit<Product, 'id' | 'createdAt'>>(
    field: K,
    value: Omit<Product, 'id' | 'createdAt'>[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
      setError(fileValidation.error || 'Invalid file format.');
      return;
    }

    setError('');
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleImageUrlChange = (url: string) => {
    updateField('imageUrl', url);
    setImagePreview(url);
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    updateField('imageUrl', '');
    updateField('imagePath', '');
  };

  const addApplication = () => {
    const value = sanitizeString(applicationInput, LIMITS.PRODUCT_APPLICATION_LEN);
    if (!value) return;

    if (
      form.applications.some(
        (app) => app.toLowerCase() === value.toLowerCase(),
      )
    ) {
      setApplicationInput('');
      return;
    }

    if (form.applications.length >= LIMITS.PRODUCT_APPLICATIONS_MAX) {
      setError(`Maximum ${LIMITS.PRODUCT_APPLICATIONS_MAX} applications allowed.`);
      return;
    }

    updateField('applications', [...form.applications, value]);
    setApplicationInput('');
  };

  const removeApplication = (index: number) => {
    updateField(
      'applications',
      form.applications.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleApplicationKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addApplication();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    setError('');

    // Strict validation
    const validationResult = validateProductData(form);
    if (!validationResult.valid) {
      setError(validationResult.error || 'Please fill in all required fields.');
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = form.imageUrl;
      let finalImagePath = form.imagePath;

      // If user uploaded a new local file, upload to Supabase Storage
      if (imageFile) {
        const uploadResult = await uploadProductImage(imageFile);
        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload product image.');
          setSaving(false);
          return;
        }
        finalImageUrl = uploadResult.publicUrl || '';
        finalImagePath = uploadResult.storagePath || '';
      }

      const cleanedData = {
        ...form,
        name: sanitizeString(form.name, LIMITS.PRODUCT_NAME),
        code: sanitizeString(form.code, LIMITS.PRODUCT_CODE),
        category: sanitizeString(form.category, LIMITS.PRODUCT_CATEGORY),
        description: sanitizeString(form.description, LIMITS.PRODUCT_DESCRIPTION),
        appearance: sanitizeString(form.appearance, LIMITS.PRODUCT_SPEC),
        ph: sanitizeString(form.ph, 50),
        activeContent: sanitizeString(form.activeContent, 50),
        viscosity: sanitizeString(form.viscosity, 80),
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
      };

      if (isEditMode && id) {
        const existing = products.find((p) => p.id === id);
        await updateProduct({
          ...cleanedData,
          id,
          createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
        });
        setSuccessToast('Product updated successfully!');
      } else {
        await addProduct(cleanedData);
        setSuccessToast('New product added to catalog!');
      }

      setTimeout(() => {
        navigate(`${basePath}/products`, { replace: true });
      }, 500);
    } catch (submitError: any) {
      console.error('Unable to save product:', submitError);
      setError(submitError?.message || 'Unable to save the product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* =========================================================
          HEADER
          ========================================================= */}
      <div className="admin-page-header">
        <div className="admin-header-title-block">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/products`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: 0,
              background: 'transparent',
              padding: 0,
              marginBottom: '0.65rem',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Back to Products Catalog
          </button>

          <h1 className="admin-page-title">
            {isEditMode ? 'Edit Chemical Product' : 'Add Chemical Product'}
          </h1>

          <p className="admin-page-subtitle">
            {isEditMode
              ? `Update chemical formulation TDS properties for ${form.name || 'product'}.`
              : 'Add a new chemical formulation to the Raghav Texchems public catalog.'}
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`${basePath}/products`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            <span>
              {saving
                ? 'Saving...'
                : isEditMode
                ? 'Save Changes'
                : 'Publish Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="admin-login-error"
          role="alert"
          style={{ marginBottom: '1.5rem' }}
        >
          {error}
        </div>
      )}

      {successToast && (
        <div className="admin-success-alert" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} /> {successToast}
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="admin-form-two-col">
          {/* =====================================================
              MAIN COLUMN
              ===================================================== */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Basic Information */}
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Product Information</h3>
                  <p
                    style={{
                      marginTop: '0.2rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Primary identification details displayed throughout the public catalog.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '1rem',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Product Commercial Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. Poly-Bind Emulsion 50"
                    maxLength={150}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product SKU / Technical Code *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={form.code}
                    onChange={(e) => updateField('code', e.target.value)}
                    placeholder="e.g. RTC-POLY-204"
                    maxLength={50}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    required
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.filter((c) => c !== 'All Products').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Technical Description *</label>
                  <textarea
                    required
                    className="form-control"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed explanation of the chemical properties, bonding performance, and recommended fabric substrate usage..."
                    rows={5}
                    maxLength={3000}
                    style={{ resize: 'vertical' }}
                  />
                  <div
                    style={{
                      marginTop: '0.3rem',
                      textAlign: 'right',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {form.description.length}/3000
                  </div>
                </div>
              </div>
            </div>

            {/* Chemical & TDS Specifications */}
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Technical Data Sheet (TDS) Specifications</h3>
                  <p
                    style={{
                      marginTop: '0.2rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Scientific benchmarks displayed in the product specification modal and download sheets.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '1rem',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Physical Appearance</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.appearance}
                    onChange={(e) => updateField('appearance', e.target.value)}
                    placeholder="e.g. Milky White Liquid / Free Flowing Powder"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">pH Range (10% aqueous)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.ph}
                    onChange={(e) => updateField('ph', e.target.value)}
                    placeholder="e.g. 6.5 - 7.5"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Solids Content (%)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.activeContent}
                    onChange={(e) => updateField('activeContent', e.target.value)}
                    placeholder="e.g. 40% ± 2% / 100% Powder"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Viscosity (cps / Brookfield)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.viscosity}
                    onChange={(e) => updateField('viscosity', e.target.value)}
                    placeholder="e.g. 400 - 800 cPs @ 25°C"
                  />
                </div>
              </div>
            </div>

            {/* Applications & Industry Uses */}
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Industrial Applications</h3>
                  <p
                    style={{
                      marginTop: '0.2rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Specify processing areas where this chemical is utilized (e.g. Textile Finishing, Garment Washing, Pretreatment).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  className="form-control"
                  value={applicationInput}
                  onChange={(e) => setApplicationInput(e.target.value)}
                  onKeyDown={handleApplicationKeyDown}
                  placeholder="e.g. Cotton & Poly-blend Dyeing, Softening Bath"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addApplication}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {form.applications.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginTop: '1rem',
                  }}
                >
                  {form.applications.map((app, index) => (
                    <div
                      key={`${app}-${index}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '999px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <span>{app}</span>
                      <button
                        type="button"
                        onClick={() => removeApplication(index)}
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: '#ef4444',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                        }}
                        aria-label={`Remove ${app}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              SIDEBAR COLUMN: IMAGE & LIVE PREVIEW
              ===================================================== */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Visibility & Settings Card */}
            <div className="admin-panel-card">
              <h3 className="panel-card-title" style={{ marginBottom: '1rem' }}>
                Catalog Configuration
              </h3>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Stock / Supply Status</label>
                <select
                  className="form-control"
                  value={form.stockStatus || 'In Stock'}
                  onChange={(e) =>
                    updateField('stockStatus', e.target.value as any)
                  }
                >
                  <option value="In Stock">In Stock (Standard Bulk Supply)</option>
                  <option value="Custom Order">Custom Order / Synthesis</option>
                  <option value="High Demand">High Demand / Pre-booking</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--background)',
                  borderRadius: '12px',
                  border: '1px solid var(--divider)',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.active !== false}
                    onChange={(e) => updateField('active', e.target.checked)}
                  />
                  <span>Publish & Visible on Public Website</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: form.featured ? '#b45309' : 'var(--text-primary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.featured || false}
                    onChange={(e) => updateField('featured', e.target.checked)}
                  />
                  <span>⭐ Mark as Featured on Homepage</span>
                </label>
              </div>
            </div>

            {/* Product Image Input */}
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Product Image</h3>
                  <p
                    style={{
                      marginTop: '0.2rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Upload an image or enter a direct web image URL.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <button
                  type="button"
                  className={`btn ${!useUrlInput ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => setUseUrlInput(false)}
                >
                  <Upload size={14} /> Upload File
                </button>
                <button
                  type="button"
                  className={`btn ${useUrlInput ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => setUseUrlInput(true)}
                >
                  <LinkIcon size={14} /> Image URL
                </button>
              </div>

              {useUrlInput ? (
                <div className="form-group">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/product-image.jpg"
                    value={form.imageUrl || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  {!imagePreview && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        padding: '1.75rem 1rem',
                        border: '2px dashed var(--divider)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#f8fafc',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus size={26} color="var(--primary-brand)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Click to browse image
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </button>
                  )}
                </>
              )}

              {imagePreview && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '160px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--divider)',
                      background: '#f8fafc',
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                    {!useUrlInput && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Image
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        padding: '0.35rem 0.6rem',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                      }}
                      onClick={removeImage}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE CATALOG CARD PREVIEW */}
            <div className="admin-panel-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Eye size={16} color="var(--primary-brand)" />
                <h3 className="panel-card-title" style={{ fontSize: '1rem' }}>
                  Live Public Card Preview
                </h3>
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                }}
              >
                This is how the chemical product will appear to buyers in the public catalog:
              </p>

              {/* Mock Product Card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid var(--divider)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    height: '130px',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <FlaskConical size={36} color="#94a3b8" />
                  )}

                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.92)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      color: 'var(--primary-brand)',
                    }}
                  >
                    {form.category || 'Category'}
                  </span>

                  {form.featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '0.7rem',
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <div style={{ padding: '1rem' }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {form.code || 'CODE-000'}
                  </div>

                  <strong
                    style={{
                      display: 'block',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      margin: '0.2rem 0 0.4rem 0',
                    }}
                  >
                    {form.name || 'Product Name Placeholder'}
                  </strong>

                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: 0,
                    }}
                  >
                    {form.description ||
                      'Product description will be rendered here with details about textile applications.'}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.4rem',
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.72rem',
                      color: '#64748b',
                    }}
                  >
                    <div>pH: <strong>{form.ph || '—'}</strong></div>
                    <div>Active: <strong>{form.activeContent || '—'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};