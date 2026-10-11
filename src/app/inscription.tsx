import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChip } from '@/components/icon-chip';
import { OutlineButton } from '@/components/outline-button';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeaderBar } from '@/components/screen-header-bar';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth, type AccountType } from '@/context/auth-context';
import { DEFAULT_LOCALE, LOCALES } from '@/constants/locales';
import { REGISTRATION_CONSENT_LINKS } from '@/constants/legal';
import { ApiError, NetworkError } from '@/lib/api';
import { fetchActiveConsentDocuments } from '@/lib/legal';
import { openExternalLink } from '@/lib/open-link';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

export default function InscriptionScreen() {
  const { register } = useAuth();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [locale, setLocale] = useState(DEFAULT_LOCALE.code);
  const [company, setCompany] = useState({
    legalName: '',
    legalForm: '',
    siret: '',
    vatNumber: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    contactRole: '',
  });
  const setCompanyField = (field: keyof typeof company) => (value: string) =>
    setCompany((current) => ({ ...current, [field]: value }));

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [consentDocuments, setConsentDocuments] = useState<{
    privacyDocumentId: string | null;
    termsDocumentId: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchActiveConsentDocuments()
      .then((documents) => {
        if (active) setConsentDocuments(documents);
      })
      .catch(() => {
        // Une case qui ne peut de toute façon pas être validée côté serveur : `handleSubmit`
        // le signale au moment de la soumission plutôt que de bloquer l'affichage du formulaire.
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      email.trim() === '' ||
      password === ''
    ) {
      setError('Tous les champs sont requis.');
      return;
    }

    if (!legalAccepted) {
      setError(
        'Vous devez accepter la politique de confidentialité et les conditions d’utilisation pour créer un compte.',
      );
      return;
    }

    if (
      !consentDocuments?.privacyDocumentId ||
      !consentDocuments.termsDocumentId
    ) {
      setError(
        'Impossible de vérifier les conditions actuelles. Vérifiez votre connexion et réessayez.',
      );
      return;
    }

    if (accountType === 'company') {
      const requis = [
        company.legalName,
        company.legalForm,
        company.siret,
        company.addressLine1,
        company.postalCode,
        company.city,
      ];
      if (requis.some((value) => value.trim() === '')) {
        setError('Les informations de l’entreprise sont incomplètes.');
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        accountType,
        locale,
        company: accountType === 'company' ? company : undefined,
        consentDocumentId: consentDocuments.privacyDocumentId,
        termsDocumentId: consentDocuments.termsDocumentId,
      });
      setConfirmationRequired(result.confirmationRequired);
      setIsSubmitting(false);
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof NetworkError
          ? e.message
          : 'Création impossible. Réessayez dans un instant.',
      );
      setIsSubmitting(false);
    }
  }

  if (confirmationRequired) {
    return (
      <ThemedView type="pageBackground" style={styles.screen}>
        <ScreenHeaderBar
          title="Confirmez votre adresse e-mail"
          onBack={() => router.replace('/connexion')}
          backLabel="Connexion"
        />
        <View style={{ padding: Spacing.four, gap: Spacing.three }}>
          <ThemedText>
            Consultez votre messagerie et ouvrez le lien de confirmation pour
            activer votre compte.
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Le lien s’ouvre dans votre navigateur. Une fois votre adresse
            confirmée, revenez dans l’application pour vous connecter.
          </ThemedText>
          <PrimaryButton onPress={() => router.replace('/connexion')}>
            Aller à la connexion
          </PrimaryButton>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="pageBackground" style={styles.screen}>
      <ScreenHeaderBar
        title="Créer mon compte"
        onBack={() => router.back()}
        backLabel="Accueil"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[styles.flex, { backgroundColor: theme.pageBackground }]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingLeft: Spacing.four + safeAreaInsets.left,
              paddingRight: Spacing.four + safeAreaInsets.right,
              paddingBottom: safeAreaInsets.bottom + Spacing.four,
            },
          ]}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.background,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.intro}>
              <ThemedText type="screenTitle">Créer votre compte</ThemedText>
              <ThemedText themeColor="textSecondary">
                Créez votre compte pour accéder à l’application mobile, avec les
                mêmes identifiants.
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="label">
                Vous vous inscrivez en tant que
              </ThemedText>
              <View style={styles.choiceRow}>
                {(
                  [
                    {
                      value: 'individual',
                      label: 'Particulier',
                      hint: 'Démarches personnelles',
                    },
                    {
                      value: 'company',
                      label: 'Entreprise',
                      hint: 'TPE, indépendant',
                    },
                  ] as const
                ).map((option) => {
                  const selected = accountType === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setAccountType(option.value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.choice,
                        {
                          borderColor: selected
                            ? theme.primary
                            : theme.cardBorder,
                          backgroundColor: selected
                            ? theme.turquoiseTint
                            : theme.background,
                        },
                      ]}
                    >
                      <ThemedText type="label">{option.label}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {option.hint}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="label">Langue de votre espace</ThemedText>
              <View style={styles.localeRow}>
                {LOCALES.map((entry) => {
                  const selected = locale === entry.code;
                  return (
                    <Pressable
                      key={entry.code}
                      onPress={() => setLocale(entry.code)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={entry.label}
                      style={[
                        styles.localeChip,
                        {
                          borderColor: selected
                            ? theme.primary
                            : theme.cardBorder,
                          backgroundColor: selected
                            ? theme.turquoiseTint
                            : theme.background,
                        },
                      ]}
                    >
                      <ThemedText type="caption">
                        {entry.flag} {entry.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              {/* L'interface mobile n'est pas encore traduite : le choix est enregistré sur le
                  compte, mais les écrans restent en français. */}
              <ThemedText type="caption" themeColor="textSecondary">
                L’application reste en français pour l’instant ; votre choix
                s’applique à votre compte mobile.
              </ThemedText>
            </View>

            {accountType === 'company' && (
              <View
                style={[styles.companyBlock, { borderColor: theme.cardBorder }]}
              >
                <ThemedText type="sectionTitle">Votre entreprise</ThemedText>

                <TextField
                  label="Raison sociale"
                  value={company.legalName}
                  onChangeText={setCompanyField('legalName')}
                  placeholder="Nom de l’entreprise"
                  autoCapitalize="words"
                />
                <TextField
                  label="Forme juridique"
                  value={company.legalForm}
                  onChangeText={setCompanyField('legalForm')}
                  placeholder="SARL, SAS, auto-entrepreneur…"
                />
                <TextField
                  label="SIRET"
                  value={company.siret}
                  onChangeText={setCompanyField('siret')}
                  placeholder="14 chiffres"
                  keyboardType="number-pad"
                />
                <TextField
                  label="N° de TVA (facultatif)"
                  value={company.vatNumber}
                  onChangeText={setCompanyField('vatNumber')}
                  placeholder="FR12345678901"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TextField
                  label="Adresse du siège"
                  value={company.addressLine1}
                  onChangeText={setCompanyField('addressLine1')}
                  placeholder="Numéro et rue"
                />
                <TextField
                  label="Complément d’adresse (facultatif)"
                  value={company.addressLine2}
                  onChangeText={setCompanyField('addressLine2')}
                  placeholder="Bâtiment, résidence…"
                />
                <TextField
                  label="Code postal"
                  value={company.postalCode}
                  onChangeText={setCompanyField('postalCode')}
                  placeholder="97300"
                  keyboardType="number-pad"
                />
                <TextField
                  label="Ville"
                  value={company.city}
                  onChangeText={setCompanyField('city')}
                  placeholder="Cayenne"
                  autoCapitalize="words"
                />
                <TextField
                  label="Votre fonction (facultatif)"
                  value={company.contactRole}
                  onChangeText={setCompanyField('contactRole')}
                  placeholder="Gérant, présidente…"
                  autoCapitalize="sentences"
                />
              </View>
            )}

            <TextField
              label={accountType === 'company' ? 'Prénom du contact' : 'Prénom'}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Votre prénom"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
            />

            <TextField
              label={accountType === 'company' ? 'Nom du contact' : 'Nom'}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Votre nom"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
            />

            <TextField
              label="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="prenom.nom@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
              returnKeyType="next"
            />

            <TextField
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secure
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <Pressable
              onPress={() => setLegalAccepted((current) => !current)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: legalAccepted }}
              accessibilityLabel="J’accepte la politique de confidentialité et les conditions d’utilisation"
              style={styles.consentRow}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: legalAccepted
                      ? theme.primary
                      : theme.cardBorder,
                    backgroundColor: legalAccepted
                      ? theme.primary
                      : theme.background,
                  },
                ]}
              >
                {legalAccepted && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <ThemedText themeColor="textSecondary" style={styles.consentText}>
                J’ai lu et j’accepte la{' '}
                <ThemedText
                  themeColor="primary"
                  onPress={() =>
                    void openExternalLink(REGISTRATION_CONSENT_LINKS[0].url)
                  }
                  accessibilityRole="link"
                >
                  politique de confidentialité
                </ThemedText>{' '}
                et les{' '}
                <ThemedText
                  themeColor="primary"
                  onPress={() =>
                    void openExternalLink(REGISTRATION_CONSENT_LINKS[1].url)
                  }
                  accessibilityRole="link"
                >
                  conditions d’utilisation
                </ThemedText>
                .
              </ThemedText>
            </Pressable>

            {error && (
              <ThemedText
                type="label"
                themeColor="accent"
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
              >
                {error}
              </ThemedText>
            )}

            <PrimaryButton onPress={handleSubmit} icon="person-add-outline">
              {isSubmitting ? 'Création…' : 'Créer mon compte'}
            </PrimaryButton>

            <View
              style={[styles.notice, { backgroundColor: theme.turquoiseTint }]}
            >
              <IconChip name="gift-outline" variant="primary" />
              <View style={styles.noticeText}>
                <ThemedText type="label" themeColor="turquoiseTintText">
                  Des crédits offerts chaque mois
                </ThemedText>
                <ThemedText type="caption" themeColor="turquoiseTintText">
                  Vos crédits servent à l’assistant et à l’aide rédactionnelle.
                  L’annuaire, les ressources, la veille, le planificateur et le
                  budget restent gratuits.
                </ThemedText>
              </View>
            </View>

            <View style={styles.alternative}>
              <ThemedText
                type="caption"
                themeColor="textSecondary"
                style={styles.centerText}
              >
                Vous avez déjà un compte ?
              </ThemedText>
              <OutlineButton
                onPress={() => router.replace('/connexion')}
                icon="log-in-outline"
              >
                Se connecter
              </OutlineButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: Math.min(MaxContentWidth, 480),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  intro: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  choice: {
    flex: 1,
    gap: Spacing.half,
    minHeight: 44,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  localeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  localeChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  companyBlock: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    minHeight: 44,
    paddingVertical: Spacing.one,
  },
  checkbox: {
    width: 22,
    height: 22,
    marginTop: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  consentText: {
    flex: 1,
    lineHeight: 20,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    marginTop: Spacing.two,
  },
  noticeText: {
    flex: 1,
    gap: Spacing.half,
  },
  alternative: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
});
