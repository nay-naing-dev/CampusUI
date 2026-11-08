import { View } from 'react-native';
import { lookFor, StudentBust } from '@/components/Illustrations';
import type { User } from '@/lib/api/types';
import { DEFAULT_THEME, findUniversity } from '@/theme/universities';

type Person = Pick<User, 'gender' | 'look' | 'universityId'>;

/** A student's stickman, in their own campus uniform, as a round avatar. */
export function Avatar({ person, size = 44, ring = false }: { person: Person; size?: number; ring?: boolean }) {
  const campus = findUniversity(person.universityId);
  const theme = campus?.theme ?? DEFAULT_THEME;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={ring ? 'rounded-full border-2 border-white' : ''}
    >
      <StudentBust size={size} background={theme.soft} skirt={theme.uniform} {...lookFor(person)} />
    </View>
  );
}
