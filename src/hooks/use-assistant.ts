import { useCallback } from 'react';

import { useRemoteList } from '@/hooks/use-remote-list';
import { useRemoteResource } from '@/hooks/use-remote-resource';
import {
  fetchConversationsPage,
  fetchCredits,
  fetchThread,
  type AssistantConversation,
} from '@/lib/assistant';

const conversationKey = (item: AssistantConversation) => item.id;

export function useAssistantConversations() {
  return useRemoteList(fetchConversationsPage, conversationKey);
}

export function useAssistantThread(conversationId: string | null) {
  const load = useCallback(
    (signal: AbortSignal) => fetchThread(conversationId, signal),
    [conversationId],
  );
  return useRemoteResource(load);
}

export function useCredits() {
  return useRemoteResource(fetchCredits);
}
