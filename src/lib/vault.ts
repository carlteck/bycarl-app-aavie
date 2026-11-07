import type { PageResult } from '@/hooks/use-remote-list';
import { File, Paths, UploadType } from 'expo-file-system';

import { API_BASE, ApiError, apiAuthorizationHeaders, apiFetch } from '@/lib/api';
import { PAGE_SIZE } from '@/lib/paging';
import {
  asDay,
  asId,
  asInstant,
  asOneOf,
  asOptionalText,
  asRecord,
  asText,
} from '@/lib/remote-values';

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

export const STORAGE_PROVIDERS = ['external'] as const;
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

export const vaultStorage: VaultStorage = {
  provider: 'external',
  capabilities: { upload: true, download: true },
  async upload() {
    throw new Error('Utilisez uploadVaultDocument avec les métadonnées du document.');
  },
  async download(document, signal, onProgress) {
    const headers = await apiAuthorizationHeaders();
    const safeName = document.title.replace(/[^a-z0-9._-]+/gi, '-');
    const destination = new File(Paths.cache, `${document.id}-${safeName}`);
    if (destination.exists) destination.delete();
    const task = File.createDownloadTask(
      `${API_BASE}/document.php?id=${encodeURIComponent(document.id)}`,
      destination,
      {
        headers,
        signal,
        onProgress: ({ bytesWritten, totalBytes }) => {
          if (totalBytes > 0) onProgress?.(bytesWritten / totalBytes);
        },
      },
    );
    const file = await task.downloadAsync();
    if (!file) throw new Error('Le téléchargement a été interrompu.');
    try {
      const Sharing = await import('expo-sharing');
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(file.uri, { mimeType: document.mimeType });
    } catch (error) {
      void error;
      throw new Error(
        'Le document est téléchargé, mais son ouverture nécessite une version plus récente de l’application.',
      );
    }
    return { localUri: file.uri };
  },
  async remove(document, signal) {
    await apiFetch(`/document.php?id=${encodeURIComponent(document.id)}`, {
      method: 'DELETE',
      signal,
    });
  },
};

export function mapVaultDocument(row: unknown): VaultDocument | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const title = asText(value.name);
  const category = asOneOf(value.category, CATEGORY_VALUES) ?? 'autre';
  const accessible = value.accessible !== false;
  const storageProvider: StorageProvider = 'external';
  const transferStatus: TransferStatus = accessible ? 'available' : 'failed';
  const createdAt = asInstant(value.created_at);
  const size = value.file_size;
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
    remoteRef: asOptionalText(value.cloud_provider),
    expiresOn: asDay(value.expiry_date) ?? undefined,
  };
}

export async function fetchVaultPage(
  page: number,
  category: VaultFilter,
  term: string,
  signal: AbortSignal,
): Promise<PageResult<VaultDocument>> {
  const cloud = await fetchCloudState(signal);
  if (!cloud.connected) return { items: [], hasMore: false };
  const payload = await apiFetch<unknown>('/documents.php', { signal });
  const rows = asRecord(payload)?.documents;
  const query = term.trim().toLocaleLowerCase('fr');
  const items = (Array.isArray(rows) ? rows : [])
    .map(mapVaultDocument)
    .filter((item): item is VaultDocument => item !== null)
    .filter((item) => category === 'all' || item.category === category)
    .filter((item) => !query || item.title.toLocaleLowerCase('fr').includes(query));
  const start = page * PAGE_SIZE;
  return { items: items.slice(start, start + PAGE_SIZE), hasMore: items.length > start + PAGE_SIZE };
}

export type CloudState = {
  connected: boolean;
  providerLabel?: string;
  accountEmail?: string;
};

export async function fetchCloudState(signal: AbortSignal): Promise<CloudState> {
  const payload = asRecord(await apiFetch<unknown>('/cloud.php', { signal }));
  const connection = asRecord(payload?.connection);
  return {
    connected: connection !== null,
    providerLabel: asOptionalText(connection?.provider),
    accountEmail: asOptionalText(connection?.account_email),
  };
}

export type VaultFolder = { id: string; name: string; parentId?: string };

export function mapVaultFolder(row: unknown): VaultFolder | null {
  const value = asRecord(row);
  const id = asId(value?.id);
  const name = asText(value?.name);
  if (!id || !name) return null;
  return { id, name, parentId: asId(value?.parent_id) ?? undefined };
}

export async function fetchVaultFolders(signal: AbortSignal): Promise<VaultFolder[]> {
  const payload = asRecord(await apiFetch<unknown>('/document-folders.php', { signal }));
  const rows = payload?.folders;
  return (Array.isArray(rows) ? rows : []).map(mapVaultFolder).filter((item): item is VaultFolder => item !== null);
}

export async function createVaultFolder(name: string, parentId?: string): Promise<VaultFolder> {
  const payload = asRecord(await apiFetch<unknown>('/document-folders.php', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), parent_id: parentId ?? null }),
  }));
  const folder = mapVaultFolder(payload?.folder);
  if (!folder) throw new Error('Réponse inattendue du serveur.');
  return folder;
}

export async function renameVaultFolder(id: string, name: string): Promise<void> {
  await apiFetch(`/document-folder.php?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: name.trim() }),
  });
}

export async function deleteVaultFolder(id: string): Promise<void> {
  await apiFetch(`/document-folder.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function moveVaultDocument(documentId: string, folderId: string | null): Promise<void> {
  await apiFetch(`/document.php?id=${encodeURIComponent(documentId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ folder_id: folderId }),
  });
}

export async function uploadVaultDocument(input: {
  name: string;
  category: VaultCategory;
  file: { uri: string; name: string; mimeType: string };
  expiryDate?: string;
  folderId?: string;
  addToPlanner?: boolean;
}): Promise<void> {
  const headers = await apiAuthorizationHeaders();
  const result = await new File(input.file.uri).upload(
    `${API_BASE}/documents.php`,
    {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: input.file.mimeType,
      headers,
      parameters: {
        name: input.name.trim(),
        category: input.category,
        expiry_date: input.expiryDate ?? '',
        folder_id: input.folderId ?? '',
        add_to_planner: input.addToPlanner ? '1' : '0',
      },
    },
  );
  if (result.status < 200 || result.status >= 300) {
    let message = 'Le document n’a pas pu être envoyé.';
    try {
      const payload = JSON.parse(result.body) as { error?: unknown };
      if (typeof payload.error === 'string') message = payload.error;
    } catch (error) {
      void error;
      // Le message générique reste volontairement affiché pour une réponse non JSON.
    }
    throw new ApiError(message, result.status);
  }
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
