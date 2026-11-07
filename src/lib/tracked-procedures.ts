import { apiFetch } from '@/lib/api';
import { asDay, asId, asOneOf, asOptionalText, asRecord, asText } from '@/lib/remote-values';

const PROCEDURE_STATUSES = ['a_jour', 'action_requise', 'en_retard'] as const;
const STEP_STATUSES = ['pending', 'active', 'done'] as const;

export type TrackedProcedure = {
  id: string;
  title: string;
  status: (typeof PROCEDURE_STATUSES)[number];
  progress: number;
  deadlineTitle?: string;
  deadlineDate?: string;
  steps: { title: string; detail?: string; status: (typeof STEP_STATUSES)[number] }[];
};

export function mapTrackedProcedure(row: unknown): TrackedProcedure | null {
  const value = asRecord(row);
  const id = asId(value?.id);
  const title = asText(value?.title);
  const status = asOneOf(value?.status, PROCEDURE_STATUSES);
  const progress = value?.progress;
  if (!id || !title || !status || typeof progress !== 'number' || !Number.isFinite(progress)) return null;
  const rows = Array.isArray(value?.steps) ? value.steps : [];
  return {
    id,
    title,
    status,
    progress: Math.min(100, Math.max(0, Math.trunc(progress))),
    deadlineTitle: asOptionalText(value?.deadline_title),
    deadlineDate: asDay(value?.deadline_date) ?? undefined,
    steps: rows.flatMap((row) => {
      const step = asRecord(row);
      const stepTitle = asText(step?.title);
      const stepStatus = asOneOf(step?.status, STEP_STATUSES);
      return stepTitle && stepStatus ? [{ title: stepTitle, detail: asOptionalText(step?.detail), status: stepStatus }] : [];
    }),
  };
}

export async function fetchTrackedProcedures(signal: AbortSignal): Promise<TrackedProcedure[]> {
  const payload = asRecord(await apiFetch<unknown>('/procedures.php', { signal }));
  const rows = payload?.procedures;
  return (Array.isArray(rows) ? rows : []).map(mapTrackedProcedure).filter((item): item is TrackedProcedure => item !== null);
}
