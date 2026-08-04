import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { OutlineButton } from './outline-button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { ANNUAIRE_CATEGORY_ICON, type AnnuaireEntry } from '@/constants/annuaire';
import { openDirections } from '@/lib/maps';
import { CardShadow, Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AnnuaireEntryCard({ name, category, description, phone, website, address }: AnnuaireEntry) {
  const theme = useTheme();

  return (
    <ThemedView type="background" style={[styles.card, CardShadow, { borderColor: theme.cardBorder }]}>
      <View style={styles.top}>
        <IconChip name={ANNUAIRE_CATEGORY_ICON[category]} variant="turquoise" />
        <View style={styles.body}>
          <ThemedText type="sectionTitle">{name}</ThemedText>
          <ThemedView type="turquoiseTint" style={styles.tag}>
            <ThemedText type="caption" style={{ color: theme.turquoiseTintText }}>
              {category}
            </ThemedText>
          </ThemedView>
        </View>
      </View>

      <ThemedText themeColor="textSecondary">{description}</ThemedText>
      {address && (
        <ThemedText type="caption" themeColor="textSecondary">
          {address}
        </ThemedText>
      )}

      <View style={styles.actions}>
        {phone && (
          <Pressable
            onPress={() => Linking.openURL(`tel:${phone}`)}
            accessibilityRole="button"
            accessibilityLabel={`Appeler ${name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {({ pressed }) => (
              <ThemedView type={pressed ? 'primaryPressed' : 'primary'} style={styles.actionInner}>
                <Ionicons name="call-outline" size={15} color={Palette.white} />
                <ThemedText type="label" style={styles.actionPrimaryText} numberOfLines={1}>
                  Appeler
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        )}
        {website && (
          <OutlineButton
            icon="globe-outline"
            onPress={() => Linking.openURL(website)}
            accessibilityLabel={`Ouvrir le site web de ${name}`}>
            Site web
          </OutlineButton>
        )}
        {address && (
          <OutlineButton
            icon="navigate-outline"
            onPress={() => openDirections(address)}
            accessibilityLabel={`Itinéraire vers ${name}`}>
            Itinéraire
          </OutlineButton>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  top: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Spacing.five,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionInner: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  actionPrimaryText: {
    color: Palette.white,
  },
});
