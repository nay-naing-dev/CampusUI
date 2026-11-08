import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { Button, IconButton } from '@/components/Controls';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { BellIcon, ChatIcon, ChevronDownIcon, ClockIcon } from '@/components/Icons';
import { FeaturedListing, ListingGrid, ListingTile } from '@/components/Listing';
import { LoopMark } from '@/components/LoopMark';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { UniCrest } from '@/components/UniCrest';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import { useTheme } from '@/theme/ThemeProvider';

function SectionHead({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View className="mb-3 flex-row items-end justify-between">
      <Text className="font-heading text-[18px] text-ink">{title}</Text>
      {onSeeAll && (
        <Text accessibilityRole="link" onPress={onSeeAll} className="font-body-bold text-[13px] text-loop">
          See all
        </Text>
      )}
    </View>
  );
}

function FilterChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-9 flex-row items-center rounded-full border border-white/35 bg-white/15 pl-3.5 pr-2.5 active:opacity-70"
    >
      <Text className="font-body-semibold text-[13px] text-white">{label}</Text>
      <View className="ml-1">
        <ChevronDownIcon size={14} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

export default function MarketRoute() {
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useSession();
  const { university } = useTheme();
  const campusId = user?.universityId ?? null;

  const loadLatest = useCallback(
    () => api.listings.list({ universityId: campusId, excludeSellerId: user?.id }, user?.id ?? null),
    [campusId, user?.id],
  );
  const latest = useApi(loadLatest);
  const loadTrending = useCallback(() => api.listings.trending(campusId, user?.id ?? null), [campusId, user?.id]);
  const trending = useApi(loadTrending);
  const loadUnread = useCallback(
    async () => (user ? (await api.notifications.list(user)).filter((item) => !item.read).length : 0),
    [user],
  );
  const unread = useApi(loadUnread);

  const [featured, ...rest] = latest.data ?? [];
  const openSearch = (params?: { category?: string; filters?: string }) => router.push({ pathname: '/search', params });

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={latest.reload} tintColor="#fff" />}
      >
        <View className="px-5 pb-12" style={{ paddingTop: insets.top + 10 }}>
          <BrandBackground />
          <View className="flex-row items-center">
            <LoopMark width={34} />
            <Text className="ml-2 flex-1 font-heading text-[20px] text-white">CampusLoop</Text>
            {university && (
              <View className="mr-2">
                <UniCrest university={university} size={30} rim />
              </View>
            )}
            {user && (
              <View className="flex-row gap-2">
                <IconButton label="Messages" onPress={() => router.push('/inbox')}>
                  <ChatIcon size={19} />
                </IconButton>
                <IconButton label={unread.data ? `Notifications, ${unread.data} unread` : 'Notifications'} onPress={() => router.push('/notifications')}>
                  <BellIcon size={19} />
                  {!!unread.data && <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-highlight" />}
                </IconButton>
              </View>
            )}
          </View>

          <View className="mt-5 flex-row gap-2.5">
            {CATEGORIES.slice(0, 4).map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={category.label}
                onPress={() => openSearch({ category: category.id })}
                className="flex-1 items-center active:opacity-80"
              >
                <View className="aspect-square w-full items-center justify-center rounded-2xl border-2 border-white/70" style={{ backgroundColor: category.tint }}>
                  <Text className="text-[28px]">{category.emoji}</Text>
                </View>
                <Text className="mt-1.5 font-body-semibold text-[12.5px] text-white">{category.label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 mt-4" contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            <FilterChip label={university?.label ?? 'All campuses'} onPress={() => openSearch()} />
            <FilterChip label="Price" onPress={() => openSearch({ filters: 'open' })} />
            <FilterChip label="Condition" onPress={() => openSearch({ filters: 'open' })} />
          </ScrollView>
        </View>

        <View className="-mt-7 rounded-t-[28px] bg-canvas px-5 pt-5">
          {user?.verification === 'pending' && (
            <View className="mb-5 flex-row items-center rounded-2xl bg-[#FDF0D5] px-4 py-3">
              <ClockIcon size={17} color="#B7791F" />
              <Text className="ml-2.5 flex-1 font-body text-[13.5px] text-ink">
                <Text className="font-body-bold">ID under review</Text> · you can browse while you wait
              </Text>
            </View>
          )}
          {isGuest && (
            <View className="mb-5 rounded-2xl bg-white p-4" style={{ boxShadow: '0 6px 18px rgba(36,20,65,0.06)' }}>
              <Text className="font-body-bold text-[15px] text-ink">Browsing every campus</Text>
              <Text className="mt-1 font-body text-[13.5px] leading-[19px] text-muted">
                Sign up with your Gmail and pick your university to get your campus market and colours.
              </Text>
              <Button label="Create a student account" size="small" className="mt-3" onPress={() => router.push('/signup')} />
            </View>
          )}

          {latest.error && !latest.data ? (
            <ErrorState message={latest.error} onRetry={latest.reload} />
          ) : !latest.data ? (
            <LoadingState />
          ) : !featured ? (
            <EmptyState
              emoji="🛍️"
              title="Nothing listed yet"
              body="Be the first to sell something on your campus."
              action={user ? { label: 'Sell an item', onPress: () => router.push('/sell-item') } : undefined}
            />
          ) : (
            <>
              <SectionHead title={university ? 'Just listed on your campus' : 'Just listed'} onSeeAll={() => openSearch()} />
              <FeaturedListing listing={featured} />

              {!!trending.data?.length && (
                <View className="mt-7">
                  <SectionHead title="Trending on campus" onSeeAll={() => openSearch()} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                    {trending.data.map((listing) => (
                      <ListingTile key={listing.id} listing={listing} width={124} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {rest.length > 0 && (
                <View className="mt-7">
                  <SectionHead title="More to loop" />
                  <ListingGrid listings={rest} columns={3} />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
