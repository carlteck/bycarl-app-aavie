import type { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { IconChip } from './icon-chip';
import { OutlineButton } from './outline-button';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { remoteErrorMessage, type RemoteErrorKind } from '@/lib/remote-error';

type IconName = keyof typeof Ionicons.glyphMap;

/** Chargement initial. `accessibilityLiveRegion` annonce l'état aux lecteurs d'écran. */
export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
    </View>
  );
}

/** Échec : dit ce qui s'est passé en mots simples et propose de réessayer. */
export function ErrorState({
  kind,
  onRetry,
}: {
  kind: RemoteErrorKind;
  onRetry?: () => void;
}) {
  return (
    <View
      style={styles.center}
      accessible={false}
      accessibilityLiveRegion="assertive"
    >
      <IconChip name="cloud-offline-outline" variant="coral" size={56} />
      <ThemedText type="sectionTitle" style={styles.text}>
        Chargement impossible
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.text}>
        {remoteErrorMessage(kind)}
      </ThemedText>
      {onRetry && kind !== 'auth' ? (
        <OutlineButton icon="refresh-outline" onPress={onRetry}>
          Réessayer
        </OutlineButton>
      ) : null}
    </View>
  );
}

/** Bandeau non bloquant : la liste reste lisible, l'actualisation a échoué. */
export function InlineError({
  kind,
  onRetry,
}: {
  kind: RemoteErrorKind;
  onRetry?: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[styles.inline, { backgroundColor: theme.coralTint }]}
      accessibilityLiveRegion="polite"
    >
      <ThemedText type="caption" themeColor="accent" style={styles.flex}>
        {remoteErrorMessage(kind)}
      </ThemedText>
      {onRetry && kind !== 'auth' ? (
        <OutlineButton onPress={onRetry}>Réessayer</OutlineButton>
      ) : null}
    </View>
  );
}

/** Message d'information non bloquant (repli annoncé, contenu partiel…). */
export function Notice({
  icon = 'information-circle-outline',
  children,
  action,
}: {
  icon?: IconName;
  children: string;
  action?: { label: string; onPress: () => void };
}) {
  const theme = useTheme();
  return (
    <View
      style={[styles.inline, { backgroundColor: theme.backgroundElement }]}
      accessibilityLiveRegion="polite"
    >
      <IconChip name={icon} size={32} />
      <ThemedText type="caption" themeColor="textSecondary" style={styles.flex}>
        {children}
      </ThemedText>
      {action ? (
        <OutlineButton onPress={action.onPress}>{action.label}</OutlineButton>
      ) : null}
    </View>
  );
}

type ResourceLike<T> = {
  status: 'loading' | 'ready' | 'missing' | 'error';
  data: T | null;
  error: RemoteErrorKind | null;
  retry: () => void;
};

/** Les quatre états d'une ressource unique ; `children` ne reçoit que la donnée valide. */
export function ResourceView<T>({
  resource,
  loadingLabel,
  missing,
  children,
}: {
  resource: ResourceLike<T>;
  loadingLabel: string;
  missing: { title: string; message: string };
  children: (data: T) => ReactNode;
}) {
  if (resource.status === 'loading')
    return <LoadingState label={loadingLabel} />;
  if (resource.status === 'missing')
    return (
      <EmptyState
        icon="alert-circle-outline"
        title={missing.title}
        message={missing.message}
      />
    );
  if (resource.data === null)
    return (
      <ErrorState kind={resource.error ?? 'unknown'} onRetry={resource.retry} />
    );
  return <>{children(resource.data)}</>;
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.center}>
      <IconChip name={icon} size={56} />
      <ThemedText type="sectionTitle" style={styles.text}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText themeColor="textSecondary" style={styles.text}>
          {message}
        </ThemedText>
      ) : null}
      {action ? (
        <OutlineButton onPress={action.onPress}>{action.label}</OutlineButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
  },
  text: { textAlign: 'center' },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    padding: Spacing.three,
  },
  flex: { flex: 1 },
});
