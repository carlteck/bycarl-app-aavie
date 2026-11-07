import type { PageResult } from '@/hooks/use-remote-list';
import { ApiError, apiFetch, NetworkError } from '@/lib/api';
import {
  asId,
  asInstant,
  asOneOf,
  asRecord,
  asText,
} from '@/lib/remote-values';

// Le serveur borne le traitement à 105 s ; le mobile lui laisse le temps de répondre.
export const ASSISTANT_TIMEOUT_MS = 120_000;
export const QUESTION_MAX = 4000;
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export type AssistantAttachment = {
  name: string;
  mediaType: string;
  size: number;
  data: string;
};

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
  truncated: boolean;
};

export type AssistantThread = {
  conversation: AssistantConversation | null;
  messages: AssistantMessage[];
};

export type CreditBalance = {
  balance: number | null;
  monthlyAllowance: number;
  planLabel?: string;
};

export type AssistantFailure =
  | 'credits'
  | 'rate_limit'
  | 'unavailable'
  | 'network'
  | 'auth'
  | 'account'
  | 'pending'
  | 'unknown';

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
      return 'L’assistant n’est pas disponible pour le moment. Votre question est conservée. Vérifiez l’historique avant de réessayer.';
    case 'pending':
      return 'Votre demande est encore en cours. Patientez puis réessayez la même question.';
    case 'network':
      return 'Connexion impossible. Vérifiez votre réseau : votre question est conservée, vous pouvez la renvoyer.';
    case 'auth':
      return 'Reconnectez-vous à votre compte AAVIE pour continuer. Votre question est conservée.';
    case 'account':
      return 'Connectez-vous avec un compte client du site AAVIE pour utiliser l’assistant. Votre question est conservée.';
    default:
      return 'Un problème est survenu. Votre question est conservée, vous pouvez la renvoyer.';
  }
}

function siteInstant(value: unknown): string | null {
  const text = asText(value);
  // Les dates MySQL du site sont exprimées dans le fuseau America/Cayenne.
  return asInstant(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)
      ? `${text.replace(' ', 'T')}-03:00`
      : text,
  );
}

export function mapConversation(row: unknown): AssistantConversation | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  const lastMessageAt = siteInstant(value.updated_at);
  if (!id || !title || !lastMessageAt) return null;
  return { id, title, lastMessageAt };
}

export function mapAssistantMessage(row: unknown): AssistantMessage | null {
  const value = asRecord(row);
  if (!value) return null;
  // Identifiant opaque : PDO peut renvoyer le bigint sous forme de chaîne.
  const rawId = value.id;
  const id =
    typeof rawId === 'number' || typeof rawId === 'string' ? String(rawId) : '';
  const role = asOneOf(value.role, ['user', 'assistant'] as const);
  const content = asText(value.content);
  const createdAt = siteInstant(value.created_at);
  if (!id || !role || !content || !createdAt) return null;
  return { id, role, content, createdAt, truncated: value.truncated === true };
}

export type AssistantQuota = {
  balance: number | null;
  cost: number;
  remainingQuestions: number | null;
  cloudConnected: boolean;
  documentCost: number;
};

export function mapAssistantQuota(row: unknown): AssistantQuota | null {
  const value = asRecord(row);
  if (!value) return null;
  const { balance, cost, document_cost: documentCost, remaining_questions: remaining } = value;
  if ((balance !== null && typeof balance !== 'number') || typeof cost !== 'number' || typeof documentCost !== 'number' || (remaining !== null && typeof remaining !== 'number') || typeof value.cloud_connected !== 'boolean') return null;
  return { balance, cost, documentCost, remainingQuestions: remaining, cloudConnected: value.cloud_connected };
}

export async function fetchAssistantQuota(signal: AbortSignal): Promise<AssistantQuota> {
  const quota = mapAssistantQuota(await apiFetch<unknown>('/ai/quota.php', { signal }));
  if (!quota) throw new Error('Réponse inattendue du serveur.');
  return quota;
}

export async function resolveAssistantAction(messageId: string, action: 'confirm' | 'cancel'): Promise<void> {
  await apiFetch('/ai/tool-confirm.php', {
    method: 'POST',
    body: JSON.stringify({ message_id: Number(messageId), action }),
  });
}

