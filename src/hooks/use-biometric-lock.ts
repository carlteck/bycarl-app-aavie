import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { isBiometricEnabled, setBiometricEnabled } from '@/lib/session-storage';

export function useBiometricLock(userId?: string) {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(Platform.OS === 'web');
  const [unlockedUser, setUnlockedUser] = useState<string>();
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );
  const lifecycle = useRef({ active: false, generation: 0, busy: false });

  useEffect(() => {
    const life = lifecycle.current;
    life.active = true;
    life.generation++;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- le déverrouillage ne traverse jamais un changement de session
    setUnlockedUser(undefined);
    const subscription = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
      if (state === 'background') {
        life.generation++;
        setUnlockedUser(undefined);
      }
    });
    return () => {
      life.active = false;
      life.generation++;
      subscription.remove();
    };
  }, [userId]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    void (async () => {
      let preference = true;
      try {
        preference = await isBiometricEnabled();
      } catch {
        /* Une préférence illisible ne doit pas ouvrir l'espace privé. */
      }
      let supported = false;
      try {
        supported =
          (await LocalAuthentication.hasHardwareAsync()) &&
          (await LocalAuthentication.isEnrolledAsync());
      } catch {
        /* Le verrou existant reste actif même si le matériel devient indisponible. */
      }
      if (active) {
        setEnabled(preference);
        setAvailable(supported);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const confirm = useCallback(async () => {
    const life = lifecycle.current;
    if (
      !userId ||
      Platform.OS === 'web' ||
      !life.active ||
      life.busy ||
      AppState.currentState === 'background'
    )
      return false;
    life.busy = true;
    const generation = life.generation;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Déverrouiller AAVIE',
        cancelLabel: 'Annuler',
        fallbackLabel: 'Utiliser le code du téléphone',
        disableDeviceFallback: false,
      });
      if (!life.active || generation !== life.generation || !result.success)
        return false;
      setUnlockedUser(userId);
      return true;
    } catch {
      return false;
    } finally {
      life.busy = false;
    }
  }, [userId]);

  const toggle = useCallback(
    async (next: boolean) => {
      if (!ready || !userId || (next && !available))
        throw new Error('La biométrie n’est pas disponible sur cet appareil.');
      if (!(await confirm())) return;
      await setBiometricEnabled(next);
      if (lifecycle.current.active) setEnabled(next);
    },
    [available, ready, userId, confirm],
  );

  return {
    biometricEnabled: enabled,
    biometricAvailable: available,
    biometricReady: ready,
    biometricLocked:
      Platform.OS !== 'web' &&
      !!userId &&
      (!ready || (enabled && (unlockedUser !== userId || !foreground))),
    confirmBiometrics: confirm,
    toggleBiometrics: toggle,
  };
}
