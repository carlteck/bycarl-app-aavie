import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AAVIE',
  slug: 'aavie-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'aavie',
  userInterfaceStyle: 'automatic',
  // Mises à jour par-dessus l'air (EAS Update). L'URL est celle du projet EAS ; le canal est
  // porté par le profil de build (`eas.json`), pas ici, pour qu'un même code puisse alimenter
  // plusieurs canaux.
  updates: {
    url: 'https://u.expo.dev/9762887e-a5cd-4403-b0dd-35c149a87225',
  },
  // `fingerprint` plutôt que `appVersion` : EAS calcule une empreinte des dépendances natives
  // et de la configuration. Une mise à jour OTA n'atteint donc QUE les binaires réellement
  // compatibles. Avec `appVersion`, un commit touchant du natif serait diffusé à des binaires
  // qui n'en contiennent pas le code — l'application planterait au démarrage chez l'usager.
  runtimeVersion: {
    policy: 'fingerprint',
  },
  ios: {
    bundleIdentifier: 'com.aavie.app',
    infoPlist: {
      CFBundleDevelopmentRegion: 'fr',
      NSFaceIDUsageDescription:
        "AAVIE utilise Face ID pour déverrouiller l'application en toute sécurité.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.aavie.app',
    adaptiveIcon: {
      backgroundColor: '#0E74C7',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0E74C7',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
        resizeMode: 'contain',
      },
    ],
    'expo-font',
    'expo-image',
    'expo-status-bar',
    'expo-web-browser',
    'expo-secure-store',
    [
      'expo-speech-recognition',
      {
        // Ces phrases sont ce que l'usager lit dans la fenêtre du système : elles doivent dire
        // à quoi ça sert, en français simple, pas citer un nom d'API.
        microphonePermission:
          'AAVIE utilise le micro pour vous permettre de dicter vos questions au lieu de les écrire.',
        speechRecognitionPermission:
          'AAVIE transforme votre voix en texte pour remplir vos questions à votre place.',
        androidSpeechServicePackages: [
          'com.google.android.googlequicksearchbox',
        ],
      },
    ],
    'expo-sqlite',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '9762887e-a5cd-4403-b0dd-35c149a87225',
    },
  },
  owner: 'bycarl',
});
