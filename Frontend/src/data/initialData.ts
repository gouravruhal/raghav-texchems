import type { Product, Inquiry, CompanySettings, StatItem, Collaboration, AboutContent } from '../types';

export const CATEGORIES = [
  'All Products',
  'Dyestuff & Colorants',
  'Polymer & Emulsions',
  'Paper Coating Chemicals',
  'Textile Auxiliaries',
  'Packaging & Resins',
  'Specialty Solvents'
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_INQUIRIES: Inquiry[] = [];

export const INITIAL_STATS: StatItem[] = [];

export const INITIAL_COLLABORATIONS: Collaboration[] = [];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Raghav Texchems Chemical Private Limited',
  tagline: 'chemistry that connects',
  heroHeadline: 'Advancing Science. Transforming Chemical Connectivity.',
  heroDescription: 'Raghav Texchems Chemical Private Limited is at the forefront of chemical manufacturing—developing high-performance Dyestuffs, Polymer Emulsions, Textile Auxiliaries, and Paper Coating innovations.',
  contact1Name: 'Raghav Sharma',
  contact1Phone: '9876543210',
  contact2Name: 'Technical Support',
  contact2Phone: '9876543211',
  email: 'info@raghavtexchems.com',
  address: 'Plot No. 42, GIDC Industrial Estate, Ankleshwar, Gujarat, India',
  contacts: [
    {
      id: 'c1',
      name: 'Raghav Sharma',
      phone: '9876543210',
      title: 'Managing Director',
      active: true,
    },
    {
      id: 'c2',
      name: 'Technical & Sales Support',
      phone: '9876543211',
      title: 'Sales & Tech Inquiries',
      active: true,
    }
  ],
  logoUrl: '/logo.png'
};

export const INITIAL_ABOUT_CONTENT: AboutContent = {
  videoUrl: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4',
  videoType: 'direct',
  storyTitle: 'Pioneering Chemical Solutions With Purpose & Precision',
  storyParagraphs: [
    'Founded with a bold vision to bridge cutting-edge polymer research with heavy industrial utility, Raghav Texchems Chemical Private Limited has grown into an international manufacturer of specialty dyestuffs, polymer emulsions, and surface coatings.',
    'Our manufacturing units operate with strict quality parameters, ensuring batch-to-batch consistency and high environmental compliance for domestic and global export markets.'
  ],
  missionTitle: 'Our Mission',
  missionText: 'To engineer sustainable, high-yield chemical formulations that empower global textile, paper, and polymer industries while preserving ecological harmony.',
  visionTitle: 'Our Vision',
  visionText: 'To be the most trusted international partner in specialty chemical connectivity, recognized for technical excellence and uncompromising reliability.',
  milestones: [
    {
      id: 'm1',
      year: '2015',
      title: 'Company Inception',
      description: 'Established manufacturing facility for reactive dyestuffs in Gujarat, India.'
    },
    {
      id: 'm2',
      year: '2019',
      title: 'Polymer Emulsion Facility',
      description: 'Commissioned automated polymerization reactors for textile binders and paper sizing.'
    },
    {
      id: 'm3',
      year: '2023',
      title: 'Global Export Footprint',
      description: 'Expanded export reach across South Asia, Middle East, and European markets.'
    }
  ],
  coreValues: [
    {
      id: 'v1',
      title: 'Precision Chemistry',
      description: 'Meticulous laboratory synthesis and stringent batch testing standards.',
      iconType: 'flask'
    },
    {
      id: 'v2',
      title: 'Sustainable Innovation',
      description: 'Formulations engineered with eco-conscious, biodegradable chemistries.',
      iconType: 'shield'
    },
    {
      id: 'v3',
      title: 'Customer Centricity',
      description: 'Tailored technical data sheets, custom viscosity, and dedicated application support.',
      iconType: 'users'
    },
    {
      id: 'v4',
      title: 'Global Compliance',
      description: 'Adhering to international safety, REACH, and environmental standards.',
      iconType: 'award'
    }
  ]
};
