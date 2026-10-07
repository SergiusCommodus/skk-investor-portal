// All companies, people, vehicles and figures in this file are fictional demo data.

export type Strategy = 'SKK Ventures' | 'SKK Real Estate';
export type Flow = { date: string; amount: number; kind: 'contribution' | 'distribution' | 'sale' };
export type Round = { round: string; date: string; raised: number; post: number; lead: string; skk?: boolean };
export type Mark = { label: string; value: number };
export type Metric = { label: string; value: string; note?: string };

export type Holding = {
  id: string;
  name: string;
  initials: string;
  hue: string;
  strategy: Strategy;
  entity: string;
  vehicle: string;
  instrument: string;
  sector: string;
  tagline: string;
  description: string;
  hq: string;
  founded: string;
  leader: string;
  leaderTitle: string;
  team: string;
  website: string;
  flows: Flow[];
  value: number;
  costBasis: number;
  shares?: number;
  entryPrice?: number;
  currentPrice?: number;
  ownership: string;
  commitment?: number;
  markUnit: string;
  marks: Mark[];
  rounds?: Round[];
  metrics: Metric[];
  thesis: string[];
  risks: string[];
  milestones: { date: string; text: string }[];
  skkRole: string;
  nextEvent: string;
};

const shares = (inv: number, px: number) => Math.round(inv / px);

export const ENTITIES = ['Ellery Family Trust', 'Jonathan Ellery (Individual)', 'Ellery Holdings LLC'] as const;

