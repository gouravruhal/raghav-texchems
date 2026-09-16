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

export const CATEGORIES = [
  'All Products',
  'Textile Auxiliaries & Pre-treatment',
  'Dyestuff & Industrial Colorants',
  'Polymer & Acrylic Emulsions',
  'Paper Coating & Sizing Chemicals',
  'Specialty Industrial Chemicals'
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-textile-aux',
    name: 'Textile Auxiliaries & Pre-treatment',
    code: 'DIV-TEX',
    hindiTitle: 'वस्त्र सहायक रसायन',
    description: 'High-performance wetting agents, sequestering agents, scouring chemicals, and finishing softeners.',
    iconName: 'Sparkles',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'cat-dyestuffs',
    name: 'Dyestuff & Industrial Colorants',
    code: 'DIV-DYE',
    hindiTitle: 'डाईस्टफ और रंगद्रव्य',
    description: 'Reactive dyes, disperse dyes, and direct colorants engineered for extreme light and wash fastness.',
    iconName: 'Droplets',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'cat-polymers',
    name: 'Polymer & Acrylic Emulsions',
    code: 'DIV-POLY',
    hindiTitle: 'पॉलिमर और ऐक्रेलिक इमल्शन',
    description: 'Pure acrylic and styrene-acrylic binder emulsions for non-woven textiles, paint formulations, and adhesives.',
    iconName: 'Layers',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'cat-paper-coating',
    name: 'Paper Coating & Sizing Chemicals',
    code: 'DIV-PPR',
    hindiTitle: 'कागज कोटिंग और साइजिंग रसायन',
    description: 'Specialized surface sizing agents, wet strength resins, and coating lubricants for kraft and duplex paper mills.',
    iconName: 'FileText',
    sortOrder: 4,
    active: true,
  },
  {
    id: 'cat-specialty',
    name: 'Specialty Industrial Chemicals',
    code: 'DIV-SPEC',
    hindiTitle: 'विशिष्ट औद्योगिक रसायन',
    description: 'Custom-engineered defoamers, dispersing agents, and industrial cross-linking additives.',
    iconName: 'Activity',
    sortOrder: 5,
    active: true,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-rt-wet-100',
    name: 'Raghavwet 100 (Rapid Wetting Agent)',
    code: 'RTC-TEX-01',
    category: 'Textile Auxiliaries & Pre-treatment',
    categoryId: 'cat-textile-aux',
    description: 'Low-foaming, highly concentrated wetting and de-aerating agent specially formulated for cotton yarn scouring and continuous bleaching lines.',
    appearance: 'Clear Pale Yellow Liquid',
    ph: '6.0 - 7.5',
    activeContent: '80% ± 2%',
    viscosity: 'Low Viscosity (<100 cps)',
    ionicNature: 'Anionic / Non-Ionic',
    solubility: 'Easily soluble in cold water',
    shelfLife: '12 Months in original sealed container',
    applications: ['Yarn Wetting', 'Continuous Bleaching', 'Jet Dyeing De-aerator', 'Mercerizing Auxiliary'],
    packaging: ['50 Kg Carboys', '200 Kg HDPE Drums'],
    featured: true,
    active: true,
    stockStatus: 'In Stock',
    createdAt: '2025-01-10'
  },
  {
    id: 'prod-rt-soft-sil',
    name: 'Texchem Soft-Micro (Macro Silicone Softener)',
    code: 'RTC-TEX-02',
    category: 'Textile Auxiliaries & Pre-treatment',
    categoryId: 'cat-textile-aux',
    description: 'Modified amino-functional silicone emulsion imparting exceptional surface softness, inner resilience, and drape to knitted and woven cotton fabrics.',
    appearance: 'Milky White Emulsion',
    ph: '5.0 - 6.5',
    activeContent: '30% ± 1%',
    viscosity: '150 - 300 cps',
    ionicNature: 'Weakly Cationic',
    solubility: 'Dispersible in cold water',
    shelfLife: '6 Months (store between 5°C - 35°C)',
    applications: ['Cotton Knits Finishing', 'Terry Towels', 'Polyester-Cotton Blends', 'Garment Washing'],
    packaging: ['50 Kg Carboys', '200 Kg HDPE Drums'],
    featured: true,
    active: true,
    stockStatus: 'In Stock',
    createdAt: '2025-01-12'
  },
  {
    id: 'prod-rt-fix-nf',
    name: 'ColorFix NF (Formaldehyde-Free Dye Fixing Agent)',
    code: 'RTC-DYE-01',
    category: 'Dyestuff & Industrial Colorants',
    categoryId: 'cat-dyestuffs',
    description: 'Eco-friendly polycationic dye fixing agent that substantially improves wash fastness, water fastness, and perspiration resistance of direct and reactive dyeings.',
    appearance: 'Clear Viscous Liquid',
    ph: '4.0 - 6.0',
    activeContent: '50% ± 2%',
    viscosity: '200 - 450 cps',
    ionicNature: 'Cationic',
    solubility: 'Miscible in water in all proportions',
    shelfLife: '12 Months in sealed container',
    applications: ['Reactive Dye Fixing', 'Direct Dye Washing Fastness', 'Garment Over-Dyeing', 'Zero Formaldehyde Compliance'],
    packaging: ['50 Kg Carboys', '200 Kg HDPE Drums'],
    featured: true,
    active: true,
    stockStatus: 'In Stock',
    createdAt: '2025-01-15'
  },
  {
    id: 'prod-rt-bind-sa40',
    name: 'Texcryl SA-40 (Styrene Acrylic Emulsion Binder)',
    code: 'RTC-POLY-01',
    category: 'Polymer & Acrylic Emulsions',
    categoryId: 'cat-polymers',
    description: 'Rigid yet flexible self-crosslinking styrene acrylic copolymer emulsion designed for pigment printing, non-woven fabric bonding, and high-scrub coatings.',
    appearance: 'Milky White Fluid',
    ph: '7.5 - 8.5',
    activeContent: '48% ± 1%',
    viscosity: '2000 - 4500 cps (Brookfield)',
    ionicNature: 'Anionic',
    solubility: 'Dispersible in water',
    shelfLife: '6 Months (Protect from freezing)',
    applications: ['Textile Pigment Printing', 'Non-Woven Interlining Bonding', 'Architectural Coatings', 'Paper Impregnation'],
    packaging: ['200 Kg HDPE Drums', '1000 Kg IBC Tank'],
    featured: true,
    active: true,
    stockStatus: 'In Stock',
    createdAt: '2025-01-18'
  },
  {
    id: 'prod-rt-size-akd',
    name: 'PaperSize AKD-15 (Alkyl Ketene Dimer Emulsion)',
    code: 'RTC-PPR-01',
    category: 'Paper Coating & Sizing Chemicals',
    categoryId: 'cat-paper-coating',
    description: 'High-efficiency neutral-alkaline sizing agent providing exceptional water barrier properties, reduced Cobb values, and improved printability for paper and board.',
    appearance: 'Off-White Emulsion',
    ph: '3.5 - 5.0',
    activeContent: '15% ± 0.5%',
    viscosity: '20 - 50 cps',
    ionicNature: 'Cationic',
    solubility: 'Easily miscible with cold water',
    shelfLife: '3 Months (Store under 30°C)',
    applications: ['Neutral Paper Sizing', 'Duplex Board Mills', 'Kraft Paper Water Resistance', 'Writing & Printing Paper'],
    packaging: ['200 Kg HDPE Drums', '1000 Kg IBC Tank'],
    featured: true,
    active: true,
    stockStatus: 'In Stock',
    createdAt: '2025-01-20'
  },
  {
    id: 'prod-rt-def-s100',
    name: 'Antifoam RT-100 (Silicone Defoamer Compound)',
    code: 'RTC-SPEC-01',
    category: 'Specialty Industrial Chemicals',
    categoryId: 'cat-specialty',
    description: 'Concentrated silicone antifoam compound engineered for rapid knockdown and persistent de-foaming across wide pH and temperature spectrums.',
    appearance: 'Opaque White Liquid',
    ph: '6.5 - 8.0',
    activeContent: '20% ± 1%',
    viscosity: '800 - 1500 cps',
    ionicNature: 'Non-Ionic',
    solubility: 'Dispersible in water',
    shelfLife: '12 Months',
    applications: ['Effluent Treatment Plants (ETP)', 'Jet Dyeing Machines', 'Paper Pulp Sizing', 'Chemical Processing Tanks'],
    packaging: ['50 Kg Carboys', '200 Kg HDPE Drums'],
    featured: false,
    active: true,
    stockStatus: 'In Stock',
    createdAt: '2025-01-22'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'ISO 9001:2015 Audit Successfully Concluded: Re-certification & Batch Analysis Dossiers Uploaded.',
    category: 'Circular',
    content: 'The annual institutional quality audit under ISO 9001:2015 standards has been completed with zero non-conformances. Technical data sheets updated.',
    linkUrl: '/quality',
    badgeText: 'CERTIFIED',
    isPinned: true,
    active: true,
    sortOrder: 1,
    publishedAt: '2026-04-10'
  },
  {
    id: 'ann-02',
    title: 'Pan-India Dispatch Open for High-Solids Acrylic Binder Emulsions & Eco-Friendly Sizing Agents.',
    category: 'Notice',
    content: 'Immediate tanker and drum dispatches available across Delhi NCR, Haryana, Punjab, Gujarat, and Maharashtra industrial zones.',
    linkUrl: '/products?category=Polymer+%26+Acrylic+Emulsions',
    badgeText: 'SUPPLY OPEN',
    isPinned: false,
    active: true,
    sortOrder: 2,
    publishedAt: '2026-04-05'
  },
  {
    id: 'ann-03',
    title: 'Direct Technical Sales Desk: Reach Mr. Ravinder Kaushik (9050670509) & Mr. Sandeep (6283054442).',
    category: 'Gazette',
    content: 'For custom chemical synthesis, tender bid participation, and commercial bulk procurement agreements.',
    linkUrl: '/contact',
    badgeText: 'DIRECT DESK',
    isPinned: false,
    active: true,
    sortOrder: 3,
    publishedAt: '2026-04-01'
  }
];

