import { useWindowDimensions } from 'react-native';

const TABLET_SHORTEST_SIDE = 600;

export function useTabletLayout() {
  const { width, height } = useWindowDimensions();
  return Math.min(width, height) >= TABLET_SHORTEST_SIDE;
}
