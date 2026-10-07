import { HOLDINGS, CAPITAL_CALL } from './portfolio';

export type DocCategory = 'Tax' | 'Statements' | 'Reports' | 'Legal' | 'Notices';
export type Doc = {
  id: string; title: string; category: DocCategory; date: string; holdingId?: string; entity?: string;
  pages: number; size: string; isNew?: boolean; summary: string;
};

const docs: Doc[] = [];
let n = 1;
const add = (d: Omit<Doc, 'id' | 'pages' | 'size'> & { pages?: number }) => {
  const pages = d.pages ?? 2 + ((n * 7) % 11);
  docs.push({ ...d, id: 'doc' + n++, pages, size: (pages * 0.11 + 0.08).toFixed(1) + ' MB' });
};

// Consolidated statements and letters
[['2026-10-01', 'Q3 2026', true], ['2026-07-02', 'Q2 2026'], ['2026-04-03', 'Q1 2026'], ['2026-01-08', 'Q4 2025']].forEach(([d, q, isNew]) => {
  add({ title: `${q} Consolidated Capital Account Statement`, category: 'Statements', date: d as string, isNew: !!isNew, summary: `Capital account activity, valuations and performance across all entities for ${q}.` });
});
add({ title: 'Q3 2026 Investor Letter', category: 'Reports', date: '2026-10-03', isNew: true, pages: 8, summary: 'Market commentary from the SKK investment committee and updates across SKK Ventures and SKK Real Estate.' });
add({ title: 'Q2 2026 Investor Letter', category: 'Reports', date: '2026-07-28', pages: 8, summary: 'Second quarter commentary, portfolio highlights and outlook.' });
add({ title: 'Q1 2026 Investor Letter', category: 'Reports', date: '2026-04-24', pages: 7, summary: 'First quarter commentary, portfolio highlights and outlook.' });
add({ title: '2025 Annual Report and Audited Financial Statements', category: 'Reports', date: '2026-03-31', pages: 46, summary: 'Audited financial statements for SKK sponsored vehicles for the year ended December 31, 2025.' });
add({ title: 'Form ADV Part 2A Brochure', category: 'Legal', date: '2026-03-28', pages: 38, summary: 'Annual update to the firm brochure describing services, fees and conflicts of interest.' });

// Per holding: legal, tax, notices
HOLDINGS.forEach((h) => {
  const first = h.flows.find((f) => f.amount < 0)!;
  const legalName = h.strategy === 'SKK Real Estate' && h.id === 'harborpoint' ? 'Limited Partnership Agreement' : 'Operating Agreement';
  add({ title: `${h.name} Subscription Agreement`, category: 'Legal', date: first.date, holdingId: h.id, entity: h.entity, summary: `Executed subscription documents for ${h.vehicle}.` });
  add({ title: `${h.vehicle} ${legalName}`, category: 'Legal', date: first.date, holdingId: h.id, entity: h.entity, pages: 24 + (n % 18), summary: `Governing agreement for ${h.vehicle}.` });
  const y = Number(first.date.slice(0, 4));
  if (y <= 2024) add({ title: `2024 Schedule K1 · ${h.vehicle}`, category: 'Tax', date: '2025-03-14', holdingId: h.id, entity: h.entity, pages: 4, summary: 'Partner\'s share of income, deductions and credits for tax year 2024.' });
  if (y <= 2025) add({ title: `2025 Schedule K1 · ${h.vehicle}`, category: 'Tax', date: '2026-03-13', holdingId: h.id, entity: h.entity, pages: 4, summary: 'Partner\'s share of income, deductions and credits for tax year 2025.' });
  add({ title: `${h.name} Tear Sheet · Q3 2026`, category: 'Reports', date: '2026-10-02', holdingId: h.id, isNew: true, pages: 2, summary: `One page summary of ${h.name}: business, key metrics, valuation and your position.` });
  h.flows.filter((f) => f.amount > 0).slice(-2).forEach((f) => {
    add({ title: `${h.name} ${f.kind === 'sale' ? 'Tender Offer Proceeds' : 'Distribution'} Notice`, category: 'Notices', date: f.date, holdingId: h.id, entity: h.entity, pages: 1, summary: `Notice of ${f.kind === 'sale' ? 'tender proceeds' : 'distribution'} of $${f.amount.toLocaleString()}.` });
  });
});
const hp = HOLDINGS.find((h) => h.id === 'harborpoint')!;
hp.flows.filter((f) => f.amount < 0).forEach((f, i) => add({ title: `Harbor Point Capital Call Notice ${i + 1}`, category: 'Notices', date: f.date, holdingId: 'harborpoint', entity: hp.entity, pages: 2, summary: `Capital call of $${(-f.amount).toLocaleString()}.` }));
add({ title: `Harbor Point Capital Call Notice ${CAPITAL_CALL.number}`, category: 'Notices', date: '2026-10-01', holdingId: 'harborpoint', entity: hp.entity, pages: 2, isNew: true, summary: `Capital call of $${CAPITAL_CALL.amount.toLocaleString()} due October 31, 2026. ${CAPITAL_CALL.purpose}.` });
add({ title: 'Accredited Investor Verification Letter', category: 'Legal', date: '2026-09-12', pages: 1, summary: 'Third party verification of accredited investor status, valid for 90 days.' });

