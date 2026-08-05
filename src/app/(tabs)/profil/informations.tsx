import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DynamicForm } from '@/components/dynamic-form';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ProcedureField } from '@/constants/procedures';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserProfile, type UserProfile } from '@/context/user-profile-context';

/**
 * Champs civils déclaratifs utilisés pour pré-remplir les démarches administratives (voir
 * `constants/procedures.ts`, `prefillFromProfile`). Rien n'est obligatoire : l'utilisateur peut
 * lancer une démarche sans avoir renseigné son profil, il complétera alors les champs à la main.
 */
const PROFILE_FIELDS: ProcedureField[] = [
  { key: 'civilite', label: 'Civilité', type: 'select', options: ['Mme', 'M.'] },
  { key: 'prenom', label: 'Prénom', type: 'text' },
  { key: 'nom', label: 'Nom', type: 'text' },
  { key: 'dateNaissance', label: 'Date de naissance', type: 'date', placeholder: 'JJ/MM/AAAA' },
  { key: 'lieuNaissance', label: 'Lieu de naissance', type: 'text' },
  { key: 'adresse', label: 'Adresse', type: 'text' },
  { key: 'codePostal', label: 'Code postal', type: 'text' },
  { key: 'ville', label: 'Ville', type: 'text' },
  { key: 'telephone', label: 'Téléphone', type: 'tel' },
  { key: 'email', label: 'E-mail', type: 'email' },
];

export default function ProfilInformationsScreen() {
  const { profile, updateProfile } = useUserProfile();
  const safeAreaInsets = useSafeAreaInsets();

  const initialValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const field of PROFILE_FIELDS) {
      values[field.key] = profile[field.key as keyof UserProfile] ?? '';
    }
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState(initialValues);

  const handleSave = () => {
    updateProfile(values as Partial<UserProfile>);
    router.back();
  };

  const contentPlatformStyle = Platform.select({
    android: { paddingBottom: safeAreaInsets.bottom + Spacing.six },
    web: { paddingBottom: Spacing.six },
  });

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeaderBar title="Mes informations" onBack={() => router.back()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <ThemedView style={styles.container}>
          <ThemedText themeColor="textSecondary">
            Ces informations restent stockées uniquement sur cet appareil. Elles servent à
            pré-remplir automatiquement vos démarches administratives.
          </ThemedText>

          <DynamicForm
            fields={PROFILE_FIELDS}
            values={values}
            onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
          />

          <PrimaryButton onPress={handleSave} icon="checkmark-outline">
            Enregistrer
          </PrimaryButton>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
});
