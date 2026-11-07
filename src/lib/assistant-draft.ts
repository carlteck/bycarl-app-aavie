// Passage en mémoire : la question administrative ne doit pas apparaître dans une URL.
let draft = '';
let sendOnOpen = false;

export function setAssistantDraft(value: string, autoSend = true): void {
  draft = value;
  sendOnOpen = autoSend;
}

export function shouldSendAssistantDraft(): boolean {
  return sendOnOpen;
}

export function readAssistantDraft(): string {
  return draft;
}

export function clearAssistantDraft(): void {
  draft = '';
  sendOnOpen = false;
}