export const DOCS = docs.sort((a, b) => b.date.localeCompare(a.date));

export type Update = { id: string; date: string; title: string; body: string; type: 'Company' | 'Valuation' | 'Distribution' | 'Capital call' | 'Firm' | 'Tax' | 'Opportunity'; holdingId?: string; author: string };

export const UPDATES: Update[] = [
  { id: 'u1', date: '2026-10-03', type: 'Firm', title: 'Q3 2026 investor letter is available', author: 'SKK Investment Committee', body: 'Private market valuations continued to firm in the third quarter. Our healthcare venture companies were the strongest contributors, led by Lumora AI\'s Series C. In real estate, industrial leasing remained strong and our multifamily assets held occupancy above 95%. The full letter is in your document vault.' },
  { id: 'u2', date: '2026-10-01', type: 'Capital call', holdingId: 'harborpoint', title: 'Harbor Point capital call 4: $150,000 due October 31', author: 'SKK Real Estate', body: 'Proceeds fund the acquisition of a 310,000 square foot distribution center in Greer, SC, purchased at roughly 20% below replacement cost. After this call your unfunded commitment will be $350,000. Funding instructions are confirmed by phone with your relationship team; SKK will never change wire instructions by email.' },
  { id: 'u3', date: '2026-10-01', type: 'Firm', title: 'Q3 2026 capital account statements posted', author: 'SKK Investor Services', body: 'Statements for all three of your entities are now available, reflecting valuations as of September 30, 2026.' },
  { id: 'u4', date: '2026-09-18', type: 'Distribution', holdingId: 'coastal', title: 'Coastal Multifamily SPV II: $22,000 distribution paid', author: 'SKK Real Estate', body: 'The third quarter distribution was paid to Ellery Holdings LLC. Occupancy finished the quarter at 95.3% and renovated units continue to lease at a $210 monthly premium.' },
  { id: 'u5', date: '2026-09-01', type: 'Valuation', holdingId: 'brightwater', title: 'Brightwater Robotics marked up to $25M', author: 'SKK Ventures', body: 'Following a strategic partnership with a national third party logistics provider, we raised our mark on Brightwater from $22M to $25M post money.' },
  { id: 'u6', date: '2026-08-12', type: 'Valuation', holdingId: 'lumora', title: 'Lumora AI closes $70M Series C at $342M', author: 'SKK Ventures', body: 'Lumora closed a $70M Series C led by Calder Growth at a $342M post money valuation, 1.9 times the Series B price. Your position is now valued at $1.43M. SKK retains its board observer seat.' },
  { id: 'u7', date: '2026-07-21', type: 'Company', holdingId: 'halcyon', title: 'Halcyon Cardio crosses 48,000 patients monitored', author: 'SKK Ventures', body: 'Halcyon reached 48,000 patients monitored and 118 cardiology group customers. The company is preparing for a Series B process in early 2027.' },
  { id: 'u8', date: '2026-06-30', type: 'Valuation', holdingId: 'corvalis', title: 'Corvalis Diagnostics raises $40M Series C', author: 'SKK Ventures', body: 'Corvalis closed a $40M Series C at $133M post money, led by Harrow Health Capital. Existing investors have been offered a pro rata extension, closing November 14.' },
  { id: 'u9', date: '2026-06-30', type: 'Opportunity', holdingId: 'corvalis', title: 'Pro rata allocation available in Corvalis Series C extension', author: 'SKK Ventures', body: 'You may invest up to $180,000 at the Series C price. Use Request to increase investment on the Corvalis page to receive subscription documents.' },
  { id: 'u10', date: '2026-03-15', type: 'Valuation', holdingId: 'vireo', title: 'Vireo Therapeutics mark reduced to $110M', author: 'SKK Ventures', body: 'Following a protocol amendment that extends the Phase 2b timeline by roughly two quarters, we reduced our mark from $140M to $110M. Enrollment is on track and the safety profile remains clean.' },
  { id: 'u11', date: '2026-03-13', type: 'Tax', title: '2025 Schedule K1s are available', author: 'SKK Tax and Reporting', body: 'All 2025 K1s for your SKK vehicles are now in the Tax folder of your document vault. Your CPA can be granted read only access from your profile.' },
  { id: 'u12', date: '2025-12-15', type: 'Distribution', holdingId: 'arclight', title: 'Arclight tender offer completed', author: 'SKK Ventures', body: 'You sold 15% of your Arclight position in the company led tender for proceeds of $122,940, a 1.37 times multiple on the shares sold.' },
];

export type ChatMsg = { id: string; from: 'investor' | 'skk'; author: string; text: string; at: string; attachment?: string };
export type Thread = { id: string; subject: string; with: string; messages: ChatMsg[]; unread?: boolean };

