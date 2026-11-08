import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BellIcon, ChevronRightIcon, EditIcon, LockIcon, LogoutIcon, PlusIcon, TagIcon, TrashIcon } from '@/components/Icons';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

type RowProps = { icon: ReactNode; label: string; detail?: string; onPress: () => void; danger?: boolean };

function Row({ icon, label, detail, onPress, danger = false }: RowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} className="flex-row items-center px-4 py-3.5 active:bg-canvas">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-[#FDE8E7]' : 'bg-tint'}`}>{icon}</View>
      <View className="ml-3 flex-1">
        <Text className={`font-body-semibold text-[15px] ${danger ? 'text-danger' : 'text-ink'}`}>{label}</Text>
        {detail ? <Text className="font-body text-[12.5px] text-muted">{detail}</Text> : null}
      </View>
      {!danger && <ChevronRightIcon size={18} color={colors.muted} />}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Text className="mb-2 mt-6 px-1 font-body-bold text-[12px] tracking-[1.4px] text-muted">{title}</Text>
      <View className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 6px 18px rgba(36,20,65,0.06)' }}>
        {children}
      </View>
    </>
  );
}

const Divider = () => <View className="ml-16 h-px bg-line" />;

/** Settings, from the gear on Profile. Sign out and Delete account live here. */
export default function SettingsRoute() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useSession();
  const { theme, previewTheme } = useTheme();

  if (!user) return null;

  const doSignOut = () => {
    previewTheme(null);
    logout();
    router.dismissAll();
    router.replace('/welcome');
  };

  // Alert has no buttons on web, so sign out straight away there.
  const signOut = () =>
    Platform.OS === 'web'
      ? doSignOut()
      : Alert.alert('Sign out?', 'You can log back in with your Gmail anytime.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign out', style: 'destructive', onPress: doSignOut },
        ]);

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader back title="Settings" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
        <Section title="ACCOUNT">
          <Row icon={<EditIcon size={18} color={theme.accent} />} label="Edit profile" detail="Name, major, year, hometown, contact" onPress={() => router.push('/edit-profile')} />
          <Divider />
          <Row icon={<BellIcon size={18} color={theme.accent} />} label="Notifications" onPress={() => router.push('/notifications')} />
          <Divider />
          <Row icon={<LockIcon size={18} color={theme.accent} />} label="Change password" detail={user.email} onPress={() => router.push('/forgot-password')} />
        </Section>

        <Section title="SELLING">
          <Row icon={<TagIcon size={18} color={theme.accent} />} label="My listings" detail="Available, on hold and sold" onPress={() => router.push('/my-listings')} />
          <Divider />
          <Row icon={<PlusIcon size={18} color={theme.accent} />} label="Sell an item" detail="Photos, price, category, meet-up spot" onPress={() => router.push('/sell-item')} />
        </Section>

        <Section title="LEAVE">
          <Row icon={<LogoutIcon size={18} color={colors.danger} />} label="Sign out" danger onPress={signOut} />
          <Divider />
          <Row icon={<TrashIcon size={18} color={colors.danger} />} label="Delete account" danger onPress={() => router.push('/delete-account')} />
        </Section>

        <Text className="mt-6 text-center font-body text-[12px] text-muted">CampusLoop · UI preview (no backend)</Text>
      </ScrollView>
    </View>
  );
}
