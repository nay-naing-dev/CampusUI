import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeMedal, BadgeSheet } from '@/components/BadgeMedal';
import { BrandBackground } from '@/components/BrandBackground';
import { BackButton } from '@/components/Controls';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { FlagIcon, ShieldIcon } from '@/components/Icons';
import { lookFor, StudentFigure } from '@/components/Illustrations';
import { ListingGrid } from '@/components/Listing';
import { UniCrest } from '@/components/UniCrest';
import { api } from '@/lib/api';
import type { Badge } from '@/lib/api/types';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { findUniversity } from '@/theme/universities';

/** Another student's public profile: what "Other students see", badges and live listings. */
export default function UserProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user: viewer } = useSession();
  const [openBadge, setOpenBadge] = useState<Badge | null>(null);

  const load = useCallback(() => api.users.profile(id, viewer?.id ?? null), [id, viewer?.id]);
  const profile = useApi(load);

  // Your own profile has its own tab.
  if (viewer?.id === id) return <Redirect href="/profile" />;

  const data = profile.data;
  const person = data?.user;
  const campus = findUniversity(person?.universityId);
  const earned = data?.badges.filter((badge) => badge.earned) ?? [];
  const facts = person
    ? [
        { label: 'Major', value: person.major },
        { label: 'Year', value: person.year },
        { label: 'Hometown', value: person.hometown },
        { label: 'Contact', value: person.contact },
      ].filter((fact) => fact.value)
    : [];

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View className="px-5 pb-10" style={{ paddingTop: insets.top + 8 }}>
          <BrandBackground />
          <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/search'))} />
          {person && (
            <View className="mt-1 flex-row items-end">
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <StudentFigure width={100} skirt={campus?.theme.uniform} {...lookFor(person)} leftArm="wave" />
              </View>
              <View className="mb-6 ml-3 flex-1">
                <Text accessibilityRole="header" className="font-heading text-[26px] leading-[30px] text-white">
                  {person.fullName}
                </Text>
                {campus && (
                  <View className="mt-2 flex-row items-center self-start rounded-full bg-white/20 py-1 pl-1 pr-3">
                    <UniCrest university={campus} size={20} rim />
                    <Text className="ml-1.5 font-body-semibold text-[12.5px] text-white">{campus.label}</Text>
                  </View>
                )}
                {person.verification === 'verified' && (
                  <View className="mt-2 flex-row items-center self-start rounded-full bg-mint-wash px-2.5 py-1">
                    <ShieldIcon size={13} color={colors.mint.deep} />
                    <Text className="ml-1 font-body-bold text-[12px] text-mint-deep">Verified student</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View className="-mt-6 rounded-t-[28px] bg-canvas px-5 pt-5">
          {profile.error && !data ? (
            <ErrorState message={profile.error} onRetry={profile.reload} />
          ) : !data || !person ? (
            <LoadingState />
          ) : (
            <>
              <View className="flex-row gap-2.5">
                {[
                  { label: 'sold', value: String(person.sold) },
                  { label: 'bought', value: String(person.bought) },
                  { label: 'rating', value: person.rating ? person.rating.toFixed(1) : '–' },
                ].map((stat) => (
                  <View key={stat.label} className="flex-1 rounded-2xl bg-tint px-3.5 py-3">
                    <Text className="font-heading text-[22px] text-ink">{stat.value}</Text>
                    <Text className="font-body text-[12.5px] text-muted">{stat.label}</Text>
                  </View>
                ))}
              </View>

              {facts.length > 0 && (
                <View className="mt-5 flex-row flex-wrap rounded-2xl bg-white px-4 py-2">
                  {facts.map((fact) => (
                    <View key={fact.label} className="w-1/2 py-2 pr-2">
                      <Text className="font-body text-[12px] text-muted">{fact.label}</Text>
                      <Text numberOfLines={1} className="font-body-bold text-[14.5px] text-ink">
                        {fact.value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {earned.length > 0 && (
                <>
                  <Text className="mb-2 mt-6 font-body-bold text-[13.5px] text-muted">Badges · {earned.length}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                    {earned.map((badge) => (
                      <Pressable
                        key={badge.id}
                        accessibilityRole="button"
                        accessibilityLabel={badge.title}
                        onPress={() => setOpenBadge(badge)}
                        className="w-[76px] items-center active:opacity-70"
                      >
                        <BadgeMedal badge={badge} size={52} />
                        <Text numberOfLines={2} className="mt-1.5 text-center font-body-semibold text-[11.5px] leading-[14px] text-ink">
                          {badge.title}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text className="mb-3 mt-6 font-heading text-[18px] text-ink">Selling now</Text>
              {data.listings.length === 0 ? (
                <EmptyState emoji="🏷️" title="Nothing for sale" body={`${person.fullName.split(' ')[0]} has nothing listed right now.`} />
              ) : (
                <ListingGrid listings={data.listings} columns={3} />
              )}

              {viewer && data.listings[0] && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: '/report', params: { listingId: data.listings[0].id, target: 'seller', userName: person.fullName } })
                  }
                  className="mt-6 flex-row items-center self-center py-2"
                >
                  <FlagIcon size={15} color={colors.muted} />
                  <Text className="ml-1.5 font-body-semibold text-[13px] text-muted">Report {person.fullName.split(' ')[0]}</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <BadgeSheet badge={openBadge} onClose={() => setOpenBadge(null)} />
    </View>
  );
}