export function mapCredits(row: unknown): CreditBalance | null {
  const value = asRecord(row);
  if (!value) return null;
  const { balance, monthly_credits: allowance } = value;
  if (
    (balance !== null &&
      (typeof balance !== 'number' || !Number.isFinite(balance))) ||
    typeof allowance !== 'number' ||
    !Number.isFinite(allowance)
  )
    return null;
  return {
    balance: balance === null ? null : Math.trunc(balance),
    monthlyAllowance: Math.trunc(allowance),
    planLabel: asText(value.plan_name) || undefined,
  };
}

export async function fetchConversationsPage(
  page: number,
  signal: AbortSignal,
): Promise<PageResult<AssistantConversation>> {
  // L'API du site renvoie déjà tout l'historique : aucune pagination distante à simuler.
  if (page > 0) return { items: [], hasMore: false };
  const data = asRecord(
    await apiFetch<unknown>('/ai/conversations.php', { signal }),
  );
  if (!Array.isArray(data?.conversations))
    throw new Error('Réponse inattendue du serveur.');
  return {
    items: data.conversations
      .map(mapConversation)
      .filter((item): item is AssistantConversation => item !== null),
    hasMore: false,
  };
}

export async function fetchThread(
  conversationId: string | null,
  signal: AbortSignal,
): Promise<AssistantThread> {
  if (!conversationId) return { conversation: null, messages: [] };
  const data = asRecord(
    await apiFetch<unknown>(
      `/ai/conversation.php?id=${encodeURIComponent(conversationId)}`,
      { signal },
    ),
  );
  const conversation = mapConversation(data?.conversation);
  if (!conversation || !Array.isArray(data?.messages))
    throw new Error('Réponse inattendue du serveur.');
  return {
    conversation,
    messages: data.messages
      .map(mapAssistantMessage)
      .filter((item): item is AssistantMessage => item !== null),
  };
}

export async function fetchCredits(
  signal: AbortSignal,
): Promise<CreditBalance | null> {
  const credits = mapCredits(
    await apiFetch<unknown>('/credits.php', { signal }),
  );
  if (!credits) throw new Error('Réponse inattendue du serveur.');
  return credits;
}

export async function deleteConversation(id: string): Promise<void> {
  await apiFetch(`/ai/conversation.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<void> {
  const cleaned = title.trim();
  if (!cleaned || Array.from(cleaned).length > 190)
    throw new AssistantError('unknown');
  await apiFetch(`/ai/conversation.php?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: cleaned }),
  });
}

function toAssistantError(error: unknown): AssistantError {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 419)
      return new AssistantError('auth');
    if (error.status === 403 && error.code === 'mobile_account_required')
      return new AssistantError('account');
    if (error.status === 402) return new AssistantError('credits');
    if (error.status === 409) return new AssistantError('pending');
    if (error.status === 429) return new AssistantError('rate_limit');
    if (error.status === 404 || error.status >= 500)
      return new AssistantError('unavailable');
  }
  if (
    error instanceof NetworkError ||
    (error instanceof Error && error.name === 'AbortError')
  )
    return new AssistantError('network');
  return new AssistantError('unknown');
}

export async function sendAssistantMessage(input: {
  conversationId: string | null;
  message: string;
  clientMessageId: string;
  signal: AbortSignal;
  attachments?: AssistantAttachment[];
}): Promise<{ conversationId: string }> {
  try {
    const data = await apiFetch<unknown>('/ai/chat.php', {
      method: 'POST',
      signal: input.signal,
      body: JSON.stringify({
        question: input.message,
        conversation_id: input.conversationId,
        client_message_id: input.clientMessageId,
        ...(input.attachments?.length
          ? { attachments: input.attachments.map(({ name, data }) => ({ name, data })) }
          : {}),
      }),
    });
    const conversationId = asId(asRecord(data)?.conversation_id);
    if (!conversationId) throw new AssistantError('unknown');
    return { conversationId };
  } catch (error) {
    if (error instanceof AssistantError) throw error;
    throw toAssistantError(error);
  }
}