export const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-iso',
    title: 'ISO 9001:2015 Quality Management Standard',
    issuingBody: 'International Organization for Standardization / NABL Accredited Registrar',
    certificateNumber: 'RTC-QMS-2024-8871',
    description: 'Validates quality assurance across chemical synthesis, raw material testing, and final batch inspection.',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'cert-zdhc',
    title: 'Zero Discharge of Hazardous Chemicals (ZDHC) Compliance',
    issuingBody: 'ZDHC Roadmap to Zero Foundation',
    certificateNumber: 'ZDHC-RTC-LVL3',
    description: 'Ensures non-detectable levels of restricted priority substances and formaldehyde across textile chemical auxiliaries.',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'cert-reach',
    title: 'REACH Regulation Compliance',
    issuingBody: 'European Chemicals Agency (ECHA) Standard',
    certificateNumber: 'EU-REACH-RTX-901',
    description: 'Confirms adherence to SVHC chemical safety thresholds for export consignments to international markets.',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'cert-make-in-india',
    title: 'Make in India Certified Manufacturing Entity',
    issuingBody: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    certificateNumber: 'DPIIT-IND-CHEM-4412',
    description: 'Officially recognized domestic chemical manufacturing setup supplying infrastructure and export markets.',
    sortOrder: 4,
    active: true,
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-sample-1',
    customerName: 'Shree Balaji Textiles Ltd.',
    phone: '9812003450',
    email: 'procurement@balajitex.in',
    companyName: 'Shree Balaji Textiles Ltd.',
    productCategory: 'Textile Auxiliaries & Pre-treatment',
    inquiryType: 'RFQ',
    estimatedVolume: '15 MT / Month',
    destinationCity: 'Panipat Industrial Zone',
    message: 'Requesting formal price quotation and technical data sheet for 200 Kg drums of Raghavwet 100 and ColorFix NF.',
    status: 'New',
    date: '2026-04-12',
    assignedTo: 'Mr. Ravinder Kaushik',
    adminNotes: 'Direct inquiry received for continuous yarn scouring line.'
  }
];

