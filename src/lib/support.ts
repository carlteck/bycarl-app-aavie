import * as Crypto from 'expo-crypto';

import type { PageResult } from '@/hooks/use-remote-list';
import {
  asId,
  asInstant,
  asOneOf,
  asRecord,
  asText,
} from '@/lib/remote-values';
import { pageRange, toPage } from '@/lib/paging';
import { supabase } from '@/lib/supabase';

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
  const lastMessageAt = asInstant(value.last_message_at);
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
  const id = asId(value.id);
  const author = asOneOf(value.author_role, ['user', 'staff'] as const);
  const body = asText(value.body);
  const createdAt = asInstant(value.created_at);
  if (!id || !author || !body || !createdAt) return null;
  return { id, author, body, createdAt };
}

const TICKET_COLUMNS = 'id, subject, category, status, last_message_at';

export async function fetchTickets(
  page: number,
  filter: StatusFilter,
  signal: AbortSignal,
): Promise<PageResult<SupportTicket>> {
  let query = supabase
    .from('mobile_support_tickets')
    .select(TICKET_COLUMNS)
    .order('last_message_at', { ascending: false })
    .order('id')
    .range(...pageRange(page));
  if (filter !== 'all') query = query.eq('status', filter);
  const { data, error } = await query.abortSignal(signal);
  if (error) throw error;
  return toPage(data, mapTicket);
}

export async function fetchThread(
  id: string,
  signal: AbortSignal,
): Promise<SupportThread | null> {
  const [ticketResult, messagesResult] = await Promise.all([
    supabase
      .from('mobile_support_tickets')
      .select(TICKET_COLUMNS)
      .eq('id', id)
      .abortSignal(signal)
      .maybeSingle(),
    supabase
      .from('mobile_support_messages')
      .select('id, author_role, body, created_at')
      .eq('ticket_id', id)
      .order('created_at')
      .order('id')
      .limit(THREAD_LIMIT)
      .abortSignal(signal),
  ]);
  if (ticketResult.error) throw ticketResult.error;
  if (messagesResult.error) throw messagesResult.error;
  const ticket = mapTicket(ticketResult.data);
  if (!ticket) return null;
  return {
    ticket,
    messages: ((messagesResult.data ?? []) as unknown[])
      .map(mapMessage)
      .filter((item): item is SupportMessage => item !== null),
  };
}

const UNIQUE_VIOLATION = '23505';

/**
 * Identifiants choisis par l'appelant AVANT l'envoi : rejouer la même demande après une coupure
 * réseau retombe sur les mêmes lignes (violation d'unicité ignorée) au lieu de créer un doublon.
 */
export type NewTicketIds = { ticketId: string; messageId: string };
export function newTicketIds(): NewTicketIds {
  return { ticketId: Crypto.randomUUID(), messageId: Crypto.randomUUID() };
}

export async function createTicket(
  userId: string,
  input: { subject: string; category: TicketCategory; body: string },
  ids: NewTicketIds,
): Promise<string> {
  const ticket = await supabase.from('mobile_support_tickets').insert({
    id: ids.ticketId,
    user_id: userId,
    subject: input.subject.trim(),
    category: input.category,
  });
  if (ticket.error && ticket.error.code !== UNIQUE_VIOLATION)
    throw ticket.error;
  await sendMessage(userId, ids.ticketId, input.body, ids.messageId);
  return ids.ticketId;
}

export async function sendMessage(
  userId: string,
  ticketId: string,
  body: string,
  messageId: string = Crypto.randomUUID(),
): Promise<void> {
  const { error } = await supabase.from('mobile_support_messages').insert({
    id: messageId,
    ticket_id: ticketId,
    user_id: userId,
    body: body.trim(),
  });
  if (error && error.code !== UNIQUE_VIOLATION) throw error;
}

export async function closeTicket(ticketId: string): Promise<void> {
  const { error } = await supabase
    .from('mobile_support_tickets')
    .update({ status: 'closed' })
    .eq('id', ticketId);
  if (error) throw error;
}
