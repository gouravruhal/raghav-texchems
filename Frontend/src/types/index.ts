export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryId?: string;
  description: string;

  // Product media & Technical documents
  imageUrl?: string;
  imagePath?: string;
  tdsUrl?: string;
  sdsUrl?: string;

  // Chemical specifications
  appearance: string;
  ph: string;
  activeContent: string;
  viscosity: string;
  ionicNature?: string;
  solubility?: string;
  shelfLife?: string;

  // Product applications & packaging
  applications: string[];
  packaging?: string[];

  // Website/catalog controls
  featured?: boolean;
  active?: boolean;
  stockStatus?: 'In Stock' | 'Custom Order' | 'High Demand' | 'Available for Tender';
  sortOrder?: number;
  createdAt?: string;
}

export interface Inquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  companyName: string;
  productCategory: string;
  productId?: string;
  inquiryType?: 'RFQ' | 'General' | 'Sample Request' | 'Tender Bid' | 'Technical Support';
  estimatedVolume?: string;
  destinationCity?: string;
  message: string;
  status: 'New' | 'Under Evaluation' | 'Quotation Sent' | 'Sample Dispatched' | 'Closed' | 'In Progress';
  date: string;
  assignedTo?: string;
  adminNotes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Circular' | 'Notice' | 'Technical Bulletin' | 'Gazette' | 'Quality Alert';
  content: string;
  linkUrl?: string;
  badgeText?: string;
  isPinned?: boolean;
  active: boolean;
  sortOrder?: number;
  publishedAt: string;
}

export interface Certification {
  id: string;
  title: string;
  issuingBody: string;
  certificateNumber?: string;
  validUntil?: string;
  description: string;
  badgeUrl?: string;
  active: boolean;
  sortOrder?: number;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  hindiTitle?: string;
  description: string;
  iconName?: string;
  sortOrder: number;
  active: boolean;
}

export interface User {
  username: string;
  role: 'Admin' | 'Manager';
  name: string;
}

export interface CompanyContact {
  id: string;
  name: string;
  title: string;
  phone: string;
  email?: string;
  active: boolean;
}

export interface CompanySettings {
  companyName: string;
  hindiName?: string;
  cinNumber?: string;
  gstinNumber?: string;
  tagline: string;
  heroHeadline?: string;
  heroDescription?: string;
  contact1Name: string;
  contact1Title?: string;
  contact1Phone: string;
  contact2Name: string;
  contact2Title?: string;
  contact2Phone: string;
  email: string;
  secondaryEmail?: string;
  address: string;
  plantLocation?: string;
  operatingHours?: string;
  contacts: CompanyContact[];
  logoUrl?: string;
  logoPath?: string;
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
  sortOrder?: number;
  active?: boolean;
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