export const INITIAL_STATS: StatItem[] = [
  {
    id: 'stat-formulations',
    value: '150+',
    label: 'Approved Formulations',
    description: 'Laboratory tested for high repeatability & chemical stability',
    iconType: 'flask',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'stat-experience',
    value: '25+',
    label: 'Years of Industrial Trust',
    description: 'Serving key textile clusters and paper mills across India',
    iconType: 'award',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'stat-testing',
    value: '100%',
    label: 'Batch Laboratory Tested',
    description: 'Pre-dispatch COA issued for active solids, viscosity & pH',
    iconType: 'shield',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'stat-clients',
    value: '500+',
    label: 'Enterprise B2B Clients',
    description: 'Trusted by leading dye houses, paper mills & coating plants',
    iconType: 'users',
    sortOrder: 4,
    active: true,
  }
];

export const INITIAL_COLLABORATIONS: Collaboration[] = [
  {
    id: 'col-1',
    name: 'Northern India Textile Research Association (NITRA)',
    type: 'Laboratory Testing & Calibration Partner',
    location: 'Ghaziabad, India',
    badgeText: 'ACCREDITED LAB',
    active: true
  },
  {
    id: 'col-2',
    name: 'Panipat Dyers & Textile Manufacturers Association',
    type: 'Apex Industry Consortia Member',
    location: 'Haryana, India',
    badgeText: 'INDUSTRY BODY',
    active: true
  }
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Raghav Texchems Chemical Private Limited',
  hindiName: 'राघव टेक्सकेम्स केमिकल प्राइवेट लिमिटेड',
  cinNumber: 'U24100HR2020PTC086742',
  gstinNumber: '06AABCR1234F1Z5',
  tagline: 'chemistry that connects',
  heroHeadline: 'National Industrial Chemical Formulations & Advanced Specialty Polymers',
  heroDescription: 'Raghav Texchems Chemical Private Limited stands as an ISO 9001:2015 certified manufacturer & exporter of high-purity Dyestuff, Polymer Emulsions, Textile Auxiliaries, and Paper Coating innovations. Engineered with rigorous laboratory standards under our corporate commitment: "chemistry that connects".',
  contact1Name: 'Mr. Ravinder Kaushik',
  contact1Title: 'Director / Technical Sales',
  contact1Phone: '9050670509',
  contact2Name: 'Mr. Sandeep',
  contact2Title: 'Director / Operations & Supply Chain',
  contact2Phone: '6283054442',
  email: 'raghavtexchems1706@gmail.com',
  secondaryEmail: 'info@raghavtexchems.com',
  address: 'Plot No. 42-45, Phase 2, Chemical Industrial Zone, Panipat / Delhi NCR, India',
  plantLocation: 'Main Production Complex: Sector 29 Industrial Zone, Panipat, Haryana 132103',
  operatingHours: 'Monday - Saturday: 09:00 AM - 06:30 PM IST',
  contacts: [
    {
      id: 'c1',
      name: 'Mr. Ravinder Kaushik',
      phone: '9050670509',
      title: 'Director / Technical Sales',
      email: 'raghavtexchems1706@gmail.com',
      active: true,
    },
    {
      id: 'c2',
      name: 'Mr. Sandeep',
      phone: '6283054442',
      title: 'Director / Operations & Logistics',
      email: 'raghavtexchems1706@gmail.com',
      active: true,
    }
  ]
};

