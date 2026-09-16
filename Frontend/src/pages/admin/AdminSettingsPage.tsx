import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { sanitizeString, isValidHttpUrl, validateLogoFile } from '../../lib/validation';
import { uploadCompanyLogo, deleteStorageFile } from '../../lib/storage';
import type {
  StatItem,
  Collaboration,
  AboutContent,
  AboutMilestone,
  AboutValue,
  CompanyContact,
} from '../../types';
import {
  Save,
  CheckCircle2,
  Building,
  TrendingUp,
  Handshake,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Award,
  ShieldCheck,
  FlaskConical,
  Users,
  Video,
  BookOpen,
  UserCheck,
  Target,
  Heart,
  Lock,
  Sparkles,
  MapPin,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    stats,
    updateStat,
    addStat,
    deleteStat,
    collaborations,
    addCollaboration,
    updateCollaboration,
    deleteCollaboration,
    toggleCollaborationActive,
    aboutContent,
    updateAboutContent,
  } = useData();

  const [activeTab, setActiveTab] = useState<
    'company' | 'stats' | 'about' | 'collaborations'
  >('company');
  const [formData, setFormData] = useState(companySettings);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(companySettings);
  }, [companySettings]);

  // Collaboration Modal State
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);
  const [collabForm, setCollabForm] = useState<Omit<Collaboration, 'id'>>({
    name: '',
    type: '',
    location: '',
    badgeText: '',
    websiteUrl: '',
    active: true,
  });

  const showSuccess = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPreviewTheme, setLogoPreviewTheme] = useState<'light' | 'dark'>('light');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setLogoError(validation.error || 'Invalid logo file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLogoUploading(true);
    try {
      const result = await uploadCompanyLogo(file);
      if (!result.success || !result.publicUrl) {
        setLogoError(result.error || 'Failed to upload logo.');
        return;
      }

      if (formData.logoPath && formData.logoPath !== result.storagePath) {
        deleteStorageFile('company-assets', formData.logoPath).catch(() => {});
      }

      const updatedSettings = {
        ...formData,
        logoUrl: result.publicUrl,
        logoPath: result.storagePath || '',
      };

      setFormData(updatedSettings);
      await updateCompanySettings(updatedSettings);
      showSuccess('Official website logo uploaded and published successfully!');
    } catch (err: any) {
      setLogoError(err?.message || 'Error uploading company logo.');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Are you sure you want to remove the custom logo? The website will revert to the default chemical brand mark.')) {
      return;
    }

    if (formData.logoPath) {
      deleteStorageFile('company-assets', formData.logoPath).catch(() => {});
    }

    const updatedSettings = {
      ...formData,
      logoUrl: '',
      logoPath: '',
    };

    setFormData(updatedSettings);
    await updateCompanySettings(updatedSettings);
    showSuccess('Custom logo removed. Reverted to default brand mark.');
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Maintain locked properties strictly
    updateCompanySettings({
      ...formData,
      companyName: companySettings.companyName,
      email: companySettings.email,
    });
    showSuccess('Company hero narrative, tagline, and contacts updated successfully!');
  };

  const updateContact = (
    id: string,
    field: keyof CompanyContact,
    value: string | boolean,
  ) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact,
      ),
    });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [
        ...formData.contacts,
        {
          id: `contact-${Date.now()}`,
          name: '',
          title: 'Technical & Sales Representative',
          phone: '',
          email: '',
          active: true,
        },
      ],
    });
  };

  const removeContact = (id: string) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((contact) => contact.id !== id),
    });
  };

  const handleStatChange = (
    id: string,
    field: 'value' | 'label' | 'description' | 'iconType',
    val: string,
  ) => {
    updateStat(id, { [field]: val } as Partial<StatItem>);
    showSuccess('Homepage benchmark metric updated in real-time!');
  };

  const handleOpenAddCollab = () => {
    setEditingCollab(null);
    setCollabForm({
      name: '',
      type: 'Textile Manufacturing Alliance',
      location: '',
      badgeText: 'Strategic Partner',
      websiteUrl: '',
      active: true,
    });
    setIsCollabModalOpen(true);
  };

  const handleOpenEditCollab = (c: Collaboration) => {
    setEditingCollab(c);
    setCollabForm({
      name: c.name,
      type: c.type,
      location: c.location,
      badgeText: c.badgeText || '',
      websiteUrl: c.websiteUrl || '',
      active: c.active,
    });
    setIsCollabModalOpen(true);
  };

  const handleSaveCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabForm.name.trim()) {
      alert('Collaboration partner name is required.');
      return;
    }
    if (collabForm.websiteUrl && !isValidHttpUrl(collabForm.websiteUrl)) {
      alert('Please enter a valid partner website URL (starting with https:// or http://).');
      return;
    }

    const cleanCollab = {
      name: sanitizeString(collabForm.name, 200),
      type: sanitizeString(collabForm.type, 150),
      location: sanitizeString(collabForm.location, 150),
      badgeText: sanitizeString(collabForm.badgeText, 100),
      websiteUrl: sanitizeString(collabForm.websiteUrl, 1000),
      active: collabForm.active,
    };

    if (editingCollab) {
      updateCollaboration({
        ...editingCollab,
        ...cleanCollab,
      });
      showSuccess(`Collaboration "${cleanCollab.name}" updated!`);
    } else {
      addCollaboration(cleanCollab);
      showSuccess(`New tie-up "${cleanCollab.name}" added to homepage!`);
    }
    setIsCollabModalOpen(false);
  };

  // ─── About Content Form State ───
  const [aboutForm, setAboutForm] = useState<AboutContent>(aboutContent);

  useEffect(() => {
    setAboutForm(aboutContent);
  }, [aboutContent]);

  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutContent(aboutForm);
    showSuccess('About page content, video, and milestones updated in real-time!');
  };

  const handleStoryParagraphChange = (idx: number, value: string) => {
    const updated = [...aboutForm.storyParagraphs];
    updated[idx] = value;
    setAboutForm({ ...aboutForm, storyParagraphs: updated });
  };

  const addStoryParagraph = () => {
    setAboutForm({
      ...aboutForm,
      storyParagraphs: [...aboutForm.storyParagraphs, ''],
    });
  };

  const removeStoryParagraph = (idx: number) => {
    setAboutForm({
      ...aboutForm,
      storyParagraphs: aboutForm.storyParagraphs.filter((_, i) => i !== idx),
    });
  };

  const handleMilestoneChange = (
    id: string,
    field: keyof AboutMilestone,
    value: string,
  ) => {
    setAboutForm({
      ...aboutForm,
      milestones: aboutForm.milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m,
      ),
    });
  };

  const addMilestone = () => {
    const newMs: AboutMilestone = {
      id: `ms-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: '',
      description: '',
    };
    setAboutForm({
      ...aboutForm,
      milestones: [...aboutForm.milestones, newMs],
    });
  };

  const removeMilestone = (id: string) => {
    setAboutForm({
      ...aboutForm,
      milestones: aboutForm.milestones.filter((m) => m.id !== id),
    });
  };

  const handleValueChange = (
    id: string,
    field: keyof AboutValue,
    value: string,
  ) => {
    setAboutForm({
      ...aboutForm,
      coreValues: aboutForm.coreValues.map((v) =>
        v.id === id ? { ...v, [field]: value } : v,
      ),
    });
  };

  const addCoreValue = () => {
    const newVal: AboutValue = {
      id: `val-${Date.now()}`,
      title: '',
      description: '',
      iconType: 'flask',
    };
    setAboutForm({
      ...aboutForm,
      coreValues: [...aboutForm.coreValues, newVal],
    });
  };

  const removeCoreValue = (id: string) => {
    setAboutForm({
      ...aboutForm,
      coreValues: aboutForm.coreValues.filter((v) => v.id !== id),
    });
  };

  // Extract YouTube preview URL helper
  const youtubePreviewEmbed = useMemo(() => {
    if (aboutForm.videoType !== 'youtube' || !aboutForm.videoUrl) return null;
    const url = aboutForm.videoUrl;
    let videoId = '';
    const match1 = url.match(/[?&]v=([^&#]+)/);
    if (match1) videoId = match1[1];
    const match2 = url.match(/youtu\.be\/([^?&#]+)/);
    if (match2) videoId = match2[1];
    const match3 = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (match3) videoId = match3[1];
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }, [aboutForm.videoUrl, aboutForm.videoType]);

  return (
    <div className="admin-page-container">
      {/* =========================================================
          PAGE HEADER
          ========================================================= */}
      <div className="admin-page-header">
        <div className="admin-header-title-block">
          <h1 className="admin-page-title">Website Content & Settings</h1>
          <p className="admin-page-subtitle">
            Configure homepage hero narratives, puzzle benchmark stats, strategic alliances, and About page content.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="admin-success-alert animate-fade-in">
          <CheckCircle2 size={18} /> {savedMessage}
        </div>
      )}

      {/* =========================================================
          TAB NAVIGATION
          ========================================================= */}
      <div className="admin-tabs-nav-container">
        <div className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <Building size={16} />
            <span>Company & Hero</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <TrendingUp size={16} />
            <span>Homepage Puzzle Stats ({stats.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <BookOpen size={16} />
            <span>About Page Content</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'collaborations' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborations')}
          >
            <Handshake size={16} />
            <span>Alliances & Tie-Ups ({collaborations.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: COMPANY & HERO SETTINGS
          ========================================================= */}
      {activeTab === 'company' && (
        <div className="admin-settings-section-card">
          <div className="settings-card-header">
            <h3 className="settings-section-heading">
              <Building size={18} color="#2563eb" />
              <span>Corporate Branding & Homepage Hero</span>
            </h3>
            <p className="settings-section-sub">
              Manage website identity, tagline, headline, public contact representatives, and plant location.
            </p>
          </div>

          <form onSubmit={handleCompanySubmit} className="settings-form-body">
            {/* BRAND LOGO MANAGEMENT SECTION */}
            <div
              className="logo-management-card"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <ImageIcon size={20} color="#2563eb" />
                    Official Website Logo
                  </h4>
                  <p
                    style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.82rem',
                      color: '#64748b',
                    }}
                  >
                    Upload your official company brand logo. It will dynamically appear in the Navbar, Footer, and Admin Portal.
                  </p>
                </div>

                {formData.logoUrl && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                      onClick={() =>
                        setLogoPreviewTheme(
                          logoPreviewTheme === 'light' ? 'dark' : 'light'
                        )
                      }
                    >
                      Preview on {logoPreviewTheme === 'light' ? 'Dark (Footer)' : 'Light (Header)'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        color: '#ef4444',
                        borderColor: '#fecaca',
                      }}
                      onClick={handleRemoveLogo}
                      disabled={logoUploading}
                    >
                      <Trash2 size={13} /> Remove Logo
                    </button>
                  </div>
                )}
              </div>

              {logoError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{logoError}</span>
                </div>
              )}

              {formData.logoUrl ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.75rem',
                    flexWrap: 'wrap',
                    background:
                      logoPreviewTheme === 'light' ? '#ffffff' : '#0a192f',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      maxHeight: '80px',
                      maxWidth: '260px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem',
                      background:
                        logoPreviewTheme === 'light'
                          ? 'rgba(241, 245, 249, 0.6)'
                          : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                    }}
                  >
                    <img
                      src={formData.logoUrl}
                      alt={formData.companyName || 'Official Website Logo'}
                      style={{
                        maxHeight: '65px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color:
                          logoPreviewTheme === 'light' ? '#0f172a' : '#f8fafc',
                      }}
                    >
                      Active Custom Logo
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color:
                          logoPreviewTheme === 'light' ? '#64748b' : '#94a3b8',
                        marginTop: '0.2rem',
                      }}
                    >
                      Securely served from Supabase Storage (<code>company-assets</code> bucket).
                    </div>
                    <div style={{ marginTop: '0.85rem' }}>
                      <label
                        className="btn btn-secondary"
                        style={{
                          cursor: 'pointer',
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Upload size={14} />
                        <span>{logoUploading ? 'Uploading New Logo...' : 'Replace Logo'}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg,.webp"
                          style={{ display: 'none' }}
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg,.webp"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto',
                    }}
                  >
                    {logoUploading ? (
                      <RefreshCw size={24} className="spin-animation" />
                    ) : (
                      <Upload size={24} />
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#0f172a',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {logoUploading
                      ? 'Uploading & Optimizing Logo...'
                      : 'Click or Drag to Upload Official Company Logo'}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: '#64748b',
                    }}
                  >
                    Recommended: Transparent SVG or PNG (WebP and JPG also accepted). Maximum file size: 5 MB.
                  </p>
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                    }}
                  >
                    (The website will seamlessly display your uploaded logo, or fall back to the chemical brand mark)
                  </p>
                </div>
              )}
            </div>

            <div className="form-grid-2">
              {/* COMPANY NAME - LOCKED FIELD */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Company Legal Name</label>
                  <span className="field-locked-badge">
                    <Lock size={11} />
                    <span>Locked</span>
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="form-control field-locked"
                  value={formData.companyName}
                  title="Company name is locked and cannot be edited."
                />
                <span className="form-input-help">Registered corporate entity name cannot be altered.</span>
              </div>

              {/* BRAND TAGLINE - EDITABLE */}
              <div className="form-group">
                <label className="form-label">Brand Tagline *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  placeholder="e.g. Innovating Specialty Chemicals"
                />
                <span className="form-input-help">Displayed in the header, footer, and story subtitles.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Homepage Main Headline</label>
              <textarea
                rows={2}
                className="form-control"
                placeholder="Advancing science. Transforming chemical connectivity."
                value={formData.heroHeadline || ''}
                onChange={(e) =>
                  setFormData({ ...formData, heroHeadline: e.target.value })
                }
              />
              <span className="form-input-help">Primary bold headline on the homepage hero banner.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Homepage Hero Description</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Company introductory narrative under the headline..."
                value={formData.heroDescription || ''}
                onChange={(e) =>
                  setFormData({ ...formData, heroDescription: e.target.value })
                }
              />
              <span className="form-input-help">Introductory paragraph beneath the main homepage headline.</span>
            </div>

            <div className="form-divider" />

            {/* Public Contact Team Division */}
            <div className="form-section-block">
              <div className="form-section-header">
                <div>
                  <h4 className="form-section-title">
                    <UserCheck size={16} color="#2563eb" />
                    <span>Public Contact Representatives</span>
                  </h4>
                  <p className="form-section-desc">
                    Active team contacts appear on the public Contact page and footer.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addContact}
                >
                  <Plus size={14} /> Add Contact
                </button>
              </div>

              <div className="settings-contacts-list">
                {formData.contacts.map((contact) => (
                  <div key={contact.id} className="settings-contact-tile">
                    <div className="form-grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label-sub">Name</label>
                        <input
                          className="form-control"
                          placeholder="Contact person name"
                          value={contact.name}
                          onChange={(e) =>
                            updateContact(contact.id, 'name', e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label-sub">Designation / Department</label>
                        <input
                          className="form-control"
                          placeholder="e.g. Technical & Sales Representative"
                          value={contact.title}
                          onChange={(e) =>
                            updateContact(contact.id, 'title', e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label-sub">Phone / WhatsApp</label>
                        <input
                          className="form-control"
                          placeholder="+91 98765 43210"
                          value={contact.phone}
                          onChange={(e) =>
                            updateContact(contact.id, 'phone', e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label-sub">Email Address</label>
                        <input
                          className="form-control"
                          type="email"
                          placeholder="contact@raghavtexchems.com"
                          value={contact.email || ''}
                          onChange={(e) =>
                            updateContact(contact.id, 'email', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="contact-tile-footer">
                      <label className="contact-active-checkbox">
                        <input
                          type="checkbox"
                          checked={contact.active}
                          onChange={(e) =>
                            updateContact(contact.id, 'active', e.target.checked)
                          }
                        />
                        <span>Visible on Public Website</span>
                      </label>

                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        onClick={() => removeContact(contact.id)}
                        title="Remove Contact"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-divider" />

            {/* Official Contact Info & Locked Email */}
            <div className="form-grid-2">
              {/* OFFICIAL EMAIL - LOCKED FIELD */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Official Corporate Email</label>
                  <span className="field-locked-badge">
                    <Lock size={11} />
                    <span>Locked</span>
                  </span>
                </div>
                <input
                  type="email"
                  readOnly
                  disabled
                  className="form-control field-locked"
                  value={formData.email}
                  title="Official corporate email is locked and cannot be edited."
                />
                <span className="form-input-help">Primary root administrative email is locked for security.</span>
              </div>

              {/* FACTORY LOCATION - EDITABLE */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <MapPin size={14} color="#2563eb" />
                  <label className="form-label" style={{ margin: 0 }}>Plant & Operational Location</label>
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Surat, Gujarat, India"
                />
                <span className="form-input-help">Displayed in the public footer and contact section.</span>
              </div>
            </div>

            <div className="form-actions-bar">
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Website Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          TAB 2: HOMEPAGE PUZZLE STATS
          ========================================================= */}
      {activeTab === 'stats' && (
        <div className="admin-settings-section-card">
          <div className="settings-card-header-flex">
            <div>
              <h3 className="settings-section-heading">
                <TrendingUp size={18} color="#2563eb" />
                <span>Homepage Animated Puzzle Stats</span>
              </h3>
              <p className="settings-section-sub">
                These dynamic benchmark tiles render in the animated Bento grid on the homepage in real-time.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={addStat}
            >
              <Plus size={15} /> Add Stat Tile
            </button>
          </div>

          <div className="settings-stats-grid">
            {stats.map((stat, idx) => (
              <div key={stat.id} className="settings-stat-item-box">
                <div className="stat-item-header">
                  <span className="stat-index-badge">Tile #{idx + 1}</span>

                  <div className="stat-icon-preview">
                    {stat.iconType === 'flask' && <FlaskConical size={18} />}
                    {stat.iconType === 'globe' && <Globe size={18} />}
                    {stat.iconType === 'shield' && <ShieldCheck size={18} />}
                    {stat.iconType === 'award' && <Award size={18} />}
                    {stat.iconType === 'users' && <Users size={18} />}
                    {stat.iconType === 'trending' && <TrendingUp size={18} />}
                  </div>

                  <button
                    type="button"
                    className="admin-icon-btn danger"
                    onClick={() => {
                      if (stats.length <= 1) {
                        alert('You must keep at least one stat tile.');
                        return;
                      }
                      deleteStat(stat.id);
                    }}
                    title="Delete Stat Tile"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label-sub">Display Value</label>
                    <input
                      type="text"
                      className="form-control"
                      value={stat.value}
                      onChange={(e) =>
                        handleStatChange(stat.id, 'value', e.target.value)
                      }
                      placeholder="e.g. 50+ / 100% / 15+"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label-sub">Metric Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={stat.label}
                      onChange={(e) =>
                        handleStatChange(stat.id, 'label', e.target.value)
                      }
                      placeholder="e.g. Chemical Formulations"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label-sub">Tile Description</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="Short description for the puzzle card..."
                    value={stat.description || ''}
                    onChange={(e) =>
                      handleStatChange(stat.id, 'description', e.target.value)
                    }
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label-sub">Icon Theme</label>
                  <select
                    className="form-control"
                    value={stat.iconType}
                    onChange={(e) =>
                      handleStatChange(stat.id, 'iconType', e.target.value as any)
                    }
                  >
                    <option value="flask">Flask / Chemistry Formulation</option>
                    <option value="globe">Globe / Export Markets</option>
                    <option value="shield">Shield / Quality & Assurance</option>
                    <option value="award">Award / ISO Certification</option>
                    <option value="users">Users / Client Base</option>
                    <option value="trending">Trending / Growth Rate</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: ABOUT PAGE CONTENT MANAGEMENT
          ========================================================= */}
      {activeTab === 'about' && (
        <div className="admin-settings-section-card">
          <div className="settings-card-header">
            <h3 className="settings-section-heading">
              <BookOpen size={18} color="#2563eb" />
              <span>About Page Story, Video & Milestones</span>
            </h3>
            <p className="settings-section-sub">
              Manage the hero video, company story narrative, mission & vision statements, milestone timeline, and core values.
            </p>
          </div>

          <form onSubmit={handleAboutSubmit} className="settings-form-body">
            {/* Story Video Container */}
            <div className="settings-nested-panel">
              <h4 className="nested-panel-title">
                <Video size={16} color="#2563eb" />
                <span>Story Hero Video</span>
              </h4>

              <div className="form-grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label-sub">Video Source Type</label>
                  <select
                    className="form-control"
                    value={aboutForm.videoType}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        videoType: e.target.value as 'youtube' | 'direct',
                      })
                    }
                  >
                    <option value="youtube">YouTube Video (Embed)</option>
                    <option value="direct">Direct Video URL (MP4 / WebM)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label-sub">Video URL *</label>
                  <input
                    type="url"
                    required
                    className="form-control"
                    placeholder={
                      aboutForm.videoType === 'youtube'
                        ? 'https://www.youtube.com/watch?v=...'
                        : 'https://example.com/story-video.mp4'
                    }
                    value={aboutForm.videoUrl}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, videoUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Live Video Preview Box */}
              {aboutForm.videoUrl && (
                <div className="video-preview-box">
                  <div className="video-preview-header">
                    <Sparkles size={13} color="#2563eb" />
                    <span>Live Video Player Preview</span>
                  </div>
                  <div className="video-preview-frame">
                    {aboutForm.videoType === 'youtube' && youtubePreviewEmbed ? (
                      <iframe
                        src={youtubePreviewEmbed}
                        title="Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : aboutForm.videoType === 'direct' && aboutForm.videoUrl ? (
                      <video src={aboutForm.videoUrl} controls />
                    ) : (
                      <div className="video-preview-error">
                        Enter a valid video URL above to preview.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Story Paragraphs Container */}
            <div className="settings-nested-panel">
              <div className="nested-panel-header-flex">
                <h4 className="nested-panel-title">
                  <BookOpen size={16} color="#2563eb" />
                  <span>Company Story Narrative</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addStoryParagraph}
                >
                  <Plus size={13} /> Add Paragraph
                </button>
              </div>

              <div className="form-group">
                <label className="form-label-sub">Story Section Heading</label>
                <input
                  type="text"
                  className="form-control"
                  value={aboutForm.storyTitle}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, storyTitle: e.target.value })
                  }
                  placeholder="e.g. Our Legacy in Textile Chemistry"
                />
              </div>

              <div className="story-paragraphs-list">
                {aboutForm.storyParagraphs.map((para, idx) => (
                  <div key={idx} className="story-paragraph-item">
                    <div className="story-para-header">
                      <span className="para-index-tag">Paragraph {idx + 1}</span>
                      {aboutForm.storyParagraphs.length > 1 && (
                        <button
                          type="button"
                          className="para-remove-btn"
                          onClick={() => removeStoryParagraph(idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={para}
                      onChange={(e) =>
                        handleStoryParagraphChange(idx, e.target.value)
                      }
                      placeholder="Enter company narrative paragraph..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mission & Vision Container */}
            <div className="settings-nested-panel">
              <h4 className="nested-panel-title">
                <Target size={16} color="#2563eb" />
                <span>Mission & Vision Statements</span>
              </h4>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label-sub">Mission Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={aboutForm.missionTitle}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        missionTitle: e.target.value,
                      })
                    }
                  />
                  <div style={{ marginTop: '0.4rem' }}>
                    <label className="form-label-sub">Mission Statement</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={aboutForm.missionText}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          missionText: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label-sub">Vision Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={aboutForm.visionTitle}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        visionTitle: e.target.value,
                      })
                    }
                  />
                  <div style={{ marginTop: '0.4rem' }}>
                    <label className="form-label-sub">Vision Statement</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={aboutForm.visionText}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          visionText: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Timeline Container */}
            <div className="settings-nested-panel">
              <div className="nested-panel-header-flex">
                <h4 className="nested-panel-title">
                  <Award size={16} color="#2563eb" />
                  <span>Milestones Timeline ({aboutForm.milestones.length})</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addMilestone}
                >
                  <Plus size={13} /> Add Milestone
                </button>
              </div>

              <div className="settings-milestones-list">
                {aboutForm.milestones.map((ms) => (
                  <div key={ms.id} className="settings-milestone-tile">
                    <div className="milestone-input-year">
                      <label className="form-label-sub">Year</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Year"
                        value={ms.year}
                        onChange={(e) =>
                          handleMilestoneChange(ms.id, 'year', e.target.value)
                        }
                      />
                    </div>

                    <div className="milestone-input-title">
                      <label className="form-label-sub">Milestone Event</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Title"
                        value={ms.title}
                        onChange={(e) =>
                          handleMilestoneChange(ms.id, 'title', e.target.value)
                        }
                      />
                    </div>

                    <div className="milestone-input-desc">
                      <label className="form-label-sub">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Description"
                        value={ms.description}
                        onChange={(e) =>
                          handleMilestoneChange(
                            ms.id,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="admin-icon-btn danger milestone-delete-btn"
                      onClick={() => removeMilestone(ms.id)}
                      title="Remove Milestone"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Values Container */}
            <div className="settings-nested-panel">
              <div className="nested-panel-header-flex">
                <h4 className="nested-panel-title">
                  <Heart size={16} color="#2563eb" />
                  <span>Core Values ({aboutForm.coreValues.length})</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addCoreValue}
                >
                  <Plus size={13} /> Add Value
                </button>
              </div>

              <div className="settings-values-list">
                {aboutForm.coreValues.map((val) => (
                  <div key={val.id} className="settings-value-tile">
                    <div className="value-input-icon">
                      <label className="form-label-sub">Icon</label>
                      <select
                        className="form-control"
                        value={val.iconType}
                        onChange={(e) =>
                          handleValueChange(val.id, 'iconType', e.target.value)
                        }
                      >
                        <option value="flask">Flask</option>
                        <option value="globe">Globe</option>
                        <option value="shield">Shield</option>
                        <option value="award">Award</option>
                        <option value="users">Users</option>
                        <option value="trending">Trending</option>
                        <option value="heart">Heart</option>
                        <option value="target">Target</option>
                      </select>
                    </div>

                    <div className="value-input-title">
                      <label className="form-label-sub">Value Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Scientific Rigor"
                        value={val.title}
                        onChange={(e) =>
                          handleValueChange(val.id, 'title', e.target.value)
                        }
                      />
                    </div>

                    <div className="value-input-desc">
                      <label className="form-label-sub">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Description of core value"
                        value={val.description}
                        onChange={(e) =>
                          handleValueChange(
                            val.id,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="admin-icon-btn danger value-delete-btn"
                      onClick={() => removeCoreValue(val.id)}
                      title="Remove Value"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions-bar">
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save About Page Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          TAB 4: STRATEGIC ALLIANCES & TIE-UPS
          ========================================================= */}
      {activeTab === 'collaborations' && (
        <div className="admin-settings-section-card">
          <div className="settings-card-header-flex">
            <div>
              <h3 className="settings-section-heading">
                <Handshake size={18} color="#2563eb" />
                <span>Manufacturing Alliances & Tie-Ups</span>
              </h3>
              <p className="settings-section-sub">
                Add, update, or remove partner companies displayed in the animated pop-out section on the homepage.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddCollab}
            >
              <Plus size={15} /> Add Tie-Up
            </button>
          </div>

          <div className="admin-table-wrapper" style={{ marginTop: '1.25rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Partner Company</th>
                  <th style={{ width: '24%' }}>Manufacturing Segment</th>
                  <th style={{ width: '18%' }}>Location</th>
                  <th style={{ width: '14%' }}>Visibility</th>
                  <th style={{ width: '16%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((collab) => (
                  <tr key={collab.id}>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                        {collab.name}
                      </strong>
                      {collab.badgeText && (
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#1d4ed8',
                            fontWeight: 600,
                            marginTop: '0.15rem',
                          }}
                        >
                          {collab.badgeText}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="product-category-tag">{collab.type}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {collab.location || '—'}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          collab.active ? 'active' : 'inactive'
                        }`}
                        onClick={() => toggleCollaborationActive(collab.id)}
                        title={
                          collab.active ? 'Hide on Homepage' : 'Show on Homepage'
                        }
                      >
                        {collab.active ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{collab.active ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '0.4rem',
                        }}
                      >
                        {collab.websiteUrl && (
                          <a
                            href={collab.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-icon-btn"
                            title="Visit Partner Website"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleOpenEditCollab(collab)}
                          title="Edit Partner"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete partnership with "${collab.name}"?`,
                              )
                            ) {
                              deleteCollaboration(collab.id);
                              showSuccess('Partnership deleted.');
                            }
                          }}
                          title="Delete Partner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collaboration Add/Edit Modal */}
      {isCollabModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsCollabModalOpen(false)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '560px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsCollabModalOpen(false)}
            >
              &times;
            </button>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: '#0f172a',
              }}
            >
              {editingCollab ? 'Edit Company Tie-Up' : 'Add Strategic Alliance'}
            </h3>

            <form onSubmit={handleSaveCollab}>
              <div className="form-group">
                <label className="form-label">Partner / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Textiles Consortium"
                  className="form-control"
                  value={collabForm.name}
                  onChange={(e) =>
                    setCollabForm({ ...collabForm, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vertical / Manufacturing Type *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Textile Sizing & Finishing Supply"
                  className="form-control"
                  value={collabForm.type}
                  onChange={(e) =>
                    setCollabForm({ ...collabForm, type: e.target.value })
                  }
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Location / Operational Hub</label>
                  <input
                    type="text"
                    placeholder="e.g. Surat, India"
                    className="form-control"
                    value={collabForm.location}
                    onChange={(e) =>
                      setCollabForm({ ...collabForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Badge Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Strategic Dyestuff Partner"
                    className="form-control"
                    value={collabForm.badgeText}
                    onChange={(e) =>
                      setCollabForm({
                        ...collabForm,
                        badgeText: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Website URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="form-control"
                  value={collabForm.websiteUrl}
                  onChange={(e) =>
                    setCollabForm({
                      ...collabForm,
                      websiteUrl: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={collabForm.active}
                    onChange={(e) =>
                      setCollabForm({ ...collabForm, active: e.target.checked })
                    }
                  />
                  <span>Show on Homepage Pop-Out Section</span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCollabModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
