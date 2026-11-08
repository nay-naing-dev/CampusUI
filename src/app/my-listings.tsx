import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Segmented } from '@/components/Controls';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { ChevronRightIcon, EditIcon, PlusIcon } from '@/components/Icons';
import { HoldRing, ListingArt, StatusPill } from '@/components/Listing';
import { ScreenHeader } from '@/components/ScreenHeader';
import { api } from '@/lib/api';
import type { ListingStatus, ListingWithSeller, ReservationDetail } from '@/lib/api/types';
import { firstName, formatPrice, hoursLeft, timeAgo } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';

type Filter = 'all' | ListingStatus;

function Row({ listing, reservation }: { listing: ListingWithSeller; reservation?: ReservationDetail }) {
  const open = () =>
    reservation
      ? router.push({ pathname: '/manage/[id]', params: { id: reservation.id } })
      : router.push({ pathname: '/listing/[id]', params: { id: listing.id } });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)}, ${listing.status}`}
      onPress={open}
      className={`flex-row items-center rounded-2xl bg-white p-3 active:opacity-85 ${listing.status === 'sold' ? 'opacity-75' : ''}`}
      style={{ boxShadow: '0 6px 18px rgba(36,20,65,0.06)' }}
    >
      <View className="w-16">
        <ListingArt listing={listing} height={64} rounded="rounded-xl" />
      </View>
      <View className="mx-3 flex-1">
        <Text numberOfLines={1} className="font-body-bold text-[15px] text-ink">
          {listing.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <StatusPill status={listing.status} />
          <Text className="font-heading text-[16px] text-ink">{formatPrice(listing.price)}</Text>
        </View>
        <Text numberOfLines={1} className="mt-1 font-body text-[12px] text-muted">
          {reservation
            ? `Held by ${firstName(reservation.buyer.fullName)}${reservation.sellerConfirmedAt ? ' · waiting for them to confirm' : ''}`
            : listing.status === 'sold'
              ? `Sold · listed ${timeAgo(listing.createdAt)} ago`
              : `${listing.views} views · ${listing.condition} · ${timeAgo(listing.createdAt)} ago`}
        </Text>
      </View>
      {reservation ? (
        <HoldRing hours={hoursLeft(reservation.expiresAt)} size={44} />
      ) : listing.status === 'sold' ? (
        <ChevronRightIcon size={18} color={colors.muted} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${listing.title}`}
          onPress={() => router.push({ pathname: '/sell-item', params: { id: listing.id } })}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-tint active:opacity-70"
        >
          <EditIcon size={16} color={colors.ink} />
        </Pressable>
      )}
    </Pressable>
  );
}

/** Everything the student has listed, with filters by status. Opened from Profile and Settings. */
export default function MyListingsRoute() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => (user ? api.listings.selling(user.id) : null), [user]);
  const selling = useApi(load);

  if (!user) return null;

  const data = selling.data;
  const all = data ? [...data.active, ...data.sold] : [];
  const count = (status: ListingStatus) => all.filter((listing) => listing.status === status).length;
  const shown = filter === 'all' ? all : all.filter((listing) => listing.status === filter);

  const sellNew = () => router.push('/sell-item');

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader
        back
        title="My listings"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sell an item"
            onPress={sellNew}
            className="h-10 flex-row items-center rounded-full bg-white px-3.5 active:opacity-80"
          >
            <PlusIcon size={16} color={colors.ink} strokeWidth={2.6} />
            <Text className="ml-1 font-body-bold text-[13.5px] text-ink">Sell</Text>
          </Pressable>
        }
      >
        {data && (
          <View className="mt-4 flex-row gap-2.5">
            {[
              { label: 'listed', value: String(all.length) },
              { label: 'sold', value: String(data.stats.sold) },
              { label: 'earned', value: `$${data.stats.earned}` },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 rounded-2xl bg-white/15 px-3 py-2.5">
                <Text className="font-heading text-[20px] text-white">{stat.value}</Text>
                <Text className="font-body text-[12px] text-white/75">{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </ScreenHeader>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 32 }}>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All ${all.length}` },
            { value: 'available', label: `Live ${count('available')}` },
            { value: 'reserved', label: `On hold ${count('reserved')}` },
            { value: 'sold', label: `Sold ${count('sold')}` },
          ]}
        />

        {selling.error && !data ? (
          <ErrorState message={selling.error} onRetry={selling.reload} />
        ) : !data ? (
          <LoadingState />
        ) : shown.length === 0 ? (
          <EmptyState
            emoji="🏷️"
            title={filter === 'all' ? 'Nothing listed yet' : 'Nothing here'}
            body={filter === 'all' ? 'Turn last semester’s stuff into cash.' : 'Try another filter.'}
            action={filter === 'all' ? { label: 'Sell an item', onPress: sellNew } : undefined}
          />
        ) : (
          shown.map((listing) => <Row key={listing.id} listing={listing} reservation={data.reservations[listing.id]} />)
        )}

        {data && all.length > 0 && <Button label="Sell another item" variant="outline" className="mt-2" onPress={sellNew} />}
      </ScrollView>
    </View>
  );
}
