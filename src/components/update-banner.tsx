import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Bandeau proposant d'appliquer une mise à jour déjà téléchargée.
 *
 * ⚠️ **Rien ne recharge l'application de lui-même, et c'est délibéré.** `expo-updates` applique
 * de toute façon la mise à jour au prochain démarrage à froid ; ce bandeau ne fait qu'offrir de
 * ne pas attendre. Recharger automatiquement — même « au retour d'arrière-plan », qui paraît un
 * moment sûr — effacerait une saisie en cours. Le cas n'a rien de théorique : quelqu'un qui
 * s'inscrit quitte l'application pour aller chercher le lien de confirmation dans sa boîte mail,
 * puis revient. Un rechargement à cet instant lui ferait tout ressaisir.
 *
 * La vérification, elle, est automatique : elle ne coûte rien et ne casse rien. Seule
 * l'application du changement demande un geste.
 */
export function UpdateBanner() {
  const theme = useTheme();
  const { isUpdatePending } = Updates.useUpdates();
  const [dismissed, setDismissed] = useState(false);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    // `isEnabled` est faux en développement et dans Expo Go : sans ce garde, chaque passage au
    // premier plan lèverait une erreur pendant le développement.
    if (!Updates.isEnabled) return;

    async function lookForUpdate() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) await Updates.fetchUpdateAsync();
      } catch {
        // Réseau absent ou serveur injoignable : sans conséquence, on réessaiera au prochain
        // retour au premier plan. Une mise à jour qui tarde ne vaut pas un message d'erreur.
      }
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void lookForUpdate();
    });

    return () => subscription.remove();
  }, []);

  const restart = useCallback(async () => {
    setRestarting(true);
    try {
      await Updates.reloadAsync();
    } catch {
      setRestarting(false);
    }
  }, []);

  if (!isUpdatePending || dismissed) return null;

  return (
    <View
      style={[
        styles.banner,
        CardShadow,
        {
          backgroundColor: theme.backgroundSelected,
          borderColor: theme.cardBorder,
        },
      ]}
      accessibilityRole="alert"
    >
      <Ionicons
        name="arrow-down-circle-outline"
        size={22}
        color={theme.turquoiseTintText}
      />
      <View style={styles.texts}>
        <ThemedText type="label">Une nouvelle version est prête</ThemedText>
        <ThemedText type="caption">
          Elle s’installera toute seule à la prochaine ouverture.
        </ThemedText>
      </View>
      <Pressable
        onPress={restart}
        disabled={restarting}
        accessibilityRole="button"
        accessibilityLabel="Redémarrer l’application maintenant"
        style={({ pressed }) => [
          styles.action,
          { backgroundColor: pressed ? theme.primaryPressed : theme.primary },
        ]}
      >
        <ThemedText type="label" style={styles.actionLabel}>
          {restarting ? '…' : 'Redémarrer'}
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => setDismissed(true)}
        accessibilityRole="button"
        accessibilityLabel="Masquer cette information"
        hitSlop={12}
      >
        <Ionicons name="close" size={20} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    zIndex: 10,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  texts: { flex: 1, gap: Spacing.half },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
  },
  actionLabel: { color: '#FFFFFF' },
});
