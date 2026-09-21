import { Alert, Linking } from 'react-native';

import { safeExternalUrl } from './external-url';

/**
 * Ouvre un lien HTTPS venu d'une donnée distante. Retourne `false` (et prévient l'usager) si le
 * lien est refusé ou si aucune application ne sait l'ouvrir : un bouton qui ne fait rien
 * silencieusement laisse croire à l'usager qu'il s'y est mal pris.
 */
export async function openExternalLink(url: string): Promise<boolean> {
  const safe = safeExternalUrl(url);
  if (safe) {
    try {
      await Linking.openURL(safe);
      return true;
    } catch {
      // repli ci-dessous
    }
  }
  Alert.alert('Lien impossible à ouvrir', 'Ce lien n’a pas pu être ouvert.');
  return false;
}
