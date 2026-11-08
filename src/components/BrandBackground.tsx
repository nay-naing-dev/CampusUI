import { StyleSheet, View } from 'react-native';

/**
 * Solid brand-coloured backdrop for headers and heroes. The colour comes from
 * the student's university (CampusLoop purple by default). Deliberately flat:
 * the gradients from the first pass are gone.
 */
export function BrandBackground({ deep = false }: { deep?: boolean }) {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      className={deep ? 'bg-brand-deep' : 'bg-brand'}
    />
  );
}
