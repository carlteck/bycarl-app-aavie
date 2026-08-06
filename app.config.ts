import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "AAVIE",
  slug: "aavie-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "aavie",
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: "fr.bycarl.aavie",
    infoPlist: {
      CFBundleDevelopmentRegion: "fr",
      NSFaceIDUsageDescription:
        "AAVIE utilise Face ID pour déverrouiller l'application en toute sécurité.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "fr.bycarl.aavie",
    adaptiveIcon: {
      backgroundColor: "#0E74C7",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0E74C7",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
        resizeMode: "contain",
      },
    ],
    "expo-font",
    "expo-image",
    "expo-status-bar",
    "expo-web-browser",
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "9762887e-a5cd-4403-b0dd-35c149a87225",
    },
  },
  owner: "bycarl",
});
