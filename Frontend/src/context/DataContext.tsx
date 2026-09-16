import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Product,
  Inquiry,
  CompanySettings,
  StatItem,
  Collaboration,
  AboutContent,
  Announcement,
  Certification,
  Category,
} from '../types';
import { supabase, isBackendConfigured } from '../lib/supabase';
import { logAdminAction } from '../lib/audit';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_INQUIRIES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_STATS,
  INITIAL_COLLABORATIONS,
  INITIAL_ABOUT_CONTENT,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CERTIFICATIONS,
} from '../data/initialData';

interface DataContextType {
  products: Product[];
  categories: Category[];
  inquiries: Inquiry[];
  companySettings: CompanySettings;
  stats: StatItem[];
  collaborations: Collaboration[];
  aboutContent: AboutContent;
  announcements: Announcement[];
  certifications: Certification[];
  loading: boolean;
  error: string | null;
  isBackendConnected: boolean;
  refreshData: () => Promise<void>;

  // Product Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Inquiry & RFQ Operations
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  // Announcements / Circulars Operations
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'publishedAt'>) => Promise<void>;
  updateAnnouncement: (ann: Announcement) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Settings & Content Operations
  updateCompanySettings: (settings: CompanySettings) => Promise<void>;
  updateStat: (id: string, updated: Partial<StatItem>) => Promise<void>;
  addStat: () => Promise<void>;
  deleteStat: (id: string) => Promise<void>;
  setAllStats: (newStats: StatItem[]) => Promise<void>;

  addCollaboration: (collab: Omit<Collaboration, 'id'>) => Promise<void>;
  updateCollaboration: (collab: Collaboration) => Promise<void>;
  deleteCollaboration: (id: string) => Promise<void>;
  toggleCollaborationActive: (id: string) => Promise<void>;

  updateAboutContent: (content: AboutContent) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to map DB row to Product interface
function mapDbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    category: row.category,
    categoryId: row.category_id || '',
    description: row.description,
    imageUrl: row.image_url || '',
    imagePath: row.image_path || '',
    tdsUrl: row.tds_url || '',
    sdsUrl: row.sds_url || '',
    appearance: row.appearance || '',
    ph: row.ph || '',
    activeContent: row.active_content || '',
    viscosity: row.viscosity || '',
    ionicNature: row.ionic_nature || 'Non-Ionic',
    solubility: row.solubility || 'Easily soluble in water',
    shelfLife: row.shelf_life || '12 Months in sealed container',
    applications: Array.isArray(row.applications) ? row.applications : [],
    packaging: Array.isArray(row.packaging) ? row.packaging : ['50 Kg Carboys', '200 Kg HDPE Drums'],
    featured: Boolean(row.featured),
    active: row.active !== false,
    stockStatus: row.stock_status || 'In Stock',
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
  };
}

// Helper to map Product to DB row
function mapProductToDb(p: Partial<Product>) {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    category: p.category,
    category_id: p.categoryId,
    description: p.description,
    image_url: p.imageUrl,
    image_path: p.imagePath,
    tds_url: p.tdsUrl,
    sds_url: p.sdsUrl,
    appearance: p.appearance || '',
    ph: p.ph || '',
    active_content: p.activeContent || '',
    viscosity: p.viscosity || '',
    ionic_nature: p.ionicNature || 'Non-Ionic',
    solubility: p.solubility || '',
    shelf_life: p.shelfLife || '',
    applications: p.applications || [],
    packaging: p.packaging || ['50 Kg Carboys', '200 Kg HDPE Drums'],
    featured: p.featured ?? false,
    active: p.active ?? true,
    stock_status: p.stockStatus || 'In Stock',
    sort_order: p.sortOrder || 0,
    updated_at: new Date().toISOString(),
  };
}

