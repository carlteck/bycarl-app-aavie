import { Linking, Platform } from 'react-native';

/** Ouvre l'app de plans du système (ou Google Maps sur le web) pour l'adresse donnée. */
export async function openDirections(address: string) {
  const encoded = encodeURIComponent(address);
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  if (Platform.OS === 'web') {
    await Linking.openURL(webUrl);
    return;
  }

  const nativeUrl = Platform.select({
    ios: `maps://?q=${encoded}`,
    android: `geo:0,0?q=${encoded}`,
    default: webUrl,
  });

  const canOpenNative = await Linking.canOpenURL(nativeUrl);
  await Linking.openURL(canOpenNative ? nativeUrl : webUrl);
}
