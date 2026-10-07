import { AS_OF, HOLDINGS } from '../data/portfolio';
import { DOCS, FIRM_INVESTORS } from '../data/content';
import { holdingStats, ledger } from '../lib/calc';

/**
 * Carta integration layer.
 *
 * Carta exposes a REST API behind OAuth 2.0 (authorization code for third party data,
 * client credentials for your own account), with read scopes named read_<package>_<resource>.
 * The scope names below are taken from Carta's public API documentation (docs.carta.com).
 *
 * This demo never calls Carta. `CartaSource` below is the contract a real connector fills in,
 * and the CSV helpers let a team tie the portal to a Carta export today, with no credentials.
 * Exact endpoint paths and response fields must be confirmed against the Carta developer
 * documentation once SKK has API access, so they are intentionally not hard coded here.
 */

export type ScopeMap = { scope: string; resource: string; feeds: string; page: string; confidence: 'Documented scope' | 'Confirm with Carta' };

export const CARTA_SCOPES: ScopeMap[] = [
  { scope: 'read_investor_firms', resource: 'Firm', feeds: 'Firm name and fund family', page: 'Header and branding', confidence: 'Documented scope' },
  { scope: 'read_investor_funds', resource: 'Funds and vehicles', feeds: 'Vehicle names, commitments, vintage', page: 'Holdings, tear sheets', confidence: 'Documented scope' },
  { scope: 'read_investor_partners', resource: 'Partners (LPs)', feeds: 'Investors, entities, commitments', page: 'Firm investors list, profile', confidence: 'Documented scope' },
  { scope: 'read_investor_fundperformance', resource: 'Fund performance', feeds: 'Net IRR, multiples, NAV', page: 'Overview KPIs', confidence: 'Documented scope' },
  { scope: 'read_portfolio_securities', resource: 'Securities held', feeds: 'Positions, shares, cost basis', page: 'Holdings', confidence: 'Documented scope' },
  { scope: 'read_portfolio_transactions', resource: 'Transactions', feeds: 'Contributions, distributions, sales', page: 'Capital activity ledger', confidence: 'Documented scope' },
  { scope: 'read_portfolio_issuervaluations', resource: 'Issuer valuations', feeds: 'Quarterly marks and valuation history', page: 'Tear sheet valuation chart', confidence: 'Documented scope' },
  { scope: 'read_portfolio_fundinvestmentdocuments', resource: 'Fund investment documents', feeds: 'Statements, notices, legal documents', page: 'Document vault', confidence: 'Documented scope' },
  { scope: 'Capital account statements and K1s', resource: 'LP reporting', feeds: 'Per investor tax and capital statements', page: 'Document vault', confidence: 'Confirm with Carta' },
];

export type SyncCounts = { holdings: number; transactions: number; valuations: number; partners: number; documents: number };

export function syncCounts(): SyncCounts {
  return {
    holdings: HOLDINGS.length,
    transactions: ledger().length,
    valuations: HOLDINGS.reduce((s, h) => s + h.marks.length, 0),
    partners: FIRM_INVESTORS.length,
    documents: DOCS.length,
  };
}

/** What a real connector implements. The portal reads only through this interface. */
export interface CartaSource {
  listFunds(): Promise<unknown[]>;
  listPartners(): Promise<unknown[]>;
  listSecurities(): Promise<unknown[]>;
  listTransactions(since?: string): Promise<unknown[]>;
  listValuations(since?: string): Promise<unknown[]>;
  listDocuments(since?: string): Promise<unknown[]>;
}

/* ---------- CSV ---------- */

const esc = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export const toCsv = (rows: (string | number)[][]) => rows.map((r) => r.map(esc).join(',')).join('\n');

export function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [], cur = '', q = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((x) => x.trim() !== '')) out.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== '')) out.push(row);
  return out;
}

