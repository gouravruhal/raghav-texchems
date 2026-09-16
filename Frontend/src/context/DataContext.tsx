import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Product,
  Inquiry,
  CompanySettings,
  StatItem,
  Collaboration,
  AboutContent,
} from '../types';
import { supabase } from '../lib/supabase';
import { logAdminAction } from '../lib/audit';
import {
  INITIAL_PRODUCTS,
  INITIAL_INQUIRIES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_STATS,
  INITIAL_COLLABORATIONS,
  INITIAL_ABOUT_CONTENT,
} from '../data/initialData';

interface DataContextType {
  products: Product[];
  inquiries: Inquiry[];
  companySettings: CompanySettings;
  stats: StatItem[];
  collaborations: Collaboration[];
  aboutContent: AboutContent;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  
  // Product Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Inquiry Operations
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  
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
    description: row.description,
    imageUrl: row.image_url || '',
    imagePath: row.image_path || '',
    appearance: row.appearance || '',
    ph: row.ph || '',
    activeContent: row.active_content || '',
    viscosity: row.viscosity || '',
    applications: Array.isArray(row.applications) ? row.applications : [],
    featured: Boolean(row.featured),
    active: row.active !== false,
    stockStatus: row.stock_status || 'In Stock',
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
    description: p.description,
    image_url: p.imageUrl,
    image_path: p.imagePath,
    appearance: p.appearance || '',
    ph: p.ph || '',
    active_content: p.activeContent || '',
    viscosity: p.viscosity || '',
    applications: p.applications || [],
    featured: p.featured ?? false,
    active: p.active ?? true,
    stock_status: p.stockStatus || 'In Stock',
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
    message: row.message,
    status: row.status || 'New',
    date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    assignedTo: row.assigned_to || '',
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);
  const [stats, setStats] = useState<StatItem[]>(INITIAL_STATS);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(INITIAL_COLLABORATIONS);
  const [aboutContent, setAboutContent] = useState<AboutContent>(INITIAL_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all live data from Supabase
  const fetchData = useCallback(async () => {
    try {
      // 1. Products
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && productsData) {
        setProducts(productsData.map(mapDbToProduct));
      }

      // 2. Inquiries (Admins only will receive rows due to RLS)
      const { data: inqData, error: inqErr } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!inqErr && inqData) {
        setInquiries(inqData.map(mapDbToInquiry));
      }

      // 3. Company Settings
      const { data: settingsData, error: setErr } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!setErr && settingsData) {
        setCompanySettings({
          companyName: settingsData.company_name,
          tagline: settingsData.tagline,
          heroHeadline: settingsData.hero_headline,
          heroDescription: settingsData.hero_description,
          contact1Name: settingsData.contact1_name || '',
          contact1Phone: settingsData.contact1_phone || '',
          contact2Name: settingsData.contact2_name || '',
          contact2Phone: settingsData.contact2_phone || '',
          email: settingsData.email,
          address: settingsData.address,
          contacts: Array.isArray(settingsData.contacts) ? settingsData.contacts : INITIAL_COMPANY_SETTINGS.contacts,
          logoUrl: settingsData.logo_url || '',
          logoPath: settingsData.logo_path || '',
        });
      }

      // 4. Stats
      const { data: statsData, error: statsErr } = await supabase
        .from('stats')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!statsErr && statsData) {
        setStats(
          statsData.map((s: any) => ({
            id: s.id,
            value: s.value,
            label: s.label,
            description: s.description,
            iconType: s.icon_type,
          }))
        );
      }

      // 5. Collaborations
      const { data: collabData, error: collabErr } = await supabase
        .from('collaborations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!collabErr && collabData) {
        setCollaborations(
          collabData.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            location: c.location,
            badgeText: c.badge_text,
            websiteUrl: c.website_url,
            active: c.active !== false,
          }))
        );
      }

      // 6. About Content
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
      console.warn('Backend fetch notice:', err.message || err);
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Supabase Realtime WebSocket subscription for instant live updating
    const channel = supabase
      .channel('live-db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_settings' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stats' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collaborations' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'about_content' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // ==========================================
  // PRODUCT OPERATIONS
  // ==========================================

  const addProduct = async (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const newId = `prod-${Date.now()}`;
    const createdDate = new Date().toISOString().split('T')[0];
    const fullProduct: Product = {
      ...newProd,
      id: newId,
      createdAt: createdDate,
    };

    // Optimistic UI
    setProducts((prev) => [fullProduct, ...prev]);

    try {
      const dbRow = {
        ...mapProductToDb(fullProduct),
        created_at: new Date().toISOString(),
      };
      const { error: insertErr } = await supabase.from('products').insert([dbRow]);
      if (insertErr) {
        console.error('Failed to insert product in Supabase:', insertErr);
      } else {
        await logAdminAction('CREATE_PRODUCT', fullProduct.code, {
          id: newId,
          name: fullProduct.name,
          category: fullProduct.category,
        });
      }
    } catch (err) {
      console.error('Add product exception:', err);
    }
  };

  const updateProduct = async (updated: Product) => {
    // Optimistic UI
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    try {
      const dbRow = mapProductToDb(updated);
      const { error: updateErr } = await supabase
        .from('products')
        .update(dbRow)
        .eq('id', updated.id);

      if (updateErr) {
        console.error('Failed to update product in Supabase:', updateErr);
      } else {
        await logAdminAction('UPDATE_PRODUCT', updated.code, {
          id: updated.id,
          name: updated.name,
        });
      }
    } catch (err) {
      console.error('Update product exception:', err);
    }
  };

  const toggleProductActive = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const newStatus = target.active === false;

    // Optimistic UI
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: newStatus } : p))
    );

    try {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateErr) {
        console.error('Failed to toggle product status:', updateErr);
      } else {
        await logAdminAction(
          newStatus ? 'ENABLE_PRODUCT' : 'DISABLE_PRODUCT',
          target.code,
          { id, newStatus }
        );
      }
    } catch (err) {
      console.error('Toggle active exception:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);

    // Optimistic UI
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteErr) {
        console.error('Failed to delete product in Supabase:', deleteErr);
      } else if (target) {
        await logAdminAction('DELETE_PRODUCT', target.code, {
          id,
          name: target.name,
        });
      }
    } catch (err) {
      console.error('Delete product exception:', err);
    }
  };

  // ==========================================
  // INQUIRY OPERATIONS
  // ==========================================

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

    // Optimistic UI
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
          message: inq.message.trim(),
          status: 'New',
          assigned_to: inq.assignedTo?.trim() || '',
          created_at: new Date().toISOString(),
        },
      ]);

      if (inqErr) {
        console.error('Supabase inquiry insert error:', inqErr);
        return { success: false, error: inqErr.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Add inquiry exception:', err);
      return { success: false, error: err.message || 'Submission failed.' };
    }
  };

  const updateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    // Optimistic UI
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );

    try {
      const { error: inqErr } = await supabase
        .from('inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (inqErr) {
        console.error('Failed to update inquiry status:', inqErr);
      } else {
        await logAdminAction('UPDATE_INQUIRY_STATUS', id, { status });
      }
    } catch (err) {
      console.error('Update inquiry status exception:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    // Optimistic UI
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));

    try {
      const { error: inqErr } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (inqErr) {
        console.error('Failed to delete inquiry:', inqErr);
      } else {
        await logAdminAction('DELETE_INQUIRY', id);
      }
    } catch (err) {
      console.error('Delete inquiry exception:', err);
    }
  };

  // ==========================================
  // COMPANY SETTINGS & CONTENT OPERATIONS
  // ==========================================

  const updateCompanySettings = async (settings: CompanySettings) => {
    // Optimistic UI
    setCompanySettings(settings);

    try {
      const { error: setErr } = await supabase.from('company_settings').upsert({
        id: 'primary',
        company_name: settings.companyName,
        tagline: settings.tagline,
        hero_headline: settings.heroHeadline,
        hero_description: settings.heroDescription,
        contact1_name: settings.contact1Name,
        contact1_phone: settings.contact1Phone,
        contact2_name: settings.contact2Name,
        contact2_phone: settings.contact2Phone,
        email: settings.email,
        address: settings.address,
        contacts: settings.contacts,
        logo_url: settings.logoUrl || null,
        logo_path: settings.logoPath || null,
        updated_at: new Date().toISOString(),
      });

      if (setErr) {
        console.error('Failed to update company settings in Supabase:', setErr);
      } else {
        await logAdminAction('UPDATE_SETTINGS', 'company_settings');
      }
    } catch (err) {
      console.error('Update settings exception:', err);
    }
  };

  const updateStat = async (id: string, updated: Partial<StatItem>) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));

    try {
      const target = stats.find((s) => s.id === id);
      const merged = { ...target, ...updated };
      await supabase.from('stats').upsert({
        id,
        value: merged.value,
        label: merged.label,
        description: merged.description || '',
        icon_type: merged.iconType,
      });
      await logAdminAction('UPDATE_STAT', id);
    } catch (err) {
      console.error('Update stat exception:', err);
    }
  };

  const addStat = async () => {
    const newId = `stat-${Date.now()}`;
    const newStat: StatItem = {
      id: newId,
      value: '0',
      label: 'New Metric',
      description: 'Add a short description for this homepage metric.',
      iconType: 'trending',
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
          sort_order: stats.length + 1,
        },
      ]);
      await logAdminAction('CREATE_STAT', newId);
    } catch (err) {
      console.error('Add stat exception:', err);
    }
  };

  const deleteStat = async (id: string) => {
    setStats((prev) => prev.filter((stat) => stat.id !== id));

    try {
      await supabase.from('stats').delete().eq('id', id);
      await logAdminAction('DELETE_STAT', id);
    } catch (err) {
      console.error('Delete stat exception:', err);
    }
  };

  const setAllStats = async (newStats: StatItem[]) => {
    setStats(newStats);
  };

  const addCollaboration = async (collab: Omit<Collaboration, 'id'>) => {
    const newId = `collab-${Date.now()}`;
    const newCollab: Collaboration = {
      ...collab,
      id: newId,
    };

    setCollaborations((prev) => [...prev, newCollab]);

    try {
      await supabase.from('collaborations').insert([
        {
          id: newId,
          name: collab.name,
          type: collab.type,
          location: collab.location,
          badge_text: collab.badgeText || '',
          website_url: collab.websiteUrl || '',
          active: collab.active !== false,
          sort_order: collaborations.length + 1,
        },
      ]);
      await logAdminAction('CREATE_COLLABORATION', newId, { name: collab.name });
    } catch (err) {
      console.error('Add collaboration exception:', err);
    }
  };

  const updateCollaboration = async (collab: Collaboration) => {
    setCollaborations((prev) =>
      prev.map((c) => (c.id === collab.id ? collab : c))
    );

    try {
      await supabase
        .from('collaborations')
        .update({
          name: collab.name,
          type: collab.type,
          location: collab.location,
          badge_text: collab.badgeText || '',
          website_url: collab.websiteUrl || '',
          active: collab.active !== false,
        })
        .eq('id', collab.id);
      await logAdminAction('UPDATE_COLLABORATION', collab.id, { name: collab.name });
    } catch (err) {
      console.error('Update collaboration exception:', err);
    }
  };

  const deleteCollaboration = async (id: string) => {
    setCollaborations((prev) => prev.filter((c) => c.id !== id));

    try {
      await supabase.from('collaborations').delete().eq('id', id);
      await logAdminAction('DELETE_COLLABORATION', id);
    } catch (err) {
      console.error('Delete collaboration exception:', err);
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
      await supabase
        .from('collaborations')
        .update({ active: newActive })
        .eq('id', id);
      await logAdminAction('TOGGLE_COLLABORATION', id, { active: newActive });
    } catch (err) {
      console.error('Toggle collaboration exception:', err);
    }
  };

  const updateAboutContent = async (content: AboutContent) => {
    setAboutContent(content);

    try {
      await supabase.from('about_content').upsert({
        id: 'primary',
        video_url: content.videoUrl,
        video_type: content.videoType,
        story_title: content.storyTitle,
        story_paragraphs: content.storyParagraphs,
        mission_title: content.missionTitle,
        mission_text: content.missionText,
        vision_title: content.visionTitle,
        vision_text: content.visionText,
        milestones: content.milestones,
        coreValues: content.coreValues,
        updated_at: new Date().toISOString(),
      });
      await logAdminAction('UPDATE_ABOUT_CONTENT', 'about_content');
    } catch (err) {
      console.error('Update about content exception:', err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        inquiries,
        companySettings,
        stats,
        collaborations,
        aboutContent,
        loading,
        error,
        refreshData: fetchData,
        addProduct,
        updateProduct,
        toggleProductActive,
        deleteProduct,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
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
