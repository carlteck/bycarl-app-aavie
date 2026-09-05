import { router } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { ListRow } from '@/components/list-row';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { AAVIE_SECTIONS } from '@/constants/modules';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ProfilScreen() {
  const {
    user,
    biometricAvailable,
    biometricEnabled,
    toggleBiometrics,
    signOut,
  } = useAuth();
  const theme = useTheme();

  return (
    <SectionScreen
      section={AAVIE_SECTIONS[3]}
      beforeModules={
        <ThemedView style={styles.accountSection}>
          <ThemedView
            type="background"
            style={[
              styles.listCard,
              CardShadow,
              { borderColor: theme.cardBorder },
            ]}
          >
            <ListRow
              icon="person-outline"
              label="Mes informations"
              onPress={() => router.push('/profil/informations')}
            />
          </ThemedView>

          {/* Un compte existe toujours ici : sans compte, `AuthGate` affiche l'écran d'accueil
              et la navigation n'est jamais montée. */}
          <View style={styles.avatarRow}>
            <ThemedView type="primary" style={styles.avatar}>
              <ThemedText type="screenTitle" style={styles.avatarInitial}>
                {(user?.first_name ?? '?').charAt(0).toUpperCase()}
              </ThemedText>
            </ThemedView>
            <View style={styles.avatarText}>
              <ThemedText type="sectionTitle">
                {user ? `${user.first_name} ${user.last_name}` : '—'}
              </ThemedText>
              <ThemedText
                type="label"
                style={{ color: theme.turquoiseTintText }}
              >
                {user?.plan_name ?? 'Sans forfait'}
              </ThemedText>
            </View>
          </View>

          <ThemedView
            type="background"
            style={[
              styles.listCard,
              CardShadow,
              { borderColor: theme.cardBorder },
            ]}
          >
            {biometricAvailable && (
              <>
                <ListRow
                  icon="finger-print-outline"
                  label="Déverrouillage biométrique"
                  trailing={
                    <Switch
                      value={biometricEnabled}
                      onValueChange={toggleBiometrics}
                      accessibilityLabel="Activer le déverrouillage biométrique"
                    />
                  }
                />
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.cardBorder },
                  ]}
                />
              </>
            )}
            <ListRow
              icon="wallet-outline"
              label="Mes crédits"
              trailing={
                user && user.role !== 'admin' ? (
                  <ThemedText type="label" themeColor="primary">
                    {user.credit_balance}
                  </ThemedText>
                ) : undefined
              }
              onPress={() => router.push('/credits')}
            />
            <View
              style={[styles.divider, { backgroundColor: theme.cardBorder }]}
            />
            <ListRow
              icon="log-out-outline"
              label="Se déconnecter"
              danger
              onPress={signOut}
            />
          </ThemedView>
        </ThemedView>
      }
    />
  );
}

const styles = StyleSheet.create({
  accountSection: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
  },
  avatarText: {
    gap: Spacing.half,
  },
  listCard: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  divider: {
    height: 1,
  },
});
