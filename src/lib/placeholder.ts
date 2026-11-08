import { Alert } from 'react-native';

/** Stands in for flows that have no backend or screen yet. */
export function notBuiltYet(feature: string, detail?: string) {
  Alert.alert(feature, detail ?? 'This is not connected yet.');
}
