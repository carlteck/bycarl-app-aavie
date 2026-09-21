import { useCallback } from 'react';

import { useRemoteList } from '@/hooks/use-remote-list';
import { useRemoteResource } from '@/hooks/use-remote-resource';
import {
  fetchThread,
  fetchTickets,
  type StatusFilter,
  type SupportTicket,
} from '@/lib/support';

const ticketKey = (ticket: SupportTicket) => ticket.id;

export function useSupportTickets(filter: StatusFilter) {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) => fetchTickets(page, filter, signal),
    [filter],
  );
  return useRemoteList(fetchPage, ticketKey);
}

export function useSupportThread(ticketId: string) {
  const load = useCallback(
    (signal: AbortSignal) => fetchThread(ticketId, signal),
    [ticketId],
  );
  return useRemoteResource(load);
}
