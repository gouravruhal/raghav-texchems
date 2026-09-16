export interface Product {
  id: string;

  name: string;
  code: string;
  category: string;

  description: string;

  // Product media
  imageUrl?: string;
  imagePath?: string;

  // Chemical specifications
  appearance: string;
  ph: string;
  activeContent: string;
  viscosity: string;

  // Product applications
  applications: string[];

  // Website/catalog controls
  featured?: boolean;
  active?: boolean;

  stockStatus?: 'In Stock' | 'Custom Order' | 'High Demand';

  createdAt?: string;
}

export interface Inquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  companyName: string;
  productCategory: string;
  message: string;
  status: 'New' | 'In Progress' | 'Quotation Sent' | 'Closed';
  date: string;
  assignedTo: string;
}

export interface User {
  username: string;
  role: 'Admin' | 'Manager';
  name: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  heroHeadline?: string;
  heroDescription?: string;
  contact1Name: string;
  contact1Phone: string;
  contact2Name: string;
  contact2Phone: string;
  email: string;
  address: string;
  contacts: CompanyContact[];
  logoUrl?: string;
  logoPath?: string;
}

export interface CompanyContact {
  id: string;
  name: string;
  title: string;
  phone: string;
  email?: string;
  active: boolean;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  description?: string;
  iconType:
    | 'flask'
    | 'globe'
    | 'shield'
    | 'award'
    | 'users'
    | 'trending';
}

export interface Collaboration {
  id: string;
  name: string;
  type: string;
  location: string;
  badgeText?: string;
  websiteUrl?: string;
  active: boolean;
}

export interface AboutMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
  iconType:
    | 'flask'
    | 'globe'
    | 'shield'
    | 'award'
    | 'users'
    | 'trending'
    | 'heart'
    | 'target';
}

export interface AboutContent {
  videoUrl: string;
  videoType: 'youtube' | 'direct';

  storyTitle: string;
  storyParagraphs: string[];

  missionTitle: string;
  missionText: string;

  visionTitle: string;
  visionText: string;

  milestones: AboutMilestone[];

  coreValues: AboutValue[];
}

export interface AdminAuditLog {
  id: string;
  adminId: string | null;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}