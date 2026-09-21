import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeaderBar } from './screen-header-bar';
import { ThemedView } from './themed-view';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  backLabel?: string;
  children: ReactNode;
};

/** Coquille des écrans empilés : barre de retour + corps qui remplit l'espace restant. */
export function StackScreen({
  title,
  backLabel = 'Services',
  children,
}: Props) {
  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title={title}
        onBack={() => router.back()}
        backLabel={backLabel}
      />
      {children}
    </ThemedView>
  );
}

/**
 * Marges d'une liste ou d'un défilement plein écran : zones sûres (encoche, barre de gestes,
 * paysage) et colonne centrée bornée à `MaxContentWidth` pour que les lignes ne s'étirent pas sur
 * tablette. À passer à `contentContainerStyle`.
 */
export function useListInsets() {
  const insets = useSafeAreaInsets();
  return {
    width: '100%' as const,
    maxWidth: MaxContentWidth,
    alignSelf: 'center' as const,
    paddingLeft: insets.left + Spacing.four,
    paddingRight: insets.right + Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: insets.bottom + Spacing.five,
    gap: Spacing.three,
  };
}

const styles = StyleSheet.create({ screen: { flex: 1 } });

/** Comme `useListInsets`, pour un écran d'onglet : le bas réserve la barre d'onglets. */
export function useTabListInsets() {
  const insets = useListInsets();
  return { ...insets, paddingBottom: insets.paddingBottom + BottomTabInset };
}
