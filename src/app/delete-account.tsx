import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { BackButton, Button, Checkbox } from '@/components/Controls';
import { ActivityIcon, LockIcon, PhotoIcon, UserIcon, WarningIcon } from '@/components/Icons';
import { lookFor, StudentFigure } from '@/components/Illustrations';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { findUniversity } from '@/theme/universities';

function Deleted({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View className="w-1/2 flex-row items-center py-1.5 pr-2">
      {icon}
      <Text className="ml-2 font-body-semibold text-[13.5px] text-ink">{label}</Text>
    </View>
  );
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** 19 Delete account. */
export default function DeleteAccountRoute() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useSession();
  const { theme, previewTheme } = useTheme();
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => (user ? api.users.deletionImpact(user.id) : null), [user]);
  const impact = useApi(load).data;

  if (!user) return null;
  const affected = impact ? impact.holds + impact.reservedListings : 0;

  const remove = async () => {
    setBusy(true);
    await api.users.remove(user.id);
    previewTheme(null);
    logout();
    router.dismissAll();
    router.replace('/welcome');
  };

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="px-5 pb-10" style={{ paddingTop: insets.top + 10 }}>
          <BrandBackground />
          <BackButton onPress={() => router.back()} />
          <View className="flex-row items-end justify-between">
            <Text accessibilityRole="header" className="mb-8 font-heading text-[36px] leading-[40px] text-white">
              Leaving{'\n'}already?
            </Text>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <StudentFigure width={92} skirt={findUniversity(user.universityId)?.theme.uniform} {...lookFor(user)} rightArm="wave" />
            </View>
          </View>
        </View>

        <View className="-mt-6 rounded-t-[28px] bg-canvas px-5 pt-6">
          <Text className="font-body text-[14.5px] leading-[21px] text-muted">
            Deleting your account erases your data for good. To come back you’ll sign up and verify again.
          </Text>

          {affected > 0 && impact && (
            <View className="mt-4 flex-row rounded-2xl border border-[#F7C6C2] bg-[#FDE8E7] p-3.5">
              <WarningIcon size={18} color={colors.danger} />
              <Text className="ml-2.5 flex-1 font-body text-[13.5px] leading-[19px] text-ink">
                {[impact.holds && plural(impact.holds, 'active reservation'), impact.reservedListings && plural(impact.reservedListings, 'reserved listing')]
                  .filter(Boolean)
                  .join(' and ')}{' '}
                will be cancelled. The other students get notified.
              </Text>
            </View>
          )}

          <Text className="mb-1 mt-5 font-body-bold text-[13.5px] text-muted">We delete</Text>
          <View className="flex-row flex-wrap rounded-2xl bg-white px-4 py-2.5">
            <Deleted icon={<UserIcon size={17} color={theme.accent} />} label="Profile" />
            <Deleted icon={<PhotoIcon size={17} color={theme.accent} />} label="Listings and photos" />
            <Deleted icon={<ActivityIcon size={17} color={theme.accent} />} label="Reservations" />
            <Deleted icon={<LockIcon size={17} color={theme.accent} />} label="Student ID photo" />
          </View>

          <View className="mt-5">
            <Checkbox checked={understood} onChange={setUnderstood} label="I understand this is permanent">
              <Text className="font-body-medium text-[14.5px] text-ink">I understand this is permanent.</Text>
            </Checkbox>
          </View>

          <Button label="Delete my account" className="mt-6" disabled={!understood} loading={busy} onPress={remove} />
          <Text accessibilityRole="button" onPress={() => router.back()} className="mt-4 py-1 text-center font-body-bold text-[14.5px] text-loop">
            Keep my account
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