export const INITIAL_ABOUT_CONTENT: AboutContent = {
  videoUrl: '',
  videoType: 'youtube',
  storyTitle: 'Directorate Overview & Chemical Excellence',
  storyParagraphs: [
    'Raghav Texchems Chemical Private Limited is an Indian chemical manufacturing enterprise established with a singular focus: to engineer high-purity dyestuff, polymer emulsions, textile auxiliaries, and specialty chemicals that meet global benchmarks.',
    'Led by experienced chemical technologists Mr. Ravinder Kaushik and Mr. Sandeep, the company maintains advanced synthesis capabilities in the industrial hub of Haryana, serving industrial mills across India and international export markets.',
    'Every batch manufactured at our premises undergoes systematic physicochemical testing—including precise measurement of active solid content, pH buffering, Brookfield viscosity, and ionic stability—ensuring seamless operational continuity for our industrial partners.'
  ],
  missionTitle: 'Our Industrial Mission',
  missionText: 'To engineer world-class specialty chemical formulations with uncompromising laboratory purity, environmental stewardship, and customer-first technical support.',
  visionTitle: 'Our Strategic Vision',
  visionText: 'To stand as India’s most trusted specialty chemical manufacturing titan, advancing global supply chains through sustainable polymers and precision auxiliaries under our ethos: "chemistry that connects".',
  milestones: [
    {
      id: 'm1',
      year: '2000',
      title: 'Inception of Chemical Trading Desk',
      description: 'Founded with direct distribution of textile colorants and basic auxiliaries in North India.'
    },
    {
      id: 'm2',
      year: '2010',
      title: 'Synthesis Facility Commissioned',
      description: 'Established dedicated manufacturing reactors for textile finishing agents and dye fixers.'
    },
    {
      id: 'm3',
      year: '2018',
      title: 'Polymer & Emulsion Division Expansion',
      description: 'Inaugurated dedicated emulsion polymerization plant for styrene acrylic binders.'
    },
    {
      id: 'm4',
      year: '2024',
      title: 'ISO 9001:2015 & National Accreditation',
      description: 'Consolidated enterprise operations under Raghav Texchems Chemical Pvt. Ltd. with global export capabilities.'
    }
  ],
  coreValues: [
    {
      id: 'v1',
      title: 'Purity & Repeatability',
      description: 'Strict batch-to-batch repeatability backed by pre-dispatch Certificate of Analysis (COA).',
      iconType: 'flask'
    },
    {
      id: 'v2',
      title: 'Directorate Accessibility',
      description: 'Direct access to senior technical leadership for custom formulation requirements and batch tailoring.',
      iconType: 'users'
    },
    {
      id: 'v3',
      title: 'Sustainable Chemistry',
      description: 'Zero-formaldehyde and eco-conscious formulation standards adhering strictly to ZDHC guidelines.',
      iconType: 'shield'
    },
    {
      id: 'v4',
      title: 'Prompt Pan-India Logistics',
      description: 'Strategic industrial location ensuring rapid delivery across major industrial clusters in India.',
      iconType: 'award'
    }
  ]
};
