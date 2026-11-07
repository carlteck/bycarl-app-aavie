import { apiFetch } from '@/lib/api';
import {
  asEntityId,
  asInstant,
  asOptionalText,
  asRecord,
  asText,
} from '@/lib/remote-values';

export type CreditEntry = {
  id: string;
  delta: number;
  label: string;
  reason?: string;
  createdAt: string;
};

export type CreditsOverview = {
  balance: number | null;
  monthlyCredits: number;
  rolloverMonths: number;
  planName?: string;
  history: CreditEntry[];
};

export function mapCreditEntry(row: unknown): CreditEntry | null {
  const value = asRecord(row);
  const id = asEntityId(value?.id);
  const delta = value?.delta;
  const label = asText(value?.label);
  const createdAt = asInstant(value?.created_at);
  if (!id || typeof delta !== 'number' || !Number.isFinite(delta) || !label || !createdAt)
    return null;
  return { id, delta: Math.trunc(delta), label, reason: asOptionalText(value?.reason), createdAt };
}

export function mapCreditsOverview(row: unknown): CreditsOverview | null {
  const value = asRecord(row);
  if (!value) return null;
  const balance = value.balance;
  const monthlyCredits = value.monthly_credits;
  const rolloverMonths = value.rollover_months;
  if (
    (balance !== null && (typeof balance !== 'number' || !Number.isFinite(balance))) ||
    typeof monthlyCredits !== 'number' || !Number.isFinite(monthlyCredits) ||
    typeof rolloverMonths !== 'number' || !Number.isFinite(rolloverMonths)
  ) return null;
  const history = Array.isArray(value.history) ? value.history : [];
  return {
    balance: balance === null ? null : Math.trunc(balance),
    monthlyCredits: Math.trunc(monthlyCredits),
    rolloverMonths: Math.trunc(rolloverMonths),
    planName: asOptionalText(value.plan_name),
    history: history.map(mapCreditEntry).filter((item): item is CreditEntry => item !== null),
  };
}

export async function fetchCreditsOverview(signal: AbortSignal): Promise<CreditsOverview> {
  const result = mapCreditsOverview(await apiFetch<unknown>('/credits.php', { signal }));
  if (!result) throw new Error('Réponse inattendue du serveur.');
  return result;
}
