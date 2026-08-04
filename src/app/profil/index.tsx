import { router } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { IconChip } from '@/components/icon-chip';
import { ListRow } from '@/components/list-row';
import { OutlineButton } from '@/components/outline-button';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { AAVIE_SECTIONS } from '@/constants/modules';
import { confirmResetLocalData } from '@/lib/confirm-reset';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ProfilScreen() {
  const {
    hasAccount,
    displayName,
    biometricAvailable,
    biometricEnabled,
    startOnboarding,
    toggleBiometrics,
    lock,
    resetLocalData,
  } = useAuth();
  const theme = useTheme();

  return (
    <SectionScreen
      section={AAVIE_SECTIONS[3]}
      beforeModules={
        <ThemedView style={styles.accountSection}>
          <ThemedView
            type="background"
            style={[styles.listCard, CardShadow, { borderColor: theme.cardBorder }]}>
            <ListRow
              icon="person-outline"
              label="Mes informations"
              onPress={() => router.push('/profil/informations')}
            />
          </ThemedView>

          {hasAccount ? (
            <>
              <View style={styles.avatarRow}>
                <ThemedView type="primary" style={styles.avatar}>
                  <ThemedText type="screenTitle" style={styles.avatarInitial}>
                    {(displayName ?? '?').charAt(0).toUpperCase()}
                  </ThemedText>
                </ThemedView>
                <View style={styles.avatarText}>
                  <ThemedText type="sectionTitle">{displayName ?? '—'}</ThemedText>
                  <ThemedText type="label" style={{ color: theme.turquoiseTintText }}>
                    Profil sécurisé actif
                  </ThemedText>
                </View>
              </View>

              <ThemedView
                type="background"
                style={[styles.listCard, CardShadow, { borderColor: theme.cardBorder }]}>
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
                    <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
                  </>
                )}
                <ListRow icon="lock-closed-outline" label="Verrouiller l’application" onPress={lock} />
                <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
                <ListRow
                  icon="refresh-outline"
                  label="Réinitialiser mes données locales"
                  danger
                  onPress={() => confirmResetLocalData(resetLocalData)}
                />
              </ThemedView>
            </>
          ) : (
            <ThemedView
              type="background"
              style={[styles.noticeCard, CardShadow, { borderColor: theme.cardBorder }]}>
              <IconChip name="shield-checkmark-outline" variant="primary" size={40} />
              <ThemedText type="sectionTitle">Aucun profil sécurisé</ThemedText>
              <ThemedText themeColor="textSecondary">
                Créez un profil protégé par un code à 4 chiffres pour sécuriser vos futures données
                personnelles (documents, budget). Ce n’est pas obligatoire pour utiliser l’application.
              </ThemedText>
              <OutlineButton icon="person-add-outline" onPress={startOnboarding}>
                Créer un profil sécurisé
              </OutlineButton>
            </ThemedView>
          )}
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
  noticeCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
});
