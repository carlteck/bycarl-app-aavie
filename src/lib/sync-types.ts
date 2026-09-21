export type Entity = 'profile' | 'reminder' | 'progress' | 'budget';
export type Payload = Record<string, unknown>;
export type LocalRecord = { id: string; payload: Payload };
export type PendingChange = LocalRecord & {
  userId: string;
  entity: Entity;
  revision: string;
  deleted: boolean;
};
export type SyncStore = {
  read: (userId: string, entity: Entity) => Promise<LocalRecord[]>;
  change: (
    userId: string,
    entity: Entity,
    id: string,
    update: (current: Payload | undefined) => Payload | null,
  ) => Promise<void>;
  pending: (userId: string) => Promise<PendingChange[]>;
  acknowledge: (change: PendingChange) => Promise<void>;
  replace: (
    userId: string,
    entity: Entity,
    rows: LocalRecord[],
  ) => Promise<void>;
};
export type ProcedureProgress = {
  id: string;
  procedureId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  step: 'overview' | 'form' | 'documents' | 'recap';
  values: Record<string, string>;
  checkedDocuments: Record<string, boolean>;
};
export type BudgetKind = 'income' | 'expense';
/** Opération de budget telle que conservée sur l'appareil : montant en centimes entiers. */
export type BudgetEntry = {
  id: string;
  label: string;
  amountCents: number;
  kind: BudgetKind;
  category: string;
  dateISO: string;
};
