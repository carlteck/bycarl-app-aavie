// À activer après la migration et le déploiement des routes mobiles de l'API AAVIE.
export const isAssistantEnabled =
  process.env.EXPO_PUBLIC_ASSISTANT_ENABLED === 'true';