// Helper to map DB row to Inquiry interface
function mapDbToInquiry(row: any): Inquiry {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    companyName: row.company_name || '',
    productCategory: row.product_category,
    productId: row.product_id || '',
    inquiryType: row.inquiry_type || 'RFQ',
    estimatedVolume: row.estimated_volume || '',
    destinationCity: row.destination_city || '',
    message: row.message,
    status: row.status || 'New',
    date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    assignedTo: row.assigned_to || '',
    adminNotes: row.admin_notes || '',
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);
  const [stats, setStats] = useState<StatItem[]>(INITIAL_STATS);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(INITIAL_COLLABORATIONS);
  const [aboutContent, setAboutContent] = useState<AboutContent>(INITIAL_ABOUT_CONTENT);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [certifications, setCertifications] = useState<Certification[]>(INITIAL_CERTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Fetch all live data from Supabase
  const fetchData = useCallback(async () => {
    if (!isBackendConfigured) {
      setLoading(false);
      return;
    }

    try {
      // 1. Products
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!prodErr && productsData && productsData.length > 0) {
        setProducts(productsData.map(mapDbToProduct));
        setIsBackendConnected(true);
      }

      // 2. Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!catErr && catData && catData.length > 0) {
        setCategories(
          catData.map((c: any) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            hindiTitle: c.hindi_title,
            description: c.description,
            iconName: c.icon_name,
            sortOrder: c.sort_order,
            active: c.active !== false,
          }))
        );
        setIsBackendConnected(true);
      }

      // 3. Announcements
      const { data: annData, error: annErr } = await supabase
        .from('announcements')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false });

      if (!annErr && annData && annData.length > 0) {
        setAnnouncements(
          annData.map((a: any) => ({
            id: a.id,
            title: a.title,
            category: a.category,
            content: a.content,
            linkUrl: a.link_url,
            badgeText: a.badge_text,
            isPinned: Boolean(a.is_pinned),
            active: a.active !== false,
            sortOrder: a.sort_order,
            publishedAt: a.published_at,
          }))
        );
      }

      // 4. Inquiries
      const { data: inqData, error: inqErr } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!inqErr && inqData) {
        setInquiries(inqData.map(mapDbToInquiry));
      }

      // 5. Company Settings
      const { data: settingsData, error: setErr } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!setErr && settingsData) {
        setCompanySettings({
          companyName: settingsData.company_name,
          hindiName: settingsData.hindi_name,
          cinNumber: settingsData.cin_number,
          gstinNumber: settingsData.gstin_number,
          tagline: settingsData.tagline,
          heroHeadline: settingsData.hero_headline,
          heroDescription: settingsData.hero_description,
          contact1Name: settingsData.contact1_name || '',
          contact1Title: settingsData.contact1_title || 'Director / Technical Sales',
          contact1Phone: settingsData.contact1_phone || '',
          contact2Name: settingsData.contact2_name || '',
          contact2Title: settingsData.contact2_title || 'Director / Operations & Supply Chain',
          contact2Phone: settingsData.contact2_phone || '',
          email: settingsData.email,
          secondaryEmail: settingsData.secondary_email || '',
          address: settingsData.address,
          plantLocation: settingsData.plant_location || '',
          operatingHours: settingsData.operating_hours || '',
          contacts: Array.isArray(settingsData.contacts) && settingsData.contacts.length > 0
            ? settingsData.contacts
            : INITIAL_COMPANY_SETTINGS.contacts,
          logoUrl: settingsData.logo_url || '',
          logoPath: settingsData.logo_path || '',
        });
      }

      // 6. Certifications
      const { data: certData, error: certErr } = await supabase
        .from('certifications')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!certErr && certData && certData.length > 0) {
        setCertifications(
          certData.map((c: any) => ({
            id: c.id,
            title: c.title,
            issuingBody: c.issuing_body,
            certificateNumber: c.certificate_number,
            validUntil: c.valid_until,
            description: c.description,
            badgeUrl: c.badge_url,
            active: c.active !== false,
            sortOrder: c.sort_order,
          }))
        );
      }

      // 7. Stats
      const { data: statsData, error: statsErr } = await supabase
        .from('stats')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!statsErr && statsData && statsData.length > 0) {
        setStats(
          statsData.map((s: any) => ({
            id: s.id,
            value: s.value,
            label: s.label,
            description: s.description,
            iconType: s.icon_type,
            sortOrder: s.sort_order,
            active: s.active !== false,
          }))
        );
      }

      // 8. About Content
      const { data: aboutData, error: aboutErr } = await supabase
        .from('about_content')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!aboutErr && aboutData) {
        setAboutContent({
          videoUrl: aboutData.video_url || '',
          videoType: aboutData.video_type || 'youtube',
          storyTitle: aboutData.story_title || '',
          storyParagraphs: Array.isArray(aboutData.story_paragraphs) ? aboutData.story_paragraphs : [],
          missionTitle: aboutData.mission_title || '',
          missionText: aboutData.mission_text || '',
          visionTitle: aboutData.vision_title || '',
          visionText: aboutData.vision_text || '',
          milestones: Array.isArray(aboutData.milestones) ? aboutData.milestones : [],
          coreValues: Array.isArray(aboutData.core_values) ? aboutData.core_values : [],
        });
      }
    } catch (err: any) {
      console.warn('Backend graceful fallback active:', err?.message || err);
      setError(err?.message || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (!isBackendConfigured) return;

    try {
      const channel = supabase
        .channel('live-db-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'company_settings' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stats' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'certifications' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'about_content' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel subscription notice:', err);
    }
  }, [fetchData]);

  // PRODUCT OPERATIONS
  const addProduct = async (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const newId = `prod-${Date.now()}`;
    const createdDate = new Date().toISOString().split('T')[0];
    const fullProduct: Product = {
      ...newProd,
      id: newId,
      createdAt: createdDate,
    };

    setProducts((prev) => [fullProduct, ...prev]);

    try {
      const dbRow = {
        ...mapProductToDb(fullProduct),
        created_at: new Date().toISOString(),
      };
      const { error: insertErr } = await supabase.from('products').insert([dbRow]);
      if (insertErr) {
        console.warn('Insert product fallback active:', insertErr.message);
      } else {
        await logAdminAction('CREATE_PRODUCT', fullProduct.code, {
          id: newId,
          name: fullProduct.name,
          category: fullProduct.category,
        });
      }
    } catch (err) {
      console.warn('Add product notice:', err);
    }
  };

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    try {
      const dbRow = mapProductToDb(updated);
      const { error: updateErr } = await supabase
        .from('products')
        .update(dbRow)
        .eq('id', updated.id);

      if (updateErr) {
        console.warn('Update product fallback active:', updateErr.message);
      } else {
        await logAdminAction('UPDATE_PRODUCT', updated.code, {
          id: updated.id,
          name: updated.name,
        });
      }
    } catch (err) {
      console.warn('Update product notice:', err);
    }
  };

  const toggleProductActive = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const newStatus = target.active === false;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: newStatus } : p))
    );

    try {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateErr) {
        console.warn('Toggle active fallback active:', updateErr.message);
      } else {
        await logAdminAction(
          newStatus ? 'ENABLE_PRODUCT' : 'DISABLE_PRODUCT',
          target.code,
          { id, newStatus }
        );
      }
    } catch (err) {
      console.warn('Toggle active notice:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteErr) {
        console.warn('Delete product fallback active:', deleteErr.message);
      } else if (target) {
        await logAdminAction('DELETE_PRODUCT', target.code, {
          id,
          name: target.name,
        });
      }
    } catch (err) {
      console.warn('Delete product notice:', err);
    }
  };

  // INQUIRY & RFQ OPERATIONS
  const addInquiry = async (
    inq: Omit<Inquiry, 'id' | 'date' | 'status'>
  ): Promise<{ success: boolean; error?: string }> => {
    const newId = `inq-${Date.now().toString().slice(-4)}`;
    const newInquiry: Inquiry = {
      ...inq,
      id: newId,
      status: 'New',
      date: new Date().toISOString().split('T')[0],
    };

    setInquiries((prev) => [newInquiry, ...prev]);

    try {
      const { error: inqErr } = await supabase.from('inquiries').insert([
        {
          id: newId,
          customer_name: inq.customerName.trim(),
          phone: inq.phone.trim(),
          email: inq.email.trim(),
          company_name: inq.companyName?.trim() || '',
          product_category: inq.productCategory.trim(),
          product_id: inq.productId || null,
          inquiry_type: inq.inquiryType || 'RFQ',
          estimated_volume: inq.estimatedVolume || '',
          destination_city: inq.destinationCity || '',
          message: inq.message.trim(),
          status: 'New',
          assigned_to: inq.assignedTo?.trim() || '',
          created_at: new Date().toISOString(),
        },
      ]);

      if (inqErr) {
        console.warn('Supabase inquiry insert note:', inqErr.message);
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Add inquiry notice:', err);
      return { success: true };
    }
  };

  const updateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );

    try {
      await supabase
        .from('inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      await logAdminAction('UPDATE_INQUIRY_STATUS', id, { status });
    } catch (err) {
      console.warn('Update inquiry status notice:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));

    try {
      await supabase.from('inquiries').delete().eq('id', id);
      await logAdminAction('DELETE_INQUIRY', id);
    } catch (err) {
      console.warn('Delete inquiry notice:', err);
    }
  };

  // ANNOUNCEMENTS OPERATIONS
  const addAnnouncement = async (ann: Omit<Announcement, 'id' | 'publishedAt'>) => {
    const newId = `ann-${Date.now()}`;
    const publishedAt = new Date().toISOString().split('T')[0];
    const fullAnn: Announcement = { ...ann, id: newId, publishedAt };

    setAnnouncements((prev) => [fullAnn, ...prev]);

    try {
      await supabase.from('announcements').insert([{
        id: newId,
        title: ann.title,
        category: ann.category,
        content: ann.content,
        link_url: ann.linkUrl || '',
        badge_text: ann.badgeText || 'NEW',
        is_pinned: Boolean(ann.isPinned),
        active: ann.active !== false,
        sort_order: ann.sortOrder || 0,
        published_at: publishedAt,
      }]);
    } catch (err) {
      console.warn('Add announcement notice:', err);
    }
  };

  const updateAnnouncement = async (ann: Announcement) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === ann.id ? ann : a)));

    try {
      await supabase.from('announcements').update({
        title: ann.title,
        category: ann.category,
        content: ann.content,
        link_url: ann.linkUrl || '',
        badge_text: ann.badgeText || 'NEW',
        is_pinned: ann.isPinned,
        active: ann.active,
        sort_order: ann.sortOrder,
        updated_at: new Date().toISOString(),
      }).eq('id', ann.id);
    } catch (err) {
      console.warn('Update announcement notice:', err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    try {
      await supabase.from('announcements').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete announcement notice:', err);
    }
  };

  // SETTINGS & METRICS OPERATIONS
  const updateCompanySettings = async (settings: CompanySettings) => {
    setCompanySettings(settings);

    try {
      await supabase
        .from('company_settings')
        .update({
          company_name: settings.companyName,
          hindi_name: settings.hindiName,
          cin_number: settings.cinNumber,
          gstin_number: settings.gstinNumber,
          tagline: settings.tagline,
          hero_headline: settings.heroHeadline,
          hero_description: settings.heroDescription,
          contact1_name: settings.contact1Name,
          contact1_title: settings.contact1Title,
          contact1_phone: settings.contact1Phone,
          contact2_name: settings.contact2Name,
          contact2_title: settings.contact2Title,
          contact2_phone: settings.contact2Phone,
          email: settings.email,
          secondary_email: settings.secondaryEmail,
          address: settings.address,
          plant_location: settings.plantLocation,
          operating_hours: settings.operatingHours,
          contacts: settings.contacts,
          logo_url: settings.logoUrl || null,
          logo_path: settings.logoPath || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'primary');

      await logAdminAction('UPDATE_SETTINGS', 'company_settings');
    } catch (err) {
      console.warn('Update company settings notice:', err);
    }
  };

  const updateStat = async (id: string, updated: Partial<StatItem>) => {
    setStats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );

    try {
      await supabase
        .from('stats')
        .update({
          value: updated.value,
          label: updated.label,
          description: updated.description,
          icon_type: updated.iconType,
          sort_order: updated.sortOrder,
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Update stat notice:', err);
    }
  };

  const addStat = async () => {
    const newId = `stat-${Date.now()}`;
    const newStat: StatItem = {
      id: newId,
      value: '100+',
      label: 'New Metric',
      description: 'Metric description',
      iconType: 'sparkles' as any,
      sortOrder: stats.length + 1,
      active: true,
    };

    setStats((prev) => [...prev, newStat]);

    try {
      await supabase.from('stats').insert([
        {
          id: newId,
          value: newStat.value,
          label: newStat.label,
          description: newStat.description,
          icon_type: newStat.iconType,
          sort_order: newStat.sortOrder,
        },
      ]);
    } catch (err) {
      console.warn('Add stat notice:', err);
    }
  };

  const deleteStat = async (id: string) => {
    setStats((prev) => prev.filter((s) => s.id !== id));

    try {
      await supabase.from('stats').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete stat notice:', err);
    }
  };

  const setAllStats = async (newStats: StatItem[]) => {
    setStats(newStats);
  };

  const addCollaboration = async (collab: Omit<Collaboration, 'id'>) => {
    const newId = `collab-${Date.now()}`;
    const fullCollab: Collaboration = { ...collab, id: newId };
    setCollaborations((prev) => [...prev, fullCollab]);

    try {
      await supabase.from('collaborations').insert([{
        id: newId,
        name: collab.name,
        type: collab.type,
        location: collab.location,
        badge_text: collab.badgeText || '',
        website_url: collab.websiteUrl || '',
        active: collab.active,
      }]);
    } catch (err) {
      console.warn('Add collab notice:', err);
    }
  };

  const updateCollaboration = async (collab: Collaboration) => {
    setCollaborations((prev) => prev.map((c) => (c.id === collab.id ? collab : c)));

    try {
      await supabase.from('collaborations').update({
        name: collab.name,
        type: collab.type,
        location: collab.location,
        badge_text: collab.badgeText || '',
        website_url: collab.websiteUrl || '',
        active: collab.active,
      }).eq('id', collab.id);
    } catch (err) {
      console.warn('Update collab notice:', err);
    }
  };

  const deleteCollaboration = async (id: string) => {
    setCollaborations((prev) => prev.filter((c) => c.id !== id));

    try {
      await supabase.from('collaborations').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete collab notice:', err);
    }
  };

  const toggleCollaborationActive = async (id: string) => {
    const target = collaborations.find((c) => c.id === id);
    if (!target) return;
    const newActive = !target.active;

    setCollaborations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: newActive } : c))
    );

    try {
      await supabase.from('collaborations').update({ active: newActive }).eq('id', id);
    } catch (err) {
      console.warn('Toggle collab notice:', err);
    }
  };

  const updateAboutContent = async (content: AboutContent) => {
    setAboutContent(content);

    try {
      await supabase.from('about_content').update({
        video_url: content.videoUrl,
        video_type: content.videoType,
        story_title: content.storyTitle,
        story_paragraphs: content.storyParagraphs,
        mission_title: content.missionTitle,
        mission_text: content.missionText,
        vision_title: content.visionTitle,
        vision_text: content.visionText,
        milestones: content.milestones,
        core_values: content.coreValues,
        updated_at: new Date().toISOString(),
      }).eq('id', 'primary');

      await logAdminAction('UPDATE_ABOUT_CONTENT', 'about_content');
    } catch (err) {
      console.warn('Update about content notice:', err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        inquiries,
        companySettings,
        stats,
        collaborations,
        aboutContent,
        announcements,
        certifications,
        loading,
        error,
        isBackendConnected,
        refreshData: fetchData,

        addProduct,
        updateProduct,
        toggleProductActive,
        deleteProduct,

        addInquiry,
        updateInquiryStatus,
        deleteInquiry,

        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,

        updateCompanySettings,
        updateStat,
        addStat,
        deleteStat,
        setAllStats,

        addCollaboration,
        updateCollaboration,
        deleteCollaboration,
        toggleCollaborationActive,

        updateAboutContent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
