type Permission = { granted: boolean; canAskAgain: boolean };
type PermissionAPI = {
  getPermissionsAsync: () => Promise<Permission>;
  requestPermissionsAsync: () => Promise<Permission>;
};
export async function requestDictationPermission(
  api: PermissionAPI,
  isCurrent: () => boolean,
) {
  const existing = await api.getPermissionsAsync();
  if (!isCurrent()) return 'cancelled';
  if (existing.granted) return 'granted';
  if (!existing.canAskAgain) return 'blocked';
  const requested = await api.requestPermissionsAsync();
  if (!isCurrent()) return 'cancelled';
  if (requested.granted) return 'granted';
  return requested.canAskAgain ? 'denied' : 'blocked';
}
