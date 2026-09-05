import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentChecklist } from '@/components/document-checklist';
import { DynamicForm } from '@/components/dynamic-form';
import { IconChip } from '@/components/icon-chip';
import { OutlineButton } from '@/components/outline-button';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PROCEDURES } from '@/constants/procedures';
import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUserProfile } from '@/context/user-profile-context';

type WizardStep = 'overview' | 'form' | 'documents' | 'recap';
const STEP_LABELS = ['Vos informations', 'Documents', 'Récapitulatif'];
const STEP_INDEX: Record<WizardStep, number> = { overview: -1, form: 0, documents: 1, recap: 2 };

function showMissingFieldsAlert(labels: string[]) {
  const message = `Merci de compléter : ${labels.join(', ')}.`;
  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }
  Alert.alert('Informations manquantes', message);
}

export default function DemarcheDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const procedure = useMemo(() => PROCEDURES.find((item) => item.id === id), [id]);
  const { profile } = useUserProfile();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const [step, setStep] = useState<WizardStep>('overview');
  const [values, setValues] = useState<Record<string, string>>({});
  const [prefilledKeys, setPrefilledKeys] = useState<Set<string>>(new Set());
  const [checkedDocuments, setCheckedDocuments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!procedure) return;
    const initialValues: Record<string, string> = {};
    const initialPrefilled = new Set<string>();
    for (const field of procedure.fields) {
      const fromProfile = field.prefillFromProfile ? profile[field.prefillFromProfile] : undefined;
      if (fromProfile) {
        initialValues[field.key] = fromProfile;
        initialPrefilled.add(field.key);
      } else {
        initialValues[field.key] = '';
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- réinitialisation au changement de démarche
    setValues(initialValues);
    setPrefilledKeys(initialPrefilled);
    // Volontairement dépendant de `procedure.id` uniquement : on ne veut réinitialiser le
    // formulaire qu'au changement de démarche, pas à chaque frappe dans le profil ailleurs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedure?.id]);

  if (!procedure) {
    return (
      <ThemedView style={styles.screen}>
        <ScreenHeaderBar title="Démarche introuvable" onBack={() => router.back()} />
        <ThemedText style={styles.notFound}>Cette démarche n’existe pas ou plus.</ThemedText>
      </ThemedView>
    );
  }

  const handleBack = () => {
    if (step === 'overview') {
      router.back();
    } else if (step === 'form') {
      setStep('overview');
    } else if (step === 'documents') {
      setStep('form');
    } else {
      setStep('documents');
    }
  };

  const handleContinueFromForm = () => {
    const missing = procedure.fields.filter((field) => field.required && !(values[field.key] ?? '').trim());
    if (missing.length > 0) {
      showMissingFieldsAlert(missing.map((field) => field.label));
      return;
    }
    setStep('documents');
  };

  const handleFinish = () => {
    const message = 'Votre dossier est prêt. Vous pouvez le présenter à l’organisme ou le compléter en ligne.';
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Démarche préparée ✓', message);
    }
    router.back();
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
      paddingBottom: safeAreaInsets.bottom + Spacing.six,
    },
    web: { paddingBottom: Spacing.six },
  });

  return (
    <ThemedView style={styles.screen}>
      <ScreenHeaderBar title={procedure.title} onBack={handleBack} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <ThemedView style={styles.container}>
          {step !== 'overview' && (
            <ThemedView style={styles.stepperWrap}>
              <Stepper steps={STEP_LABELS} currentIndex={STEP_INDEX[step]} />
            </ThemedView>
          )}

          {step === 'overview' && (
            <ThemedView style={styles.section}>
              <ThemedView type="background" style={[styles.overviewCard, CardShadow, { borderColor: theme.cardBorder }]}>
                <IconChip name={procedure.icon} variant="turquoise" size={44} />
                <ThemedText type="screenTitle">{procedure.title}</ThemedText>
                <ThemedText themeColor="textSecondary">{procedure.summary}</ThemedText>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                    <ThemedText type="label" themeColor="textSecondary">
                      {procedure.durationEstimate}
                    </ThemedText>
                  </View>
                  {procedure.cerfaNumber && (
                    <View style={styles.metaItem}>
                      <Ionicons name="document-text-outline" size={14} color={theme.textSecondary} />
                      <ThemedText type="label" themeColor="textSecondary">
                        {procedure.cerfaNumber}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <Ionicons
                      name={procedure.online ? 'wifi-outline' : 'business-outline'}
                      size={14}
                      color={theme.textSecondary}
                    />
                    <ThemedText type="label" themeColor="textSecondary">
                      {procedure.online ? 'Réalisable en ligne' : 'À faire sur place'}
                    </ThemedText>
                  </View>
                </View>
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText type="sectionTitle">Pièces à prévoir</ThemedText>
                <View style={styles.docPreviewList}>
                  {procedure.documents.map((document) => (
                    <View key={document.id} style={styles.docPreviewRow}>
                      <Ionicons name="ellipse" size={5} color={theme.textSecondary} />
                      <ThemedText themeColor="textSecondary">{document.label}</ThemedText>
                    </View>
                  ))}
                </View>
              </ThemedView>

              <PrimaryButton onPress={() => setStep('form')}>Commencer</PrimaryButton>
            </ThemedView>
          )}

          {step === 'form' && (
            <ThemedView style={styles.section}>
              <ThemedText themeColor="textSecondary">
                Vérifiez et complétez vos informations. Les champs suivis d’une étoile sont
                obligatoires.
              </ThemedText>
              <DynamicForm
                fields={procedure.fields}
                values={values}
                prefilledKeys={prefilledKeys}
                onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
              />
              <PrimaryButton onPress={handleContinueFromForm}>Continuer</PrimaryButton>
            </ThemedView>
          )}

          {step === 'documents' && (
            <ThemedView style={styles.section}>
              <ThemedText themeColor="textSecondary">
                Cochez les pièces que vous avez déjà en votre possession.
              </ThemedText>
              <DocumentChecklist
                documents={procedure.documents}
                checked={checkedDocuments}
                onToggle={(docId) => setCheckedDocuments((current) => ({ ...current, [docId]: !current[docId] }))}
              />
              <PrimaryButton onPress={() => setStep('recap')}>Voir le récapitulatif</PrimaryButton>
            </ThemedView>
          )}

          {step === 'recap' && (
            <ThemedView style={styles.section}>
              <ThemedView type="background" style={[styles.recapCard, CardShadow, { borderColor: theme.cardBorder }]}>
                <View style={styles.recapHeader}>
                  <ThemedText type="sectionTitle">{procedure.title}</ThemedText>
                  {procedure.cerfaNumber && (
                    <ThemedView type="turquoiseTint" style={styles.recapBadge}>
                      <ThemedText type="caption" style={{ color: theme.turquoiseTintText }}>
                        {procedure.cerfaNumber}
                      </ThemedText>
                    </ThemedView>
                  )}
                </View>
                <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
                {procedure.fields
                  .filter((field) => (values[field.key] ?? '').trim().length > 0)
                  .map((field) => (
                    <View key={field.key} style={styles.recapRow}>
                      <ThemedText type="label" themeColor="textSecondary" style={styles.recapLabel}>
                        {field.label}
                      </ThemedText>
                      <ThemedText style={styles.recapValue}>{values[field.key]}</ThemedText>
                    </View>
                  ))}
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText type="sectionTitle">Pièces jointes</ThemedText>
                {procedure.documents.map((document) => (
                  <View key={document.id} style={styles.recapDocRow}>
                    <Ionicons
                      name={checkedDocuments[document.id] ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={checkedDocuments[document.id] ? theme.primary : theme.textSecondary}
                    />
                    <ThemedText themeColor={checkedDocuments[document.id] ? 'text' : 'textSecondary'}>
                      {document.label}
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>

              <ThemedText type="caption" themeColor="textSecondary">
                Aperçu de démonstration : la génération automatique du formulaire CERFA pré-rempli
                arrive dans une prochaine version.
              </ThemedText>

              <View style={styles.recapActions}>
                <OutlineButton icon="create-outline" onPress={() => setStep('form')}>
                  Modifier mes informations
                </OutlineButton>
                <PrimaryButton onPress={handleFinish} icon="checkmark-circle-outline">
                  Terminer
                </PrimaryButton>
              </View>
            </ThemedView>
          )}
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
  stepperWrap: {
    paddingBottom: Spacing.one,
  },
  section: {
    gap: Spacing.three,
  },
  overviewCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docPreviewList: {
    gap: Spacing.two,
  },
  docPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recapCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  recapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recapBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Spacing.five,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  recapLabel: {
    flex: 1,
  },
  recapValue: {
    flex: 1,
    textAlign: 'right',
  },
  recapDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recapActions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  notFound: {
    padding: Spacing.four,
  },
});
