import { Stack } from 'expo-router';

/** Nécessaire pour pousser des écrans (catalogue -> détail) par-dessus les onglets natifs. */
export default function DemarcheLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
