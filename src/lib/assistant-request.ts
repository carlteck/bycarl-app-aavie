export type AssistantRequest = {
  conversationId: string | null;
  message: string;
  clientMessageId: string;
};

/** Un renvoi conserve sa clé ; une autre question constitue une nouvelle demande. */
export function prepareAssistantRequest(
  previous: AssistantRequest | null,
  conversationId: string | null,
  message: string,
  createId: () => string,
): AssistantRequest {
  const cleaned = message.trim();
  if (
    previous?.conversationId === conversationId &&
    previous.message === cleaned
  ) {
    return previous;
  }
  return { conversationId, message: cleaned, clientMessageId: createId() };
}
