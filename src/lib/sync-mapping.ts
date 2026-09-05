import type { Entity, LocalRecord, Payload, PendingChange } from './sync-types';

const profileFields = {
  civilite: 'civility',
  prenom: 'first_names',
  nom: 'birth_name',
  dateNaissance: 'birth_date',
  lieuNaissance: 'birth_place',
  adresse: 'address_line1',
  codePostal: 'postal_code',
  ville: 'city',
  telephone: 'phone',
  email: 'email',
};
export const tables: Record<Entity, string> = {
  profile: 'mobile_profiles',
  reminder: 'mobile_reminders',
  progress: 'mobile_procedure_progress',
};
export function toRemote(change: PendingChange): Payload {
  const p = change.payload;
  if (change.entity === 'profile') {
    const row: Payload = { user_id: change.userId };
    for (const [local, remote] of Object.entries(profileFields))
      row[remote] = p[local] || null;
    row.civility =
      p.civilite === 'Mme'
        ? 'madame'
        : p.civilite === 'M.'
          ? 'monsieur'
          : p.civilite || null;
    row.birth_date = birthDateToISO(p.dateNaissance);
    return row;
  }
  if (change.entity === 'reminder')
    return {
      id: change.id,
      user_id: change.userId,
      title: p.title,
      due_date: p.dateISO,
      category: p.category,
      notifications_enabled: p.notifyEnabled,
      lead_days: p.leadDays,
      deleted_at: null,
    };
  return {
    id: p.id,
    user_id: change.userId,
    procedure_id: change.id,
    status: p.status,
    current_step: p.step === 'recap' ? 'summary' : p.step,
    form_values: p.values,
    checked_documents: p.checkedDocuments,
    deleted_at: null,
  };
}
export function fromRemote(entity: Entity, row: Payload): LocalRecord {
  if (entity === 'profile') {
    const payload: Payload = {};
    for (const [local, remote] of Object.entries(profileFields))
      if (row[remote] != null) payload[local] = row[remote];
    if (row.civility)
      payload.civilite =
        row.civility === 'madame'
          ? 'Mme'
          : row.civility === 'monsieur'
            ? 'M.'
            : row.civility;
    if (typeof row.birth_date === 'string')
      payload.dateNaissance = row.birth_date.split('-').reverse().join('/');
    return { id: String(row.user_id), payload };
  }
  if (entity === 'reminder')
    return {
      id: String(row.id),
      payload: {
        id: row.id,
        title: row.title,
        dateISO: row.due_date,
        category: row.category,
        notifyEnabled: row.notifications_enabled,
        leadDays: row.lead_days,
      },
    };
  return {
    id: String(row.procedure_id),
    payload: {
      id: row.id,
      procedureId: row.procedure_id,
      status: row.status,
      step: row.current_step === 'summary' ? 'recap' : row.current_step,
      values: row.form_values,
      checkedDocuments: row.checked_documents,
    },
  };
}

export function birthDateToISO(value: unknown): string | null {
  if (!value) return null;
  if (typeof value !== 'string') throw new Error('Date de naissance invalide.');
  const date = value.includes('/')
    ? value.split('/').reverse().join('-')
    : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error('Utilisez le format JJ/MM/AAAA.');
  const parsed = new Date(`${date}T12:00:00Z`);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  )
    throw new Error('Date de naissance invalide.');
  return date;
}
