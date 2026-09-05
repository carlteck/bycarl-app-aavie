import { router } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { ListRow } from '@/components/list-row';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSync } from '@/context/sync-context';
import { useAuth } from '@/context/auth-context';
import { AAVIE_SECTIONS } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
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
  const { status, retry } = useSync();

  return (
    <SectionScreen
      section={AAVIE_SECTIONS[3]}
      beforeModules={
        <View style={styles.accountSection}>
          {/* Un compte existe toujours ici : sans compte, `AuthGate` affiche l'écran d'accueil
              et la navigation n'est jamais montée. */}
          <View
            style={[styles.avatarRow, { backgroundColor: theme.turquoiseTint }]}
          >
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
                Votre espace personnel
              </ThemedText>
            </View>
          </View>

          <ThemedView
            type="pageBackground"
            style={[styles.listCard, { borderColor: theme.cardBorder }]}
          >
            <ListRow
              icon="cloud-outline"
              label={
                status === 'synced'
                  ? 'Données synchronisées'
                  : status === 'syncing'
                    ? 'Synchronisation en cours…'
                    : 'Synchronisation en attente'
              }
              onPress={retry}
            />
            <ListRow
              icon="person-outline"
              label="Mes informations personnelles"
              onPress={() => router.push('/profil/informations')}
            />
          </ThemedView>

          <ThemedText type="sectionTitle" accessibilityRole="header">
            Au quotidien
          </ThemedText>
          <ThemedView
            type="pageBackground"
            style={[styles.listCard, { borderColor: theme.cardBorder }]}
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
              onPress={() => router.push('/credits')}
            />
            <View
              style={[styles.divider, { backgroundColor: theme.cardBorder }]}
            />
            <ListRow
              icon="notifications-outline"
              label="Notifications et rappels"
              onPress={() => router.push('/notifications')}
            />
            <View
              style={[styles.divider, { backgroundColor: theme.cardBorder }]}
            />
            <ListRow
              icon="information-circle-outline"
              label="À propos d’AAVIE"
              onPress={() => router.push('/a-propos')}
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
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  accountSection: {
    gap: Spacing.four,
  },
  avatarRow: {
    padding: 24,
    borderRadius: 26,
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
    flex: 1,
    gap: Spacing.half,
  },
  listCard: {
    borderRadius: 22,
    borderWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  divider: {
    height: 1,
  },
});
