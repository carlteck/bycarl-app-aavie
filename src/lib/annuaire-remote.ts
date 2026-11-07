import type { AnnuaireEntry } from '@/constants/annuaire';
import { apiFetch } from '@/lib/api';
import { safeExternalUrl, safePhoneNumber } from '@/lib/external-url';
import { asId, asOptionalText, asRecord, asText } from '@/lib/remote-values';

/**
 * Ligne de `directory_contacts` → entrée d'annuaire, ou `null` si elle est inexploitable.
 *
 * Validation stricte : l'identifiant doit être un UUID, le nom non vide ; le site web doit être un
 * lien `https:` et le téléphone un numéro composable — sans quoi le champ est ignoré, jamais
 * transmis tel quel à `Linking.openURL`. La catégorie reste celle publiée (texte libre) : la
 * reclasser en silence dans « National » faisait trouver un organisme au mauvais endroit.
 */
export function mapRemoteContact(row: unknown): AnnuaireEntry | null {
  const value = asRecord(row);
  if (!value) return null;
  const id = asId(value.id);
  const name = asText(value.name);
  const category = asText(value.category);
  if (!id || !name || !category) return null;
  return {
    id,
    name,
    category,
    description: asText(value.description),
    phone: safePhoneNumber(value.phone) ?? undefined,
    website: safeExternalUrl(value.website) ?? undefined,
    address: asOptionalText(value.address),
    hours: asOptionalText(value.hours),
  };
}

export async function fetchAnnuaire(
  signal: AbortSignal,
): Promise<AnnuaireEntry[]> {
  const payload = await apiFetch<unknown>('/contacts.php', { signal });
  const rows = asRecord(payload)?.contacts;
  return (Array.isArray(rows) ? rows : [])
    .map(mapRemoteContact)
    .filter((item): item is AnnuaireEntry => item !== null);
}
