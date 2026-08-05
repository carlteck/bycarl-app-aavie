import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { AavieModule } from '@/constants/modules';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ModuleCardProps = AavieModule & {
  /** 'feature' = carte vedette pleine largeur (icône primary + titre + description).
   * 'compact' = carte bento réduite (icône turquoise + titre) pour les modules secondaires. */
  variant?: 'feature' | 'compact';
};

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
      <View style={styles.head}>
        <IconChip name={icon} variant={isCompact ? 'turquoise' : 'primary'} size={isCompact ? 32 : 44} />
        {available && (
          <ThemedView type="backgroundSelected" style={[styles.chevron, isCompact && styles.chevronCompact]}>
            <Ionicons name="chevron-forward" size={isCompact ? 13 : 15} color={theme.primary} />
          </ThemedView>
        )}
      </View>
      <View style={styles.body}>
        <ThemedText type={isCompact ? 'label' : 'sectionTitle'}>{title}</ThemedText>
        {!isCompact && <ThemedText themeColor="textSecondary">{description}</ThemedText>}
      </View>
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
      accessibilityLabel={`${title}. ${description}`}
      style={isCompact && styles.pressableCompact}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableCompact: {
    flex: 1,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  cardCompact: {
    flex: 1,
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCompact: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  body: {
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
