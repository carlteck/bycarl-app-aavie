import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { AavieModule } from '@/constants/modules';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ModuleCardProps = AavieModule & {
  /** 'feature' = carte vedette pleine largeur (icône+titre en ligne, description visible).
   * 'compact' = carte bento réduite (empilée, sans description) pour les modules secondaires. */
  variant?: 'feature' | 'compact';
};

/**
 * Variante web : `expo-linear-gradient` est une vue native qui ne se rend pas côté SSR web (même
 * piège que `gradient-header.web.tsx`) — le reflet de la carte vedette est reproduit en CSS pur
 * via `experimental_backgroundImage`, sûr pour le SSR.
 */
export function ModuleCard({ title, description, icon, href, variant = 'feature' }: ModuleCardProps) {
  const theme = useTheme();
  const isCompact = variant === 'compact';
  const available = Boolean(href);

  const content = (pressed?: boolean) => (
    <ThemedView
      // Carte vedette légèrement teintée (token `backgroundElement` existant, pas de nouvelle
      // couleur) pour la distinguer des cartes compactes sans dépendre uniquement de la taille.
      type={isCompact ? 'background' : 'backgroundElement'}
      style={[
        styles.card,
        CardShadow,
        { borderColor: theme.cardBorder },
        isCompact && styles.cardCompact,
        pressed && styles.pressed,
      ]}
      accessible={!available}
      accessibilityRole={available ? undefined : 'text'}>
      {!isCompact && (
        // Reflet subtil en haut de la carte vedette, façon panneau vitré (cf. bandeau d'en-tête).
        <ThemedView
          style={[
            styles.sheen,
            {
              experimental_backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0))',
            },
          ]}
        />
      )}
      <ThemedView style={isCompact ? styles.topCompact : styles.top}>
        <IconChip name={icon} variant="turquoise" size={isCompact ? 30 : 34} />
        <ThemedView style={styles.body}>
          <ThemedText type={isCompact ? 'label' : 'sectionTitle'}>{title}</ThemedText>
          {!isCompact && <ThemedText themeColor="textSecondary">{description}</ThemedText>}
        </ThemedView>
        {available && <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
      </ThemedView>
      <ThemedView type={available ? 'turquoiseTint' : 'backgroundElement'} style={styles.pill}>
        <Ionicons
          name={available ? 'checkmark-circle-outline' : 'time-outline'}
          size={11}
          color={available ? theme.turquoiseTintText : theme.textSecondary}
        />
        <ThemedText
          type="caption"
          style={available ? { color: theme.turquoiseTintText } : undefined}
          themeColor={available ? undefined : 'textSecondary'}>
          {available ? 'Disponible' : isCompact ? 'Bientôt' : 'Bientôt disponible'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  if (!available) return content();

  return (
    <Pressable
      onPress={() => router.push(href as never)}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  sheen: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 56,
    borderTopLeftRadius: Spacing.four - 1,
    borderTopRightRadius: Spacing.four - 1,
  },
  cardCompact: {
    flex: 1,
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  top: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  topCompact: {
    gap: Spacing.two,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.85,
  },
});