export const EXPORTS = {
  holdings: {
    file: 'skk_holdings.csv', label: 'Holdings', scope: 'read_portfolio_securities',
    build: () => toCsv([
      ['holding_id', 'name', 'vehicle', 'instrument', 'holder_entity', 'strategy', 'shares', 'cost_basis', 'current_value', 'as_of'],
      ...HOLDINGS.map((h) => [h.id, h.name, h.vehicle, h.instrument, h.entity, h.strategy, h.shares ?? '', h.costBasis, h.value, AS_OF]),
    ]),
  },
  transactions: {
    file: 'skk_transactions.csv', label: 'Transactions', scope: 'read_portfolio_transactions',
    build: () => toCsv([
      ['holding_id', 'date', 'kind', 'amount'],
      ...ledger().slice().reverse().map((l) => [l.holding.id, l.date, l.kind, l.amount]),
    ]),
  },
  valuations: {
    file: 'skk_valuations.csv', label: 'Valuations', scope: 'read_portfolio_issuervaluations',
    build: () => toCsv([
      ['holding_id', 'as_of', 'current_value', 'moic', 'irr'],
      ...HOLDINGS.map((h) => { const s = holdingStats(h); return [h.id, AS_OF, h.value, s.moic.toFixed(4), s.irr == null ? '' : s.irr.toFixed(4)]; }),
    ]),
  },
  partners: {
    file: 'skk_investors.csv', label: 'Investors', scope: 'read_investor_partners',
    build: () => toCsv([
      ['investor', 'entities', 'holdings', 'since', 'status'],
      ...FIRM_INVESTORS.map((r) => [r.name, r.entities, r.holdings, r.since, r.status]),
    ]),
  },
} as const;
export type ExportKey = keyof typeof EXPORTS;

export function download(file: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = file;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Reconciliation ---------- */

export type Recon = {
  rows: { ref: string; name: string; portal: number | null; uploaded: number | null; diff: number | null; pct: number | null; status: 'Match' | 'Break' | 'Not in portal' | 'Missing from file' | 'Unreadable' }[];
  errors: string[];
  matched: number; breaks: number;
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
const HDR_ID = ['holdingid', 'id', 'security', 'securityid', 'issuer', 'name', 'holding', 'company'];
const HDR_VAL = ['currentvalue', 'value', 'fairvalue', 'fmv', 'nav', 'marketvalue', 'amount'];

/** Compares an uploaded valuation file to the portal. Tolerance is the allowed difference in percent. */
export function reconcile(text: string, tolerancePct = 0.5): Recon {
  const errors: string[] = [];
  const grid = parseCsv(text);
  if (grid.length < 2) return { rows: [], errors: ['The file needs a header row and at least one data row.'], matched: 0, breaks: 0 };
  const head = grid[0].map(norm);
  const iId = head.findIndex((h) => HDR_ID.includes(h));
  const iVal = head.findIndex((h) => HDR_VAL.includes(h));
  if (iId < 0) errors.push('No holding column found. Use a header such as holding_id or name.');
  if (iVal < 0) errors.push('No value column found. Use a header such as current_value.');
  if (errors.length) return { rows: [], errors, matched: 0, breaks: 0 };

  const seen = new Set<string>();
  const rows: Recon['rows'] = [];
  grid.slice(1).forEach((r, n) => {
    const ref = (r[iId] || '').trim();
    const h = HOLDINGS.find((x) => norm(x.id) === norm(ref) || norm(x.name) === norm(ref));
    const raw = (r[iVal] || '').replace(/[$,\s]/g, '');
    const v = raw === '' ? NaN : Number(raw);
    if (!Number.isFinite(v)) { rows.push({ ref: ref || `Row ${n + 2}`, name: h?.name || '', portal: h?.value ?? null, uploaded: null, diff: null, pct: null, status: 'Unreadable' }); return; }
    if (!h) { rows.push({ ref, name: '', portal: null, uploaded: v, diff: null, pct: null, status: 'Not in portal' }); return; }
    seen.add(h.id);
    const diff = v - h.value, pct = h.value ? (diff / h.value) * 100 : 0;
    rows.push({ ref, name: h.name, portal: h.value, uploaded: v, diff, pct, status: Math.abs(pct) <= tolerancePct ? 'Match' : 'Break' });
  });
  HOLDINGS.filter((h) => !seen.has(h.id)).forEach((h) => rows.push({ ref: h.id, name: h.name, portal: h.value, uploaded: null, diff: null, pct: null, status: 'Missing from file' }));
  return { rows, errors, matched: rows.filter((r) => r.status === 'Match').length, breaks: rows.filter((r) => r.status !== 'Match').length };
}

/** A realistic sample file: most lines tie out, two do not, one holding is missing. */
export function sampleRecon(): string {
  const lines: (string | number)[][] = [['holding_id', 'current_value']];
  HOLDINGS.forEach((h, i) => {
    if (h.id === 'riverside') return;
    const v = i === 2 ? Math.round(h.value * 1.034) : i === 5 ? Math.round(h.value * 0.981) : h.value;
    lines.push([h.id, v]);
  });
  return toCsv(lines);
}
