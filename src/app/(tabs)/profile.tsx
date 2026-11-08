import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeMedal, BadgeSheet } from '@/components/BadgeMedal';
import { BrandBackground } from '@/components/BrandBackground';
import { Button, IconButton, Toggle } from '@/components/Controls';
import { ChevronRightIcon, ClockIcon, EyeIcon, PaletteIcon, SettingsIcon, ShieldIcon, ShuffleIcon, TagIcon } from '@/components/Icons';
import { LOOK_COUNT, lookFor, PlainStickman, StudentFigure } from '@/components/Illustrations';
import { LoopMark } from '@/components/LoopMark';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { UniCrest } from '@/components/UniCrest';
import { api } from '@/lib/api';
import type { Badge, ProfileChanges } from '@/lib/api/types';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { DEFAULT_THEME, DEFAULT_THEME_ID, findUniversity, UNIVERSITIES } from '@/theme/universities';

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <View className={`rounded-2xl bg-white ${className}`} style={{ boxShadow: '0 6px 18px rgba(36,20,65,0.06)' }}>
      {children}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 py-2 pr-2">
      <Text className="font-body text-[12px] text-muted">{label}</Text>
      <Text numberOfLines={1} className={`font-body-bold text-[14.5px] ${value ? 'text-ink' : 'text-muted'}`}>
        {value || 'Not set'}
      </Text>
    </View>
  );
}

/** Testing aid: tries each campus theme without a new account. */
function ThemePreview() {
  const { previewTheme, university } = useTheme();
  const { user } = useSession();
  const options = [
    { id: DEFAULT_THEME_ID, short: 'Default', color: DEFAULT_THEME.brand },
    ...UNIVERSITIES.map((item) => ({ id: item.id, short: item.short, color: item.theme.brand })),
  ];
  const activeId = university?.id ?? DEFAULT_THEME_ID;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 14 }}>
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={`${option.short} theme`}
            onPress={() => previewTheme(option.id === user?.universityId ? null : option.id)}
            className={`items-center rounded-2xl border-[1.5px] px-2.5 py-2 ${active ? 'border-loop' : 'border-line'}`}
          >
            <View className="h-7 w-7 rounded-full" style={{ backgroundColor: option.color }} />
            <Text className="mt-1 font-body-semibold text-[11.5px] text-ink">{option.short}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** 18 Profile. */