export const HOLDINGS: Holding[] = [
  {
    id: 'lumora', name: 'Lumora AI', initials: 'LA', hue: '#03509F', strategy: 'SKK Ventures',
    entity: 'Ellery Family Trust', vehicle: 'SKK Lumora Co Invest I, LLC', instrument: 'Series B Preferred',
    sector: 'Healthcare AI', tagline: 'Ambient AI clinical documentation for health systems',
    description: 'Lumora listens to the patient visit, drafts the clinical note in the physician\'s own style and files it directly into the EHR. Physicians save roughly two hours of charting per day, and health systems see measurable gains in visit capacity and coding accuracy.',
    hq: 'Boston, MA', founded: '2021', leader: 'Priya Natarajan', leaderTitle: 'Cofounder and CEO', team: '184',
    website: 'lumora.example',
    flows: [{ date: '2025-03-18', amount: -750000, kind: 'contribution' }],
    shares: shares(750000, 12.4), entryPrice: 12.4, currentPrice: 23.56, value: 0, costBasis: 750000, ownership: '0.42%',
    markUnit: 'Post money valuation ($M)',
    marks: [{ label: 'Seed 21', value: 18 }, { label: 'A 23', value: 95 }, { label: 'B 25', value: 180 }, { label: 'Dec 25', value: 260 }, { label: 'C 26', value: 342 }],
    rounds: [
      { round: 'Seed', date: '2021-06-10', raised: 4e6, post: 18e6, lead: 'Ridgeline Ventures' },
      { round: 'Series A', date: '2023-04-04', raised: 22e6, post: 95e6, lead: 'Ashby Point Capital' },
      { round: 'Series B', date: '2025-03-18', raised: 45e6, post: 180e6, lead: 'Northgate Partners', skk: true },
      { round: 'Series C', date: '2026-08-12', raised: 70e6, post: 342e6, lead: 'Calder Growth' },
    ],
    metrics: [
      { label: 'ARR', value: '$38.5M', note: '+212% YoY' }, { label: 'Health systems live', value: '63' },
      { label: 'Net revenue retention', value: '148%' }, { label: 'Gross margin', value: '74%' },
      { label: 'Runway', value: '34 mo', note: 'post Series C' }, { label: 'Physicians on platform', value: '11,200' },
    ],
    thesis: ['Documentation burden is the top driver of physician burnout, with a clear ROI story for CFOs', 'Deep EHR integrations create switching costs competitors struggle to match', 'Expansion into coding and prior authorization roughly triples revenue per physician'],
    risks: ['Large EHR vendors are building native ambient features', 'Hospital procurement cycles can stretch beyond 9 months', 'Model accuracy and privacy obligations under HIPAA'],
    milestones: [{ date: '2026-08-12', text: 'Closed $70M Series C at $342M post money' }, { date: '2026-05-02', text: 'Signed 12 hospital regional health network' }, { date: '2025-11-19', text: 'Launched automated coding module' }],
    skkRole: 'Board observer seat held by SKK Ventures', nextEvent: 'Q4 board meeting · Dec 4, 2026',
  },
  {
    id: 'corvalis', name: 'Corvalis Diagnostics', initials: 'CD', hue: '#57B7E8', strategy: 'SKK Ventures',
    entity: 'Jonathan Ellery (Individual)', vehicle: 'SKK Ventures Co Invest II, LLC', instrument: 'Series B Preferred',
    sector: 'Medical Devices', tagline: 'A 15 minute point of care sepsis test',
    description: 'Corvalis has built a cartridge based blood test that identifies sepsis risk at the bedside in 15 minutes, compared with hours for a lab culture. Earlier detection shortens ICU stays and reduces mortality, which drives fast adoption among emergency departments.',
    hq: 'Cambridge, MA', founded: '2019', leader: 'Marcus Bell', leaderTitle: 'CEO', team: '96', website: 'corvalisdx.example',
    flows: [{ date: '2024-06-12', amount: -500000, kind: 'contribution' }],
    shares: shares(500000, 8.2), entryPrice: 8.2, currentPrice: 11.48, value: 0, costBasis: 500000, ownership: '0.53%',
    markUnit: 'Post money valuation ($M)',
    marks: [{ label: 'Seed 19', value: 12 }, { label: 'A 21', value: 48 }, { label: 'B 24', value: 95 }, { label: 'Dec 25', value: 108 }, { label: 'C 26', value: 133 }],
    rounds: [
      { round: 'Seed', date: '2019-09-03', raised: 3e6, post: 12e6, lead: 'Fenwick Labs Fund' },
      { round: 'Series A', date: '2021-03-22', raised: 15e6, post: 48e6, lead: 'Ashby Point Capital' },
      { round: 'Series B', date: '2024-06-12', raised: 32e6, post: 95e6, lead: 'SKK Ventures', skk: true },
      { round: 'Series C', date: '2026-06-30', raised: 40e6, post: 133e6, lead: 'Harrow Health Capital' },
    ],
    metrics: [
      { label: 'FDA status', value: '510(k)', note: 'Cleared Feb 2026' }, { label: 'Revenue TTM', value: '$6.2M', note: '+140% YoY' },
      { label: 'Hospitals live', value: '41' }, { label: 'Gross margin', value: '58%' },
      { label: 'Contracted pipeline', value: '$18M' }, { label: 'Runway', value: '26 mo' },
    ],
    thesis: ['Sepsis is the leading cause of hospital deaths with a clear clinical and economic case for faster testing', 'Razor and blade model: installed readers drive recurring cartridge revenue', 'FDA clearance creates a durable lead over earlier stage competitors'],
    risks: ['Manufacturing scale up of cartridges', 'Reimbursement still being finalized for outpatient use', 'Hospital capital budgets'],
    milestones: [{ date: '2026-06-30', text: 'Closed $40M Series C led by Harrow Health Capital' }, { date: '2026-02-18', text: 'FDA 510(k) clearance received' }, { date: '2025-09-09', text: 'First 25 hospitals live' }],
    skkRole: 'SKK led the Series B and holds a board seat', nextEvent: 'Series C extension closes Nov 14, 2026',
  },
  {
    id: 'halcyon', name: 'Halcyon Cardio', initials: 'HC', hue: '#80848A', strategy: 'SKK Ventures',
    entity: 'Jonathan Ellery (Individual)', vehicle: 'SKK Ventures Co Invest II, LLC', instrument: 'Series A Preferred',
    sector: 'Digital Health', tagline: 'Patch based remote cardiac monitoring with AI arrhythmia detection',
    description: 'Halcyon\'s 14 day wearable patch streams ECG data to a cloud model that flags arrhythmias for cardiologists in near real time. The company bills under established remote monitoring codes and sells to cardiology groups and health systems.',
    hq: 'Minneapolis, MN', founded: '2020', leader: 'Dana Whitfield', leaderTitle: 'Founder and CEO', team: '61', website: 'halcyoncardio.example',
    flows: [{ date: '2024-11-20', amount: -400000, kind: 'contribution' }],
    shares: shares(400000, 4.1), entryPrice: 4.1, currentPrice: 4.61, value: 0, costBasis: 400000, ownership: '0.83%',
    markUnit: 'Post money valuation ($M)',
    marks: [{ label: 'Seed 20', value: 10 }, { label: 'A 24', value: 48 }, { label: 'Dec 25', value: 51 }, { label: 'Jun 26', value: 54 }],
    rounds: [
      { round: 'Seed', date: '2020-10-14', raised: 2.5e6, post: 10e6, lead: 'Lakeside Angels' },
      { round: 'Series A', date: '2024-11-20', raised: 14e6, post: 48e6, lead: 'Orchard Hill Ventures', skk: true },
    ],
    metrics: [
      { label: 'ARR', value: '$9.1M', note: '+96% YoY' }, { label: 'Patients monitored', value: '48,000' },
      { label: 'Cardiology groups', value: '118' }, { label: 'Gross margin', value: '62%' },
      { label: 'Reimbursement', value: 'CPT covered' }, { label: 'Runway', value: '19 mo' },
    ],
    thesis: ['Reimbursement already exists, so revenue does not wait on new codes', 'AI triage lowers the cost per read below legacy monitoring services', 'Natural expansion into heart failure and post surgical monitoring'],
    risks: ['Runway under 24 months; Series B expected in 2027', 'Competitive category with well funded incumbents', 'Device supply chain'],
    milestones: [{ date: '2026-07-21', text: 'Crossed 48,000 patients monitored' }, { date: '2026-03-10', text: 'Launched heart failure monitoring pilot with two health systems' }],
    skkRole: 'SKK participated alongside lead investor', nextEvent: 'Series B process expected Q1 2027',
  },
  {
    id: 'vireo', name: 'Vireo Therapeutics', initials: 'VT', hue: '#C7C8CD', strategy: 'SKK Ventures',
    entity: 'Jonathan Ellery (Individual)', vehicle: 'SKK Ventures Co Invest I, LLC', instrument: 'Series B Preferred',
    sector: 'Biotechnology', tagline: 'Oral therapy for treatment resistant hypertension',
    description: 'Vireo is developing VR 201, a once daily oral small molecule for patients whose blood pressure stays high despite three or more medications. The Phase 2b trial is enrolling across 38 US sites.',
    hq: 'San Diego, CA', founded: '2018', leader: 'Elliot Graves, MD', leaderTitle: 'CEO', team: '44', website: 'vireotx.example',
    flows: [{ date: '2023-09-14', amount: -350000, kind: 'contribution' }],
    shares: shares(350000, 18), entryPrice: 18, currentPrice: 14.14, value: 0, costBasis: 350000, ownership: '0.25%',
    markUnit: 'Post money valuation ($M)',
    marks: [{ label: 'A 20', value: 70 }, { label: 'B 23', value: 140 }, { label: 'Dec 24', value: 140 }, { label: 'Mar 26', value: 110 }],
    rounds: [
      { round: 'Series A', date: '2020-05-06', raised: 25e6, post: 70e6, lead: 'Torrey Bio Partners' },
      { round: 'Series B', date: '2023-09-14', raised: 60e6, post: 140e6, lead: 'Meridian Life Sciences', skk: true },
    ],
    metrics: [
      { label: 'Lead asset', value: 'VR 201', note: 'Phase 2b' }, { label: 'Enrollment', value: '312 / 400' },
      { label: 'Cash on hand', value: '$58M' }, { label: 'Runway', value: '22 mo' },
      { label: 'Topline data', value: 'Q2 2027' }, { label: 'Patents', value: '14 granted' },
    ],
    thesis: ['Roughly 10 million US patients have treatment resistant hypertension with few options', 'Phase 2a showed meaningful blood pressure reduction with a clean safety profile', 'Strong strategic interest from large cardiovascular franchises'],
    risks: ['Binary clinical trial risk', 'Mark reduced in March 2026 after a protocol amendment extended the timeline', 'Will need additional capital before Phase 3'],
    milestones: [{ date: '2026-09-02', text: 'Enrollment passed 300 patients' }, { date: '2026-03-15', text: 'Protocol amendment; valuation marked to $110M' }],
    skkRole: 'SKK participated in the Series B', nextEvent: 'Enrollment complete expected Jan 2027',
  },
  {
    id: 'arclight', name: 'Arclight Payments', initials: 'AP', hue: '#0B3D73', strategy: 'SKK Ventures',
    entity: 'Ellery Family Trust', vehicle: 'SKK Arclight Co Invest, LLC', instrument: 'Series C Preferred',
    sector: 'Financial Technology', tagline: 'Embedded B2B payments and treasury for the middle market',
    description: 'Arclight gives mid sized companies one platform for payables, receivables and cash management, embedded inside the accounting software they already use. It earns on payment volume and treasury balances and turned EBITDA positive in 2025.',
    hq: 'New York, NY', founded: '2017', leader: 'Rafael Ortiz', leaderTitle: 'Cofounder and CEO', team: '420', website: 'arclightpay.example',
    flows: [{ date: '2023-01-25', amount: -600000, kind: 'contribution' }, { date: '2025-12-15', amount: 122940, kind: 'sale' }],
    shares: shares(600000, 21.5) - 4186, entryPrice: 21.5, currentPrice: 32.51, value: 0, costBasis: 510000, ownership: '0.12%',
    markUnit: 'Post money valuation ($M)',
    marks: [{ label: 'B 20', value: 180 }, { label: 'C 23', value: 410 }, { label: 'Dec 24', value: 455 }, { label: 'Tender 25', value: 560 }, { label: 'Jun 26', value: 620 }],
    rounds: [
      { round: 'Series B', date: '2020-08-19', raised: 40e6, post: 180e6, lead: 'Brookfield Lane' },
      { round: 'Series C', date: '2023-01-25', raised: 85e6, post: 410e6, lead: 'Calder Growth', skk: true },
      { round: 'Tender offer', date: '2025-12-15', raised: 60e6, post: 560e6, lead: 'Company led secondary' },
    ],
    metrics: [
      { label: 'Annualized volume', value: '$14.2B' }, { label: 'Revenue', value: '$96M', note: '+58% YoY' },
      { label: 'EBITDA margin', value: '+4%' }, { label: 'Customers', value: '3,900' },
      { label: 'Gross margin', value: '61%' }, { label: 'Net retention', value: '131%' },
    ],
    thesis: ['Middle market finance teams are underserved by both banks and SMB tools', 'Embedded distribution through accounting platforms keeps acquisition costs low', 'Profitable growth gives optionality on IPO timing'],
    risks: ['Interest rate sensitivity of float income', 'Bank partner concentration', 'Competition from large card networks'],
    milestones: [{ date: '2025-12-15', text: 'Tender offer completed; 15% of your position sold for $122,940' }, { date: '2025-07-01', text: 'Turned EBITDA positive' }],
    skkRole: 'SKK holds pro rata rights through the Series C', nextEvent: 'IPO readiness review · 2027',
  },
  {
    id: 'brightwater', name: 'Brightwater Robotics', initials: 'BR', hue: '#2E86C1', strategy: 'SKK Ventures',
    entity: 'Jonathan Ellery (Individual)', vehicle: 'SKK Ventures Co Invest III, LLC', instrument: 'Seed Preferred',
    sector: 'Robotics', tagline: 'Autonomous mobile robots for mid size warehouses',
    description: 'Brightwater builds low cost autonomous robots that move totes and pallets in warehouses that are too small for traditional automation. Robots are leased monthly, so customers avoid large upfront capital outlays.',
    hq: 'Pittsburgh, PA', founded: '2023', leader: 'Hannah Cole', leaderTitle: 'Cofounder and CEO', team: '23', website: 'brightwaterrobotics.example',
    flows: [{ date: '2026-01-14', amount: -250000, kind: 'contribution' }],
    shares: shares(250000, 1.1), entryPrice: 1.1, currentPrice: 1.25, value: 0, costBasis: 250000, ownership: '1.14%',
    markUnit: 'Post money valuation ($M)',
    marks: [{ label: 'Pre seed 23', value: 8 }, { label: 'Seed 26', value: 22 }, { label: 'Sep 26', value: 25 }],
    rounds: [
      { round: 'Pre seed', date: '2023-05-02', raised: 1.5e6, post: 8e6, lead: 'Three Rivers Angels' },
      { round: 'Seed', date: '2026-01-14', raised: 6e6, post: 22e6, lead: 'SKK Ventures', skk: true },
    ],
    metrics: [
      { label: 'Paid deployments', value: '3' }, { label: 'Active pilots', value: '7' },
      { label: 'Bookings', value: '$2.4M' }, { label: 'Robots in field', value: '64' },
      { label: 'Runway', value: '30 mo' }, { label: 'Team', value: '23' },
    ],
    thesis: ['Roughly 150,000 US warehouses are too small for legacy automation', 'Robots as a service pricing removes the capital barrier', 'Founders previously scaled robotics at a top logistics operator'],
    risks: ['Early commercial stage', 'Hardware margins at low volume', 'Labor market shifts could slow urgency'],
    milestones: [{ date: '2026-09-01', text: 'Strategic partnership with a national 3PL; mark raised to $25M' }, { date: '2026-01-14', text: 'Closed $6M seed led by SKK Ventures' }],
    skkRole: 'SKK led the seed and holds a board seat', nextEvent: 'Series A planning · H2 2027',
  },
  {
    id: 'harborpoint', name: 'Harbor Point Industrial Fund', initials: 'HP', hue: '#03509F', strategy: 'SKK Real Estate',
    entity: 'Ellery Family Trust', vehicle: 'Harbor Point Industrial Fund, LP', instrument: 'Limited Partnership Interest',
    sector: 'Industrial Real Estate', tagline: 'Value add logistics and light industrial across the Southeast',
    description: 'A closed end fund acquiring under managed logistics buildings near major Southeast ports and interstates, then improving them through leasing, renovation and operational upgrades. The portfolio is six properties totaling 1.9 million square feet.',
    hq: 'Atlanta, Charlotte, Savannah', founded: '2023 vintage', leader: 'SKK Real Estate', leaderTitle: 'General Partner', team: '6 properties', website: '',
    commitment: 1500000,
    flows: [
      { date: '2023-06-15', amount: -400000, kind: 'contribution' }, { date: '2024-03-20', amount: -300000, kind: 'contribution' },
      { date: '2024-06-30', amount: 18000, kind: 'distribution' }, { date: '2024-09-30', amount: 20000, kind: 'distribution' },
      { date: '2024-12-31', amount: 20000, kind: 'distribution' }, { date: '2025-03-12', amount: -300000, kind: 'contribution' },
      { date: '2025-03-31', amount: 20000, kind: 'distribution' }, { date: '2025-06-30', amount: 21000, kind: 'distribution' },
      { date: '2025-09-30', amount: 21000, kind: 'distribution' }, { date: '2025-12-31', amount: 22000, kind: 'distribution' },
    ],
    value: 1080000, costBasis: 1000000, ownership: '0.71% of fund',
    markUnit: 'NAV per unit',
    marks: [{ label: 'Jun 23', value: 1.0 }, { label: 'Dec 23', value: 1.01 }, { label: 'Dec 24', value: 1.04 }, { label: 'Dec 25', value: 1.06 }, { label: 'Sep 26', value: 1.08 }],
    metrics: [
      { label: 'Occupancy', value: '96%' }, { label: 'Square feet', value: '1.9M' },
      { label: 'Wtd avg lease term', value: '5.8 yrs' }, { label: 'Loan to value', value: '52%' },
      { label: 'Target net IRR', value: '14 to 16%' }, { label: 'Fund size', value: '$210M' },
    ],
    thesis: ['Port driven demand and nearshoring continue to tighten Southeast industrial supply', 'Buying below replacement cost gives downside protection', 'Leases marked to market roughly 25% below current rents'],
    risks: ['New supply in select submarkets', 'Refinancing at higher rates', 'Tenant concentration in two buildings'],
    milestones: [{ date: '2026-08-20', text: 'Signed 10 year lease for 240,000 sq ft in Savannah' }, { date: '2026-04-11', text: 'Acquired sixth property in Charlotte' }],
    skkRole: 'SKK Real Estate is the General Partner', nextEvent: 'Capital call 4 · $150,000 due Oct 31, 2026',
  },
  {
    id: 'coastal', name: 'Coastal Multifamily SPV II', initials: 'CM', hue: '#57B7E8', strategy: 'SKK Real Estate',
    entity: 'Ellery Holdings LLC', vehicle: 'SKK Coastal Multifamily SPV II, LLC', instrument: 'Class A Units',
    sector: 'Multifamily', tagline: '212 unit garden style community in Charleston, SC',
    description: 'A single asset investment in The Marlowe, a 212 unit community built in 2004. The business plan renovates interiors and amenities to capture rent growth in one of the fastest growing metros in the Southeast.',
    hq: 'Charleston, SC', founded: 'Acquired Feb 2024', leader: 'SKK Real Estate', leaderTitle: 'Sponsor', team: '212 units', website: '',
    flows: [
      { date: '2024-02-08', amount: -800000, kind: 'contribution' },
      { date: '2024-06-30', amount: 18000, kind: 'distribution' }, { date: '2024-09-30', amount: 18000, kind: 'distribution' },
      { date: '2024-12-31', amount: 20000, kind: 'distribution' }, { date: '2025-03-31', amount: 20000, kind: 'distribution' },
      { date: '2025-06-30', amount: 20000, kind: 'distribution' }, { date: '2025-09-30', amount: 20000, kind: 'distribution' },
      { date: '2025-12-31', amount: 20000, kind: 'distribution' }, { date: '2026-03-31', amount: 20000, kind: 'distribution' },
      { date: '2026-06-30', amount: 20000, kind: 'distribution' }, { date: '2026-09-18', amount: 22000, kind: 'distribution' },
    ],
    value: 912000, costBasis: 800000, ownership: '8.0% of SPV',
    markUnit: 'NAV per unit',
    marks: [{ label: 'Feb 24', value: 1.0 }, { label: 'Dec 24', value: 1.05 }, { label: 'Dec 25', value: 1.1 }, { label: 'Sep 26', value: 1.14 }],
    metrics: [
      { label: 'Occupancy', value: '95.3%' }, { label: 'Avg rent', value: '$1,840', note: '+4.1% YoY' },
      { label: 'Units renovated', value: '140 / 212' }, { label: 'Loan to value', value: '58%' },
      { label: 'Cash yield', value: '10.5%' }, { label: 'Target IRR', value: '15%' },
    ],
    thesis: ['Charleston population growth well above national average', 'Renovated units leasing at $210 premiums', 'Fixed rate debt through 2031'],
    risks: ['Insurance costs in coastal markets', 'New supply delivering in 2027', 'Execution of remaining renovations'],
    milestones: [{ date: '2026-09-18', text: 'Q3 distribution of $22,000 paid' }, { date: '2026-06-01', text: 'Clubhouse and pool renovation completed' }],
    skkRole: 'SKK Real Estate sponsors and asset manages', nextEvent: 'Q4 distribution · late December',
  },
  {
    id: 'riverside', name: 'Riverside Self Storage Portfolio', initials: 'RS', hue: '#80848A', strategy: 'SKK Real Estate',
    entity: 'Ellery Holdings LLC', vehicle: 'SKK Riverside Storage, LLC', instrument: 'Class A Units',
    sector: 'Self Storage', tagline: 'Four climate controlled facilities in Texas and Tennessee',
    description: 'A portfolio of four self storage properties with 2,640 units, acquired from a regional owner operator. SKK added revenue management software, expanded climate controlled space and refinanced in 2025.',
    hq: 'Austin, San Antonio, Nashville', founded: 'Acquired Aug 2022', leader: 'SKK Real Estate', leaderTitle: 'Sponsor', team: '2,640 units', website: '',
    flows: [
      { date: '2022-08-10', amount: -500000, kind: 'contribution' },
      { date: '2023-06-30', amount: 15000, kind: 'distribution' }, { date: '2023-12-31', amount: 17000, kind: 'distribution' },
      { date: '2024-06-30', amount: 20000, kind: 'distribution' }, { date: '2024-12-31', amount: 21000, kind: 'distribution' },
      { date: '2025-06-30', amount: 22000, kind: 'distribution' }, { date: '2025-12-31', amount: 23000, kind: 'distribution' },
      { date: '2026-06-30', amount: 24000, kind: 'distribution' },
    ],
    value: 610000, costBasis: 500000, ownership: '6.5% of portfolio',
    markUnit: 'NAV per unit',
    marks: [{ label: 'Aug 22', value: 1.0 }, { label: 'Dec 23', value: 1.06 }, { label: 'Dec 24', value: 1.12 }, { label: 'Dec 25', value: 1.18 }, { label: 'Jun 26', value: 1.22 }],
    metrics: [
      { label: 'Occupancy', value: '91%' }, { label: 'Units', value: '2,640' },
      { label: 'NOI growth', value: '+7%', note: 'YoY' }, { label: 'Loan to value', value: '47%' },
      { label: 'Cash yield', value: '9.6%' }, { label: 'Target IRR', value: '16%' },
    ],
    thesis: ['Fragmented sector where professional management lifts NOI quickly', 'Low capital expenditure and resilient through cycles', 'Sunbelt population growth'],
    risks: ['Street rate softness from new supply', 'Property tax reassessments', 'Exit cap rate expansion'],
    milestones: [{ date: '2026-06-30', text: 'Semiannual distribution of $24,000 paid' }, { date: '2025-10-08', text: 'Refinanced at fixed rate through 2030' }],
    skkRole: 'SKK Real Estate sponsors and asset manages', nextEvent: 'Semiannual distribution · Dec 31, 2026',
  },
];

