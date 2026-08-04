import { Alert, Platform } from 'react-native';

const MESSAGE =
  'Cette action supprime votre profil local (nom, code, préférences) de cet appareil. Cette action est irréversible.';

/** Demande confirmation puis déclenche la réinitialisation des données locales. */
export function confirmResetLocalData(onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(MESSAGE)) onConfirm();
    return;
  }

  Alert.alert('Réinitialiser mes données locales ?', MESSAGE, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Réinitialiser', style: 'destructive', onPress: onConfirm },
  ]);
}
