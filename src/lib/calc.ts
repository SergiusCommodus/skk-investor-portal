import { AS_OF, HOLDINGS, Holding, NAV_HISTORY } from '../data/portfolio';

const DAY = 86400000;

/** Annualized internal rate of return for dated cash flows (Newton with bisection fallback). */
export function xirr(flows: { date: string; amount: number }[]): number | null {
  if (flows.length < 2) return null;
  const t0 = new Date(flows[0].date).getTime();
  const pts = flows.map((f) => ({ t: (new Date(f.date).getTime() - t0) / DAY / 365, a: f.amount }));
  const npv = (r: number) => pts.reduce((s, p) => s + p.a / Math.pow(1 + r, p.t), 0);
  let lo = -0.99, hi = 10;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
    if (hi - lo < 1e-7) break;
  }
  return (lo + hi) / 2;
}

export function holdingStats(h: Holding) {
  const contributed = -h.flows.filter((f) => f.amount < 0).reduce((s, f) => s + f.amount, 0);
  const distributed = h.flows.filter((f) => f.amount > 0).reduce((s, f) => s + f.amount, 0);
  const moic = (h.value + distributed) / contributed;
  const unrealized = h.value - h.costBasis;
  const flows = [...h.flows, { date: AS_OF, amount: h.value }].sort((a, b) => a.date.localeCompare(b.date));
  const irr = xirr(flows);
  const unfunded = h.commitment ? h.commitment - contributed : 0;
  return { contributed, distributed, moic, unrealized, irr, unfunded };
}

export function portfolioStats(list: Holding[] = HOLDINGS) {
  const value = list.reduce((s, h) => s + h.value, 0);
  const all = list.map(holdingStats);
  const contributed = all.reduce((s, x) => s + x.contributed, 0);
  const distributed = all.reduce((s, x) => s + x.distributed, 0);
  const unrealized = all.reduce((s, x) => s + x.unrealized, 0);
  const unfunded = all.reduce((s, x) => s + x.unfunded, 0);
  const flows = list.flatMap((h) => h.flows).concat([{ date: AS_OF, amount: value, kind: 'distribution' as const }])
    .sort((a, b) => a.date.localeCompare(b.date));
  const irr = xirr(flows);
  return { value, contributed, distributed, unrealized, unfunded, moic: (value + distributed) / contributed, irr, count: list.length };
}

export const TOTAL = portfolioStats();
NAV_HISTORY[NAV_HISTORY.length - 1].value = TOTAL.value;

export const QTR_CHANGE = TOTAL.value - NAV_HISTORY[NAV_HISTORY.length - 2].value;
export const QTR_PCT = QTR_CHANGE / NAV_HISTORY[NAV_HISTORY.length - 2].value;

export function byStrategy() {
  const map = new Map<string, number>();
  HOLDINGS.forEach((h) => map.set(h.strategy, (map.get(h.strategy) || 0) + h.value));
  return [...map.entries()].map(([k, v]) => ({ label: k, value: v }));
}

export function bySector() {
  const map = new Map<string, number>();
  HOLDINGS.forEach((h) => map.set(h.sector, (map.get(h.sector) || 0) + h.value));
  return [...map.entries()].map(([k, v]) => ({ label: k, value: v })).sort((a, b) => b.value - a.value);
}

/** Every cash movement across the portfolio, newest first. */
export function ledger() {
  return HOLDINGS.flatMap((h) => h.flows.map((f) => ({ ...f, holding: h })))
    .sort((a, b) => b.date.localeCompare(a.date));
}