// Venture values are shares times the current mark price.
HOLDINGS.forEach((h) => {
  if (h.shares && h.currentPrice) h.value = Math.round(h.shares * h.currentPrice);
});

export const AS_OF = '2026-09-30';
export const AS_OF_LABEL = 'September 30, 2026';

export const NAV_HISTORY: { q: string; value: number; invested: number }[] = [
  ['Q3 22', 505, 500], ['Q4 22', 515, 500], ['Q1 23', 1120, 1100], ['Q2 23', 1540, 1500], ['Q3 23', 1905, 1850],
  ['Q4 23', 1960, 1850], ['Q1 24', 3090, 2950], ['Q2 24', 3650, 3450], ['Q3 24', 3760, 3450], ['Q4 24', 4240, 3850],
  ['Q1 25', 5420, 4900], ['Q2 25', 5560, 4900], ['Q3 25', 5690, 4900], ['Q4 25', 5880, 4900], ['Q1 26', 6050, 5150],
  ['Q2 26', 6110, 5150], ['Q3 26', 0, 5150],
].map(([q, v, i]) => ({ q: q as string, value: (v as number) * 1000, invested: (i as number) * 1000 }));

export const TEAM = [
  { name: 'Alexandra Reyes', title: 'Managing Director, Client Relationships', initials: 'AR', phone: '(617) 555 0142', role: 'Your relationship lead' },
  { name: 'Ben Marsh', title: 'Associate, Investor Services', initials: 'BM', phone: '(617) 555 0178', role: 'Documents and requests' },
  { name: 'Laura Chen, CPA', title: 'Director, Tax and Reporting', initials: 'LC', phone: '(617) 555 0193', role: 'K1s and tax questions' },
];