export default function ProfileRoute() {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useSession();
  const { theme, university, previewTheme } = useTheme();
  const [approving, setApproving] = useState(false);
  const [openBadge, setOpenBadge] = useState<Badge | null>(null);
  const loadBadges = useCallback(async () => (user ? api.users.badges(user.id) : []), [user]);
  const badges = useApi(loadBadges);

  if (!user) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="items-center px-5 pb-8" style={{ paddingTop: insets.top + 24 }}>
          <StatusBar style="light" />
          <BrandBackground />
          <PlainStickman height={180} />
          <Text className="mt-3 font-heading text-[26px] text-white">You’re browsing</Text>
          <Text className="mt-1 text-center font-body text-[15px] text-white/80">Make an account to reserve, sell and chat.</Text>
        </View>
        <View className="gap-3 p-5">
          <Button label="Create a student account" onPress={() => router.push('/signup')} />
          <Button label="Log in" variant="light" onPress={() => router.push('/login')} />
        </View>
      </View>
    );
  }

  // The account's own campus (the theme may be a preview of another).
  const campus = findUniversity(user.universityId);
  const save = async (changes: ProfileChanges) => {
    setUser({ ...user, ...changes });
    setUser(await api.users.update(user.id, changes));
  };

  const approve = async () => {
    setApproving(true);
    try {
      setUser(await api.users.simulateVerification(user.id));
    } finally {
      setApproving(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 10 }}>
        <View className="px-5 pb-10" style={{ paddingTop: insets.top + 8 }}>
          <BrandBackground />
          <View className="flex-row justify-end">
            <IconButton label="Settings" onPress={() => router.push('/settings')}>
              <SettingsIcon size={20} />
            </IconButton>
          </View>
          <View className="-mt-4 flex-row items-end">
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <StudentFigure width={110} skirt={campus?.theme.uniform} {...lookFor(user)} leftArm="wave" />
            </View>
            <View className="mb-6 ml-3 flex-1">
              <Text accessibilityRole="header" className="font-heading text-[28px] leading-[32px] text-white">
                {user.fullName}
              </Text>
              {campus && (
                <View className="mt-2 flex-row items-center self-start rounded-full bg-white/20 py-1 pl-1 pr-3">
                  <UniCrest university={campus} size={20} rim />
                  <Text className="ml-1.5 font-body-semibold text-[12.5px] text-white">{campus.label}</Text>
                </View>
              )}
              <View className={`mt-2 flex-row items-center self-start rounded-full px-2.5 py-1 ${user.verification === 'verified' ? 'bg-mint-wash' : 'bg-[#FFF4D1]'}`}>
                {user.verification === 'verified' ? <ShieldIcon size={13} color={colors.mint.deep} /> : <ClockIcon size={13} color="#8A5A00" />}
                <Text className={`ml-1 font-body-bold text-[12px] ${user.verification === 'verified' ? 'text-mint-deep' : 'text-[#8A5A00]'}`}>
                  {user.verification === 'verified' ? 'Verified student' : 'ID under review'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => save({ look: (user.look + 1) % LOOK_COUNT })}
                className="mt-2 flex-row items-center self-start rounded-full bg-white px-3 py-1.5 active:opacity-80"
              >
                <ShuffleIcon size={14} color={colors.ink} strokeWidth={2.2} />
                <Text className="ml-1.5 font-body-bold text-[12.5px] text-ink">Shuffle my look</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="-mt-6 rounded-t-[28px] bg-canvas px-5 pt-5">
          <View className="flex-row gap-2.5">
            {[
              { label: 'sold', value: String(user.sold) },
              { label: 'bought', value: String(user.bought) },
              { label: 'rating', value: user.rating ? user.rating.toFixed(1) : '–' },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 rounded-2xl bg-tint px-3.5 py-3">
                <Text className="font-heading text-[22px] text-ink">{stat.value}</Text>
                <Text className="font-body text-[12.5px] text-muted">{stat.label}</Text>
              </View>
            ))}
          </View>

          <View className="mb-2 mt-6 flex-row items-center">
            <Text className="flex-1 font-body-bold text-[13.5px] text-muted">
              Badges{badges.data ? ` · ${badges.data.filter((badge) => badge.earned).length} of ${badges.data.length}` : ''}
            </Text>
            <Text className="font-body text-[12px] text-muted">from confirmed sales</Text>
          </View>
          <Card className="px-2 py-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingHorizontal: 6 }}>
              {[...(badges.data ?? [])]
                // Earned first, so the row opens on what they've achieved.
                .sort((a, b) => Number(b.earned) - Number(a.earned))
                .map((badge) => (
                  <Pressable
                    key={badge.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${badge.title}, ${badge.earned ? 'unlocked' : 'locked'}`}
                    onPress={() => setOpenBadge(badge)}
                    className="w-[76px] items-center active:opacity-70"
                  >
                    <BadgeMedal badge={badge} size={56} />
                    <Text numberOfLines={2} className={`mt-1.5 text-center font-body-semibold text-[11.5px] leading-[14px] ${badge.earned ? 'text-ink' : 'text-muted'}`}>
                      {badge.title}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </Card>

          <View className="mb-2 mt-6 flex-row items-center">
            <EyeIcon size={16} color={colors.muted} />
            <Text className="ml-1.5 flex-1 font-body-bold text-[13.5px] text-muted">Other students see</Text>
            <Text accessibilityRole="button" onPress={() => router.push('/edit-profile')} className="font-body-bold text-[13.5px] text-loop">
              Edit
            </Text>
          </View>
          <Card className="flex-row flex-wrap px-4 py-2">
            <Fact label="Major" value={user.major} />
            <Fact label="Year" value={user.year} />
            <Fact label="Hometown" value={user.hometown} />
            <Fact label="Contact" value={user.contact} />
          </Card>

          <Text className="mb-2 mt-6 font-body-bold text-[13.5px] text-muted">Notify me about</Text>
          <Card className="px-4">
            <View className="flex-row items-center border-b border-line py-3.5">
              <Text className="flex-1 font-body-semibold text-[14.5px] text-ink">Reservations and price changes</Text>
              <Toggle label="Reservations and price changes" value={user.notifyReservations} onChange={(value) => save({ notifyReservations: value })} />
            </View>
            <View className="flex-row items-center py-3.5">
              <Text className="flex-1 font-body-semibold text-[14.5px] text-ink">Verification result</Text>
              <Toggle label="Verification result" value={user.notifyVerification} onChange={(value) => save({ notifyVerification: value })} />
            </View>
          </Card>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="My listings"
            onPress={() => router.push('/my-listings')}
            className="mt-5 flex-row items-center rounded-2xl bg-white p-4 active:opacity-80"
            style={{ boxShadow: '0 6px 18px rgba(36,20,65,0.06)' }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-soft">
              <TagIcon size={19} color={theme.accent} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-body-bold text-[15px] text-ink">My listings</Text>
              <Text className="font-body text-[12.5px] text-muted">Everything you’re selling, on hold and sold</Text>
            </View>
            <ChevronRightIcon size={18} color={colors.muted} />
          </Pressable>

          <Text className="mb-2 mt-7 font-body-bold text-[12px] tracking-[1.4px] text-muted">TESTING (NO BACKEND)</Text>
          <Card className="overflow-hidden">
            <View className="flex-row items-center px-4 pb-2.5 pt-3.5">
              <PaletteIcon size={18} color={theme.accent} />
              <Text className="ml-2.5 flex-1 font-body-semibold text-[14.5px] text-ink">Preview campus theme</Text>
              {university?.id !== user.universityId && (
                <Text accessibilityRole="button" onPress={() => previewTheme(null)} className="font-body-bold text-[13px] text-loop">
                  Reset
                </Text>
              )}
            </View>
            <ThemePreview />
            {user.verification === 'pending' && (
              <Pressable accessibilityRole="button" onPress={approve} className="flex-row items-center border-t border-line px-4 py-3.5 active:bg-canvas">
                <ShieldIcon size={18} color={theme.accent} />
                <Text className="ml-2.5 flex-1 font-body-semibold text-[14.5px] text-ink">{approving ? 'Approving…' : 'Approve my student ID'}</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/campus-welcome')}
              className="flex-row items-center border-t border-line px-4 py-3.5 active:bg-canvas"
            >
              <LoopMark width={20} color={theme.accent} />
              <Text className="ml-2.5 flex-1 font-body-semibold text-[14.5px] text-ink">Replay campus splash</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>
      <BadgeSheet badge={openBadge} onClose={() => setOpenBadge(null)} />
    </View>
  );
}
