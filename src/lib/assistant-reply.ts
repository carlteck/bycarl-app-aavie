import { asRecord } from './remote-values';

const ACTION_LABELS: Record<string, string> = {
  create_deadline: 'Ajouter une échéance au planificateur',
  create_deadlines: 'Ajouter des échéances au planificateur',
  create_budget_entry: 'Ajouter une opération au budget',
  save_official_form: 'Enregistrer un formulaire officiel',
};

export function assistantReply(content: string): {
  text: string;
  actionLabel?: string;
  actionStatus?: string;
} {
  if (!content.trim().startsWith('{')) return { text: content };
  try {
    const value = asRecord(JSON.parse(content));
    if (value?.kind !== 'tool_action') return { text: content };
    return {
      text: typeof value.reply === 'string' ? value.reply : '',
      actionLabel:
        typeof value.tool === 'string'
          ? (ACTION_LABELS[value.tool] ?? 'Proposition de l’assistant')
          : 'Proposition de l’assistant',
      actionStatus: typeof value.status === 'string' ? value.status : 'pending',
    };
  } catch {
    return { text: content };
  }
}
