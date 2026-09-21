import type { PageResult } from '@/hooks/use-remote-list';
import { pageRange, toPage } from '@/lib/paging';
import {
  asDay,
  asId,
  asInstant,
  asOneOf,
  asOptionalText,
  asRecord,
  asText,
} from '@/lib/remote-values';
import { toIlikePattern } from '@/lib/search-term';
import { supabase } from '@/lib/supabase';

export const VAULT_CATEGORIES = [
  { value: 'identite', label: 'Identité' },
  { value: 'logement', label: 'Logement' },
  { value: 'famille', label: 'Famille' },
  { value: 'sante', label: 'Santé' },
  { value: 'travail', label: 'Travail' },
  { value: 'fiscalite', label: 'Fiscalité' },
  { value: 'autre', label: 'Autre' },
] as const;
export type VaultCategory = (typeof VAULT_CATEGORIES)[number]['value'];
export type VaultFilter = VaultCategory | 'all';
const CATEGORY_VALUES = VAULT_CATEGORIES.map((item) => item.value);

export const STORAGE_PROVIDERS = ['supabase_storage', 'external'] as const;
export type StorageProvider = (typeof STORAGE_PROVIDERS)[number];
export const TRANSFER_STATUSES = ['pending', 'available', 'failed'] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

/** Métadonnées d'un document. Le fichier lui-même n'est jamais dans la base. */
export type VaultDocument = {
  id: string;
  title: string;
  category: VaultCategory;
  mimeType: string;
  sizeBytes: number;
  storageProvider: StorageProvider;
  /** Chemin dans le bucket, ou identifiant chez le fournisseur externe. Jamais une URL signée. */
  remoteRef?: string;
  transferStatus: TransferStatus;
  /** `AAAA-MM-JJ`. */
  expiresOn?: string;
  createdAt: string;
};

/** État d'un transfert en cours, tenu côté écran (il n'est pas persisté). */
export type TransferState =
  | { kind: 'idle' }
  | { kind: 'uploading'; progress?: number }
  | { kind: 'downloading'; progress?: number }
  | { kind: 'failed'; message: string };

export type VaultCapabilities = { upload: boolean; download: boolean };

export type UploadInput = {
  documentId: string;
  fileUri: string;
  mimeType: string;
  sizeBytes: number;
  onProgress?: (fraction: number) => void;
};

/**
 * Contrat du stockage des fichiers. Le choix (Supabase Storage, cloud de l'usager, autre) n'est
 * pas arrêté : l'écran ne parle qu'à cette interface, et brancher un fournisseur revient à
 * fournir une implémentation — ni l'écran ni la table `mobile_vault_documents` ne changent.
 * Les permissions Photos/Fichiers ne sont demandées que par une implémentation, au moment d'un
 * import, jamais au lancement.
 */
export interface VaultStorage {
  readonly provider: StorageProvider | 'none';
  readonly capabilities: VaultCapabilities;
  upload(
    input: UploadInput,
    signal: AbortSignal,
  ): Promise<{ remoteRef: string }>;
  download(
    document: VaultDocument,
    signal: AbortSignal,
    onProgress?: (fraction: number) => void,
  ): Promise<{ localUri: string }>;
  remove(document: VaultDocument, signal: AbortSignal): Promise<void>;
}

export class VaultUnavailableError extends Error {
  constructor() {
    super('Le stockage des documents n’est pas encore activé.');
    this.name = 'VaultUnavailableError';
  }
}

const unavailable = (): Promise<never> =>
  Promise.reject(new VaultUnavailableError());

/** Implémentation par défaut tant qu'aucun stockage n'est choisi : tout refuse, honnêtement. */
export const vaultStorage: VaultStorage = {
  provider: 'none',
  capabilities: { upload: false, download: false },
  upload: unavailable,
  download: unavailable,
  remove: unavailable,
};

export function mapVaultDocument(row: unknown): VaultDocument | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.title);
  const category = asOneOf(value.category, CATEGORY_VALUES) ?? 'autre';
  const storageProvider = asOneOf(value.storage_provider, STORAGE_PROVIDERS);
  const transferStatus = asOneOf(value.transfer_status, TRANSFER_STATUSES);
  const createdAt = asInstant(value.created_at);
  const size = value.size_bytes;
  if (
    !id ||
    !title ||
    !storageProvider ||
    !transferStatus ||
    !createdAt ||
    typeof size !== 'number' ||
    !Number.isFinite(size) ||
    size < 0
  )
    return null;
  return {
    id,
    title,
    category,
    storageProvider,
    transferStatus,
    createdAt,
    sizeBytes: size,
    mimeType: asText(value.mime_type) || 'application/octet-stream',
    remoteRef: asOptionalText(value.remote_ref),
    expiresOn: asDay(value.expires_on) ?? undefined,
  };
}

const COLUMNS =
  'id, title, category, mime_type, size_bytes, storage_provider, remote_ref, transfer_status, expires_on, created_at';

export async function fetchVaultPage(
  page: number,
  category: VaultFilter,
  term: string,
  signal: AbortSignal,
): Promise<PageResult<VaultDocument>> {
  let query = supabase
    .from('mobile_vault_documents')
    .select(COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('id')
    .range(...pageRange(page));
  if (category !== 'all') query = query.eq('category', category);
  const pattern = toIlikePattern(term);
  if (pattern) query = query.ilike('title', pattern);
  const { data, error } = await query.abortSignal(signal);
  if (error) throw error;
  return toPage(data, mapVaultDocument);
}

/** 1 536 → « 1,5 Ko ». Unités françaises (octet, Ko, Mo, Go). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const units = ['Ko', 'Mo', 'Go'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0).replace('.', ',')} ${units[index]}`;
}