export const THREADS: Thread[] = [
  {
    id: 't1', subject: 'Harbor Point capital call 4', with: 'Alexandra Reyes', unread: true,
    messages: [
      { id: 'm1', from: 'skk', author: 'Alexandra Reyes', at: '2026-10-01T14:05:00', text: 'Good afternoon Jonathan. Harbor Point issued capital call 4 today for $150,000, due October 31. The notice is in your vault. I\'d be glad to walk you and your advisor through the Greer acquisition on a quick call this week.', attachment: 'Harbor Point Capital Call Notice 4' },
    ],
  },
  {
    id: 't2', subject: 'Q3 statements for the trust', with: 'Ben Marsh',
    messages: [
      { id: 'm2', from: 'investor', author: 'Jonathan Ellery', at: '2026-09-29T10:12:00', text: 'Hi Ben, could you make sure our CPA gets the trust statement as soon as Q3 is posted?' },
      { id: 'm3', from: 'skk', author: 'Ben Marsh', at: '2026-09-29T11:40:00', text: 'Absolutely. I\'ve added Morgan & Pryce CPAs as a read only delegate for the Ellery Family Trust. They\'ll be notified automatically when the Q3 statement posts on October 1.' },
      { id: 'm4', from: 'skk', author: 'Ben Marsh', at: '2026-10-01T09:02:00', text: 'Q3 statements are live and your CPA has been notified.', attachment: 'Q3 2026 Consolidated Capital Account Statement' },
    ],
  },
  {
    id: 't3', subject: 'Welcome to the new investor portal', with: 'SKK Investor Services',
    messages: [
      { id: 'm5', from: 'skk', author: 'SKK Investor Services', at: '2026-09-15T08:00:00', text: 'Welcome. Your statements, tax documents and every investment now live in one place. Message your team here any time; we respond within one business day, usually much sooner.' },
    ],
  },
];

export type ReqStatus = 'Submitted' | 'In review' | 'In progress' | 'Awaiting signature' | 'Completed';
export const REQ_STEPS: ReqStatus[] = ['Submitted', 'In review', 'In progress', 'Completed'];
export type ServiceRequest = {
  id: string; type: string; title: string; detail: string; status: ReqStatus; created: string; updated: string;
  owner: string; holdingId?: string; amount?: number; entity?: string; log: { at: string; text: string }[];
};

export const REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ 1051', type: 'Update request', title: 'Vireo Therapeutics: Phase 2b enrollment and timeline', holdingId: 'vireo',
    detail: 'Can you share the latest on enrollment pace and whether the Q2 2027 topline date still holds?', status: 'In progress',
    created: '2026-09-24T09:30:00', updated: '2026-09-26T15:10:00', owner: 'Alexandra Reyes',
    log: [{ at: '2026-09-24T09:30:00', text: 'Request submitted' }, { at: '2026-09-24T10:02:00', text: 'Assigned to Alexandra Reyes' }, { at: '2026-09-26T15:10:00', text: 'Call with Vireo CEO scheduled for Oct 9; written summary to follow' }],
  },
  {
    id: 'REQ 1042', type: 'Paperwork', title: 'Accredited investor verification letter', entity: 'Ellery Family Trust',
    detail: 'Needed for the Harbor Point II subscription.', status: 'Completed',
    created: '2026-09-08T13:00:00', updated: '2026-09-12T16:45:00', owner: 'Ben Marsh',
    log: [{ at: '2026-09-08T13:00:00', text: 'Request submitted' }, { at: '2026-09-09T09:15:00', text: 'Sent to third party verifier' }, { at: '2026-09-12T16:45:00', text: 'Letter delivered to your document vault' }],
  },
];

export const FIRM_INVESTORS = [
  { name: 'Jonathan Ellery', entities: 3, holdings: 9, value: 0, since: 2022, status: 'Active' },
  { name: 'Whitcomb Family Office', entities: 5, holdings: 14, value: 18_420_000, since: 2015, status: 'Active' },
  { name: 'Marian & Paul Aldridge', entities: 2, holdings: 7, value: 4_120_000, since: 2019, status: 'Active' },
  { name: 'Hollis Foundation', entities: 1, holdings: 6, value: 9_870_000, since: 2017, status: 'Active' },
  { name: 'Dr. Samuel Okafor', entities: 2, holdings: 5, value: 2_310_000, since: 2021, status: 'Active' },
  { name: 'Brenner Holdings LLC', entities: 1, holdings: 8, value: 6_750_000, since: 2018, status: 'Active' },
  { name: 'Kavya & Arjun Patel', entities: 2, holdings: 4, value: 1_640_000, since: 2023, status: 'Onboarding' },
  { name: 'Thornton Irrevocable Trust', entities: 1, holdings: 9, value: 5_280_000, since: 2016, status: 'Active' },
];

export const CALL_TRACKER = [
  { name: 'Whitcomb Family Office', amount: 600000, paid: true },
  { name: 'Hollis Foundation', amount: 450000, paid: true },
  { name: 'Brenner Holdings LLC', amount: 300000, paid: true },
  { name: 'Thornton Irrevocable Trust', amount: 300000, paid: false },
  { name: 'Ellery Family Trust', amount: 150000, paid: false },
  { name: 'Marian & Paul Aldridge', amount: 150000, paid: true },
  { name: 'Dr. Samuel Okafor', amount: 75000, paid: false },
];