export const INVESTOR = { first: 'Jonathan', last: 'Ellery', email: 'j.ellery@example.com', since: '2022', tier: 'Private Client' };

export const OPPORTUNITIES = [
  {
    id: 'opp-corvalis-c', holdingId: 'corvalis', title: 'Corvalis Diagnostics · Series C extension',
    strategy: 'SKK Ventures' as Strategy, summary: 'Existing investors may take up to their pro rata allocation at the Series C price.',
    terms: [['Post money', '$133M'], ['Your pro rata', 'Up to $180,000'], ['Minimum', '$50,000'], ['Closes', 'Nov 14, 2026']],
    deadline: '2026-11-14',
  },
  {
    id: 'opp-hp2', holdingId: 'harborpoint', title: 'Harbor Point Industrial Fund II',
    strategy: 'SKK Real Estate' as Strategy, summary: 'Successor fund to Harbor Point I. Priority allocation for Fund I limited partners.',
    terms: [['Target size', '$250M'], ['Target net IRR', '14 to 16%'], ['Minimum', '$250,000'], ['First close', 'Dec 15, 2026']],
    deadline: '2026-12-15',
  },
];

export const CAPITAL_CALL = {
  holdingId: 'harborpoint', number: 4, amount: 150000, due: '2026-10-31', purpose: 'Acquisition of a 310,000 sq ft distribution center in Greer, SC',
  remainingAfter: 350000,
};
