import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import type { PageResult } from '@/hooks/use-remote-list';
import { pageRange, toPage } from '@/lib/paging';
import {
  asId,
  asInstant,
  asOneOf,
  asRecord,
  asText,
} from '@/lib/remote-values';
import { supabase } from '@/lib/supabase';

/**
 * Nom de la Supabase Edge Function qui répond à l'usager. ⚠️ Elle n'existe pas encore : aucune
 * clé d'IA ne doit jamais entrer dans l'application, la fonction est le seul endroit où elle
 * vivra. Contrat attendu :
 *
 *   POST  { conversation_id: uuid | null, message: string, client_message_id: uuid }
 *   200   { conversation_id: uuid }        — les messages sont écrits en base par la fonction
 *   401   session invalide                  402 crédits insuffisants
 *   429   trop de demandes                  404/5xx service indisponible
 *
 * Le mobile relit ensuite l'historique en base : c'est la seule source de vérité, rien n'est
 * reconstruit à partir de la réponse HTTP. `client_message_id` rend un renvoi (coupure réseau
 * après traitement) dédoublonnable côté serveur.
 */
export const ASSISTANT_FUNCTION = 'assistant-chat';
export const ASSISTANT_TIMEOUT_MS = 60_000;
export const QUESTION_MAX = 4000;

export type AssistantConversation = {
  id: string;
  title: string;
  lastMessageAt: string;
};

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type AssistantThread = {
  conversation: AssistantConversation | null;
  messages: AssistantMessage[];
};

export type CreditBalance = {
  balance: number;
  monthlyAllowance: number;
  planLabel?: string;
};

export type AssistantFailure =
  'credits' | 'rate_limit' | 'unavailable' | 'network' | 'auth' | 'unknown';

export class AssistantError extends Error {
  constructor(readonly kind: AssistantFailure) {
    super(kind);
    this.name = 'AssistantError';
  }
}

export function assistantErrorMessage(kind: AssistantFailure): string {
  switch (kind) {
    case 'credits':
      return 'Vos crédits sont épuisés. Votre question n’a pas été envoyée.';
    case 'rate_limit':
      return 'Trop de demandes en peu de temps. Patientez un instant puis réessayez.';
    case 'unavailable':
      return 'L’assistant n’est pas disponible pour le moment. Votre question n’a pas été envoyée et aucun crédit n’a été utilisé.';
    case 'network':
      return 'Connexion impossible. Vérifiez votre réseau : votre question est conservée, vous pouvez la renvoyer.';
    case 'auth':
      return 'Votre session a expiré. Reconnectez-vous pour continuer.';
    default:
      return 'Un problème est survenu. Votre question est conservée, vous pouvez la renvoyer.';
  }
}

const CONVERSATION_COLUMNS = 'id, title, last_message_at';

export function mapConversation(row: unknown): AssistantConversation | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  const lastMessageAt = asInstant(value.last_message_at);
  if (!id || !title || !lastMessageAt) return null;
  return { id, title, lastMessageAt };
}

export function mapAssistantMessage(row: unknown): AssistantMessage | null {
  const value = asRecord(row);
  if (!value) return null;
  // `bigint` : PostgREST le renvoie en nombre ; l'identifiant reste opaque pour l'écran.
  const rawId = value.id;
  const id =
    typeof rawId === 'number' || typeof rawId === 'string' ? String(rawId) : '';
  const role = asOneOf(value.role, ['user', 'assistant'] as const);
  const content = asText(value.content);
  const createdAt = asInstant(value.created_at);
  if (!id || !role || !content || !createdAt) return null;
  return { id, role, content, createdAt };
}

export function mapCredits(row: unknown): CreditBalance | null {
  const value = asRecord(row);
  if (!value) return null;
  const { balance, monthly_allowance: allowance } = value;
  if (
    typeof balance !== 'number' ||
    !Number.isFinite(balance) ||
    typeof allowance !== 'number' ||
    !Number.isFinite(allowance)
  )
    return null;
  return {
    balance: Math.trunc(balance),
    monthlyAllowance: Math.trunc(allowance),
    planLabel: asText(value.plan_label) || undefined,
  };
}

export async function fetchConversationsPage(
  page: number,
  signal: AbortSignal,
): Promise<PageResult<AssistantConversation>> {
  const { data, error } = await supabase
    .from('mobile_assistant_conversations')
    .select(CONVERSATION_COLUMNS)
    .order('last_message_at', { ascending: false })
    .order('id')
    .range(...pageRange(page))
    .abortSignal(signal);
  if (error) throw error;
  return toPage(data, mapConversation);
}

/** Toute l'histoire d'une conversation ; un nouvel échange n'a ni conversation ni message. */
export async function fetchThread(
  conversationId: string | null,
  signal: AbortSignal,
): Promise<AssistantThread> {
  if (!conversationId) return { conversation: null, messages: [] };
  const [conversation, messages] = await Promise.all([
    supabase
      .from('mobile_assistant_conversations')
      .select(CONVERSATION_COLUMNS)
      .eq('id', conversationId)
      .abortSignal(signal)
      .maybeSingle(),
    supabase
      .from('mobile_assistant_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('id')
      .limit(500)
      .abortSignal(signal),
  ]);
  if (conversation.error) throw conversation.error;
  if (messages.error) throw messages.error;
  return {
    conversation: mapConversation(conversation.data),
    messages: ((messages.data ?? []) as unknown[])
      .map(mapAssistantMessage)
      .filter((item): item is AssistantMessage => item !== null),
  };
}

/** `null` = aucune ligne publiée pour ce compte (le site ne l'a pas encore alimentée). */
export async function fetchCredits(
  signal: AbortSignal,
): Promise<CreditBalance | null> {
  const { data, error } = await supabase
    .from('mobile_credit_balances')
    .select('balance, monthly_allowance, plan_label')
    .abortSignal(signal)
    .maybeSingle();
  if (error) throw error;
  return mapCredits(data);
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('mobile_assistant_conversations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

function toAssistantError(error: unknown): AssistantError {
  if (error instanceof FunctionsHttpError) {
    const status = (error.context as { status?: number } | undefined)?.status;
    if (status === 401) return new AssistantError('auth');
    if (status === 402) return new AssistantError('credits');
    if (status === 429) return new AssistantError('rate_limit');
    if (status === 404 || (status !== undefined && status >= 500))
      return new AssistantError('unavailable');
    return new AssistantError('unknown');
  }
  if (error instanceof FunctionsRelayError)
    return new AssistantError('unavailable');
  if (error instanceof FunctionsFetchError)
    return new AssistantError('network');
  return new AssistantError('unknown');
}

export async function sendAssistantMessage(input: {
  conversationId: string | null;
  message: string;
  clientMessageId: string;
  signal: AbortSignal;
}): Promise<{ conversationId: string }> {
  const { data, error } = await supabase.functions.invoke(ASSISTANT_FUNCTION, {
    body: {
      conversation_id: input.conversationId,
      message: input.message,
      client_message_id: input.clientMessageId,
    },
    signal: input.signal,
  });
  if (error) throw toAssistantError(error);
  const conversationId = asId(asRecord(data)?.conversation_id);
  if (!conversationId) throw new AssistantError('unknown');
  return { conversationId };
}
