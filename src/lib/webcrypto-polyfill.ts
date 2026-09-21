import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

/**
 * Hermes n'expose pas `crypto.subtle` : `@supabase/auth-js` le détecte et bascule silencieusement
 * le PKCE de l'app sur `code_challenge_method=plain` (avertissement « WebCrypto API is not
 * supported »). `expo-crypto` a la même signature que `SubtleCrypto.digest` — ses valeurs
 * `CryptoDigestAlgorithm` sont les mêmes chaînes (`'SHA-256'`, ...), donc un simple transfert
 * suffit, sans mapper les noms.
 *
 * `globalThis.crypto` (avec `getRandomValues`) n'existe pas encore à l'évaluation de ce module :
 * React Native l'installe après le démarrage du bundle. On ne patche donc qu'au premier accès
 * réel, jamais à l'import — patcher trop tôt écraserait un `crypto` qui n'existe pas encore.
 */
function ensureSubtle() {
  const target = globalThis.crypto as (Crypto & { subtle?: unknown }) | undefined;
  if (target && !target.subtle) {
    Object.defineProperty(target, 'subtle', {
      value: {
        digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
          const algorithmName = typeof algorithm === 'string' ? algorithm : algorithm.name;
          return Crypto.digest(algorithmName as Crypto.CryptoDigestAlgorithm, data);
        },
      },
      configurable: true,
    });
  }
}

if (Platform.OS !== 'web') {
  // Après le tick courant : laisse React Native finir d'installer `globalThis.crypto` avant de
  // le compléter, sans retarder la première utilisation réelle (elle n'a lieu qu'à une action
  // de l'utilisateur, bien plus tard).
  setTimeout(ensureSubtle, 0);
}
