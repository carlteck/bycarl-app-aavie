import type { AnnuaireEntry } from '@/constants/annuaire';
import { safeExternalUrl, safePhoneNumber } from '@/lib/external-url';
import { asId, asOptionalText, asRecord, asText } from '@/lib/remote-values';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

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

const COLUMNS =
  'id, name, category, description, phone, website, address, hours';
const CHUNK = 500;
/** Garde-fou : un annuaire ne dépasse pas quelques milliers de fiches. */
const MAX_ROWS = 5000;

/**
 * Annuaire publié, en entier (il se filtre ensuite sur l'appareil). LÈVE en cas d'erreur : c'est à
 * l'écran de décider s'il montre la liste intégrée et de l'ANNONCER — cette fonction ne se replie
 * jamais en silence sur des données de démonstration.
 */
export async function fetchAnnuaire(
  signal: AbortSignal,
): Promise<AnnuaireEntry[]> {
  if (!isSupabaseConfigured) throw new Error('Supabase non configuré.');
  const entries: AnnuaireEntry[] = [];
  for (let from = 0; from < MAX_ROWS; from += CHUNK) {
    const { data, error } = await supabase
      .from('directory_contacts')
      .select(COLUMNS)
      .order('name')
      .order('id')
      .range(from, from + CHUNK - 1)
      .abortSignal(signal);
    if (error) throw error;
    const rows = (data ?? []) as unknown[];
    for (const row of rows) {
      const entry = mapRemoteContact(row);
      if (entry) entries.push(entry);
    }
    if (rows.length < CHUNK) break;
  }
  return entries;
}
