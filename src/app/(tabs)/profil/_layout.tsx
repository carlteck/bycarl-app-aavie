import { Stack } from 'expo-router';

/** Nécessaire pour pousser des écrans (ex: Mes informations) par-dessus les onglets natifs. */
export default function ProfilLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
