import type { ProcedureCategory } from './procedures';

export type Reminder = {
  id: string;
  title: string;
  /** Date d'échéance au format ISO (AAAA-MM-JJ), pour un tri chronologique fiable. */
  dateISO: string;
  category: ProcedureCategory;
  notifyEnabled: boolean;
  /** Nombre de jours avant l'échéance auquel le rappel doit s'afficher. */
  leadDays: number;
};

export type LeadDaysPreset = { label: string; value: number };

export const LEAD_DAYS_PRESETS: LeadDaysPreset[] = [
  { label: 'Le jour même', value: 0 },
  { label: '3 jours avant', value: 3 },
  { label: '1 semaine avant', value: 7 },
  { label: '1 mois avant', value: 30 },
];
