import type { BudgetEntry, BudgetKind } from './sync-types';

export type { BudgetEntry, BudgetKind } from './sync-types';

export const INCOME_CATEGORIES = [
  'Salaire',
  'Prestations',
  'Pension',
  'Autres revenus',
] as const;

export const EXPENSE_CATEGORIES = [
  'Logement',
  'Alimentation',
  'Transport',
  'Santé',
  'Factures',
  'Loisirs',
  'Autres dépenses',
] as const;

export const KIND_LABEL: Record<BudgetKind, string> = {
  income: 'Revenu',
  expense: 'Dépense',
};

/** `numeric(10,2)` côté Supabase : 99 999 999,99 € au maximum. */
export const MAX_CENTS = 9_999_999_999;
export const LABEL_MAX = 190;

/**
 * « 12,5 », « 12.50 », « 1 200,00 » → centimes entiers. Jamais de flottant : 0,1 + 0,2 ne fait
 * pas 0,3 et un solde de budget doit tomber juste. Refuse zéro, négatif (le sens est le `type`),
 * plus de deux décimales et tout ce qui dépasse la colonne.
 */
export function parseAmountToCents(input: string): number | null {
  const text = input.replace(/[\s  ]/g, '').replace(',', '.');
  const match = /^(\d{1,8})(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  const cents =
    Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0') || 0);
  return cents > 0 && cents <= MAX_CENTS ? cents : null;
}

/** 123456 → « 1 234,56 € » (espaces insécables : le montant ne se coupe pas en fin de ligne). */
export function formatCents(cents: number, sign?: '+' | '−'): string {
  const whole = Math.floor(Math.abs(cents) / 100);
  const fraction = String(Math.abs(cents) % 100).padStart(2, '0');
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const prefix = cents < 0 ? '−' : (sign ?? '');
  return `${prefix}${grouped},${fraction} €`;
}

export type BudgetPeriod = 'month' | 'previous' | 'all';

export const PERIOD_OPTIONS: readonly { value: BudgetPeriod; label: string }[] =
  [
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'previous', label: 'Mois dernier' },
    { value: 'all', label: 'Tout' },
  ];

export const KIND_OPTIONS: readonly {
  value: BudgetKind | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'Tout' },
  { value: 'income', label: 'Revenus' },
  { value: 'expense', label: 'Dépenses' },
];

/** `AAAA-MM` du mois visé, ou `null` pour « tout ». `today` = `AAAA-MM-JJ`. */
export function monthKey(period: BudgetPeriod, today: string): string | null {
  if (period === 'all') return null;
  const [year, month] = today.split('-').map(Number);
  if (period === 'month') return today.slice(0, 7);
  const previous = month === 1 ? [year - 1, 12] : [year, month - 1];
  return `${previous[0]}-${String(previous[1]).padStart(2, '0')}`;
}

export function inMonth(entry: BudgetEntry, key: string | null): boolean {
  return key === null || entry.dateISO.startsWith(key);
}

export type BudgetSummary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

export function summarize(entries: readonly BudgetEntry[]): BudgetSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const entry of entries) {
    if (entry.kind === 'income') incomeCents += entry.amountCents;
    else expenseCents += entry.amountCents;
  }
  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  };
}

/** Plus récent d'abord ; l'identifiant départage deux opérations du même jour de façon stable. */
export function compareEntries(a: BudgetEntry, b: BudgetEntry): number {
  return b.dateISO.localeCompare(a.dateISO) || a.id.localeCompare(b.id);
}

/**
 * Validation d'une ligne lue sur l'appareil ou reçue de Supabase : une ligne inexploitable est
 * écartée plutôt que de fausser un total.
 */
export function toBudgetEntry(payload: unknown): BudgetEntry | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (
    typeof p.id !== 'string' ||
    typeof p.label !== 'string' ||
    typeof p.category !== 'string' ||
    typeof p.dateISO !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.dateISO) ||
    (p.kind !== 'income' && p.kind !== 'expense') ||
    typeof p.amountCents !== 'number' ||
    !Number.isInteger(p.amountCents) ||
    p.amountCents < 0
  )
    return null;
  return {
    id: p.id,
    label: p.label,
    category: p.category,
    dateISO: p.dateISO,
    kind: p.kind,
    amountCents: p.amountCents,
  };
}
