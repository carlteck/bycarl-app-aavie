import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from './themed-text';

import { CardShadow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Entrée conversationnelle vers l'assistant (catalogue de démarches), centrée à l'écran façon
 * "appui pour parler" (Shazam). Purement statique pour l'instant : l'envoi vide juste le champ,
 * le micro n'ouvre encore rien, aucun branchement IA (décision en attente — voir mémoire projet
 * `project-ai-backend`, réutilisation probable de l'API bycarl existante plutôt qu'un nouveau
 * backend).
 */
export function AssistantPromptCard() {
  const [value, setValue] = useState('');
  const theme = useTheme();
  const canSend = value.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    setValue('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.micHaloWrap}>
        {/* Logo AAVIE en fond, bulle corail visible (zone de protection respectée : rien ne la
            recouvre) ; le bouton micro flotte devant en badge blanc ombré pour rester lisible et
            détaché du sourire plutôt que de s'y fondre. */}
        <Image
          source={require('@/assets/images/aavie-logo-mark.png')}
          style={styles.micHaloLogo}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Parler à l’assistant"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          {({ pressed }) => (
            <View
              style={[
                styles.micButton,
                CardShadow,
                { backgroundColor: theme.background },
              ]}>
              <Ionicons name="mic" size={30} color={pressed ? theme.primaryPressed : theme.primary} />
            </View>
          )}
        </Pressable>
      </View>

      <ThemedText type="sectionTitle" style={styles.centerText}>
        Demandez à l’assistant
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        Décrivez votre situation, on vous oriente vers la bonne démarche.
      </ThemedText>

      <View style={[styles.inputRow, { backgroundColor: theme.backgroundElement }]}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Ex : je viens de déménager, que dois-je faire ?"
          placeholderTextColor={theme.textSecondary}
          multiline
          accessibilityLabel="Votre message pour l’assistant"
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Envoyer"
          accessibilityState={{ disabled: !canSend }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {({ pressed }) => (
            <View
              style={[
                styles.sendButton,
                {
                  backgroundColor: !canSend
                    ? theme.cardBorder
                    : pressed
                      ? theme.primaryPressed
                      : theme.primary,
                },
              ]}>
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    gap: Spacing.three,
  },
  micHaloWrap: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHaloLogo: {
    position: 'absolute',
    width: 190,
    height: 190,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    marginTop: Spacing.two,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    fontSize: 16,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
