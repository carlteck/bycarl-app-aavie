import type { PageResult } from '@/hooks/use-remote-list';
import { apiFetch } from '@/lib/api';
import {
  asEntityId,
  asId,
  asInstant,
  asOneOf,
  asRecord,
  asText,
} from '@/lib/remote-values';
import { PAGE_SIZE } from '@/lib/paging';

export const TICKET_STATUSES = [
  'open',
  'pending',
  'resolved',
  'closed',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_CATEGORIES = [
  { value: 'compte', label: 'Mon compte' },
  { value: 'demarche', label: 'Une démarche' },
  { value: 'paiement', label: 'Paiement ou forfait' },
  { value: 'technique', label: 'Un problème technique' },
  { value: 'autre', label: 'Autre question' },
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]['value'];
const CATEGORY_VALUES = TICKET_CATEGORIES.map((item) => item.value);

export const SUBJECT_MIN = 3;
export const SUBJECT_MAX = 150;
export const MESSAGE_MAX = 4000;
/** Un fil de support reste court ; au-delà, l'historique ancien n'est pas rechargé. */
const THREAD_LIMIT = 500;

export type SupportTicket = {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  lastMessageAt: string;
};

export type SupportMessage = {
  id: string;
  author: 'user' | 'staff';
  body: string;
  createdAt: string;
};

export type SupportThread = {
  ticket: SupportTicket;
  messages: SupportMessage[];
};

export type StatusFilter = TicketStatus | 'all';

export const STATUS_META: Record<
  TicketStatus,
  { label: string; hint: string }
> = {
  open: { label: 'Ouverte', hint: 'Notre équipe va vous répondre.' },
  pending: {
    label: 'En attente',
    hint: 'Nous attendons votre réponse pour avancer.',
  },
  resolved: {
    label: 'Résolue',
    hint: 'Une réponse a été apportée. Répondez pour la rouvrir.',
  },
  closed: { label: 'Fermée', hint: 'Cette demande est terminée.' },
};

export function mapTicket(row: unknown): SupportTicket | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const status = asOneOf(value.status, TICKET_STATUSES);
  const subject = asText(value.subject);
  const lastMessageAt = asInstant(value.updated_at ?? value.created_at);
  if (!id || !status || !subject || !lastMessageAt) return null;
  return {
    id,
    subject,
    status,
    lastMessageAt,
    category: asOneOf(value.category, CATEGORY_VALUES) ?? 'autre',
  };
}

export function mapMessage(row: unknown): SupportMessage | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asEntityId(value.id);
  const role = asOneOf(value.author_role, ['client', 'admin', 'user', 'staff'] as const);
  const author = role === 'client' || role === 'user' ? 'user' : role ? 'staff' : null;
  const body = asText(value.body);
  const createdAt = asInstant(value.created_at);
  if (!id || !author || !body || !createdAt) return null;
  return { id, author, body, createdAt };
}

export async function fetchTickets(
  page: number,
  filter: StatusFilter,
  signal: AbortSignal,
): Promise<PageResult<SupportTicket>> {
  const payload = await apiFetch<unknown>('/support-tickets.php', { signal });
  const rows = asRecord(payload)?.tickets;
  const items = (Array.isArray(rows) ? rows : [])
    .map(mapTicket)
    .filter((item): item is SupportTicket => item !== null)
    .filter((item) => filter === 'all' || item.status === filter);
  const start = page * PAGE_SIZE;
  return { items: items.slice(start, start + PAGE_SIZE), hasMore: items.length > start + PAGE_SIZE };
}

export async function fetchThread(
  id: string,
  signal: AbortSignal,
): Promise<SupportThread | null> {
  const payload = await apiFetch<unknown>(`/support-ticket.php?id=${encodeURIComponent(id)}`, { signal });
  const value = asRecord(payload);
  const ticket = mapTicket(value?.ticket);
  if (!ticket) return null;
  const rows = value?.messages;
  return {
    ticket,
    messages: (Array.isArray(rows) ? rows : []).slice(0, THREAD_LIMIT)
      .map(mapMessage)
      .filter((item): item is SupportMessage => item !== null),
  };
}

export type NewTicketIds = { ticketId: string; messageId: string };
export function newTicketIds(): NewTicketIds {
  return { ticketId: '', messageId: '' };
}

export async function createTicket(
  _userId: string,
  input: { subject: string; category: TicketCategory; body: string },
  _ids: NewTicketIds,
): Promise<string> {
  const payload = await apiFetch<unknown>('/support-tickets.php', {
    method: 'POST',
    body: JSON.stringify({ subject: input.subject.trim(), message: input.body.trim() }),
  });
  const id = asId(asRecord(asRecord(payload)?.ticket)?.id);
  if (!id) throw new Error('Réponse inattendue du serveur.');
  return id;
}

export async function sendMessage(
  _userId: string,
  ticketId: string,
  body: string,
  _messageId?: string,
): Promise<void> {
  await apiFetch(`/support-ticket.php?id=${encodeURIComponent(ticketId)}`, {
    method: 'POST',
    body: JSON.stringify({ message: body.trim() }),
  });
}
