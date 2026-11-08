import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button, Segmented } from '@/components/Controls';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { CheckIcon, ChevronRightIcon, ClockIcon } from '@/components/Icons';
import { HoldRing, ListingArt, SellerRow, StatusPill } from '@/components/Listing';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { api } from '@/lib/api';
import { HOLD_HOURS, type ListingWithSeller, type ReservationDetail } from '@/lib/api/types';
import { firstName, formatPrice, hoursLeft } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';

type Tab = 'reserved' | 'selling';

const cardShadow = { boxShadow: '0 8px 22px rgba(36,20,65,0.07)' };

async function openChat(listingId: string, userId: string, buyerId?: string) {
  const conversationId = await api.chats.open(listingId, userId, buyerId);
  router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
}

function PriceChangeBanner({ reservation }: { reservation: ReservationDetail }) {
  const change = reservation.priceChange!;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Price changed on ${reservation.listing.title}. Respond within ${hoursLeft(change.respondBy)} hours.`}
      onPress={() => router.push({ pathname: '/price-change/[id]', params: { id: reservation.id } })}
      className="flex-row items-center rounded-2xl border border-[#F5D27A] bg-[#FFF4D1] p-3 active:opacity-80"
    >
      <View className="w-11">
        <ListingArt listing={reservation.listing} height={44} rounded="rounded-xl" />
      </View>
      <View className="mx-3 flex-1">
        <Text className="font-body-bold text-[12px] text-[#8A5A00]">Price changed · respond in {hoursLeft(change.respondBy)}h</Text>
        <Text numberOfLines={1} className="font-body-bold text-[14.5px] text-ink">
          {reservation.listing.title}
        </Text>
        <Text className="font-body text-[13px] text-muted">
          <Text className="line-through">{formatPrice(change.from)}</Text> → <Text className="font-body-bold text-ink">{formatPrice(change.to)}</Text>
        </Text>
      </View>
      <ChevronRightIcon size={18} color={colors.muted} />
    </Pressable>
  );
}

function ReservedCard({ reservation, userId, onChanged }: { reservation: ReservationDetail; userId: string; onChanged: () => void }) {
  const left = hoursLeft(reservation.expiresAt);
  const [cancelling, setCancelling] = useState(false);
  const seller = firstName(reservation.seller.fullName);
  const paused = !!(reservation.sellerConfirmedAt || reservation.buyerConfirmedAt);
  const openConfirm = () => router.push({ pathname: '/confirm-sale/[id]', params: { id: reservation.id } });

  return (
    <View className="rounded-3xl bg-white p-3" style={cardShadow}>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/listing/[id]', params: { id: reservation.listing.id } })}>
        <ListingArt listing={reservation.listing} height={130} rounded="rounded-[18px]" />
        <View className="absolute left-2.5 top-2.5 flex-row items-center rounded-full bg-white px-2.5 py-1">
          <ClockIcon size={13} color={colors.danger} />
          <Text className="ml-1 font-body-bold text-[11.5px] text-ink">{paused ? 'Hold paused · confirming' : `On hold · ${left}h left`}</Text>
        </View>
      </Pressable>
      <View className="mt-3 flex-row items-center px-1">
        <Text numberOfLines={1} className="flex-1 font-body-bold text-[15px] text-ink">
          {reservation.listing.title}
        </Text>
        <Text className="font-heading text-[18px] text-ink">{formatPrice(reservation.listing.price)}</Text>
      </View>
      <View className="mx-1 mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <View className="h-full rounded-full bg-loop" style={{ width: `${(left / HOLD_HOURS) * 100}%` }} />
      </View>
      <Text className="mx-1 mt-1 font-body text-[12px] text-muted">Hold ends in {left} hours · {reservation.listing.meetup}</Text>

      <View className="mt-3 flex-row items-center rounded-2xl bg-tint p-2.5">
        <View className="flex-1">
          <SellerRow seller={reservation.seller} universityId={reservation.listing.universityId} compact />
        </View>
        <Button label="Message" size="small" variant="dark" className="ml-2" onPress={() => openChat(reservation.listing.id, userId)} />
      </View>
      {reservation.sellerConfirmedAt && !reservation.buyerConfirmedAt ? (
        <View className="mt-3 rounded-2xl border border-[#F5D27A] bg-[#FFF4D1] p-3">
          <Text className="font-body-bold text-[14px] text-ink">{seller} marked this as sold</Text>
          <Text className="mt-0.5 font-body text-[12.5px] leading-[18px] text-muted">
            Did you get it and pay? Confirm so the sale counts for you both.
          </Text>
          <Button label="Yes, I got it" size="small" className="mt-2.5" onPress={openConfirm} />
        </View>
      ) : reservation.buyerConfirmedAt ? (
        <View className="mt-3 flex-row items-center rounded-2xl bg-mint-wash p-3">
          <CheckIcon size={15} color={colors.mint.deep} />
          <Text className="ml-2 flex-1 font-body-semibold text-[13px] text-mint-deep">You confirmed · waiting for {seller} to confirm</Text>
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={openConfirm} className="mt-3 flex-row items-center justify-center rounded-2xl border-[1.5px] border-line py-2.5 active:opacity-70">
          <CheckIcon size={14} color={colors.ink} />
          <Text className="ml-1.5 font-body-bold text-[13.5px] text-ink">Got it already? Confirm the sale</Text>
        </Pressable>
      )}
      <Text className="mt-3 px-1 font-body text-[12.5px] text-muted">
        Pay in person when you meet. Changed your mind?{' '}
        <Text
          accessibilityRole="button"
          onPress={async () => {
            setCancelling(true);
            await api.reservations.cancel(reservation.id);
            onChanged();
          }}
          className="font-body-bold text-danger"
        >
          {cancelling ? 'Cancelling…' : 'Cancel hold'}
        </Text>
      </Text>
    </View>
  );
}

function SellingCard({ listing, reservation }: { listing: ListingWithSeller; reservation?: ReservationDetail }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        reservation
          ? router.push({ pathname: '/manage/[id]', params: { id: reservation.id } })
          : router.push({ pathname: '/listing/[id]', params: { id: listing.id } })
      }
      className="rounded-2xl bg-white p-3 active:opacity-90"
      style={cardShadow}
    >
      <View className="flex-row items-center">
        <View className="w-14">
          <ListingArt listing={listing} height={56} rounded="rounded-xl" />
        </View>
        <View className="mx-3 flex-1">
          <Text numberOfLines={1} className="font-body-bold text-[14.5px] text-ink">
            {listing.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <StatusPill status={listing.status} />
            <Text className="font-heading text-[16px] text-ink">{formatPrice(listing.price)}</Text>
          </View>
          {!reservation && <Text className="mt-1 font-body text-[12px] text-muted">{listing.views} views · {listing.condition}</Text>}
        </View>
        {reservation ? <HoldRing hours={hoursLeft(reservation.expiresAt)} size={48} /> : <ChevronRightIcon size={18} color={colors.muted} />}
      </View>
      {reservation && (
        <View className="mt-3 flex-row items-center border-t border-line pt-3">
          <Avatar person={reservation.buyer} size={30} />
          <View className="ml-2 flex-1">
            <Text className="font-body-bold text-[13.5px] text-ink">
              {reservation.buyer.fullName} · {reservation.buyer.major || 'Student'}
            </Text>
            <Text className="font-body text-[12px] text-muted">
              {reservation.sellerConfirmedAt
                ? 'You confirmed · waiting for them'
                : reservation.buyerConfirmedAt
                  ? 'They confirmed pickup · confirm the sale'
                  : 'Reserved · meets to pay in person'}
            </Text>
          </View>
          <View className="rounded-full bg-loop px-3.5 py-1.5">
            <Text className="font-body-bold text-[12.5px] text-white">Manage</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function ActivityRoute() {
  const params = useLocalSearchParams<{ tab?: Tab; toast?: string }>();
  const { user } = useSession();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'reserved');
  const [toast, setToast] = useState<string | null>(params.toast ?? null);

  // Arriving from Reserve or Mark sold switches tab and shows a confirmation.
  const [seen, setSeen] = useState(params);
  if (params.tab !== seen.tab || params.toast !== seen.toast) {
    setSeen(params);
    if (params.tab) setTab(params.tab);
    if (params.toast) setToast(params.toast);
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadReserved = useCallback(
    async () => (user ? api.reservations.forBuyer(user.id) : []),
    [user],
  );
  const reserved = useApi(loadReserved);
  const loadSelling = useCallback(
    async () => (user ? api.listings.selling(user.id) : null),
    [user],
  );
  const selling = useApi(loadSelling);

  if (!user) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader title="Activity" />
        <EmptyState
          emoji="📦"
          title="Reserve and sell"
          body="Your holds and the things you sell live here. Sign up with your Gmail to start."
          action={{ label: 'Create a student account', onPress: () => router.push('/signup') }}
        />
      </View>
    );
  }

  const stats = selling.data?.stats;
  const priceChanges = reserved.data?.filter((item) => item.priceChange) ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Activity">
        <View className="mt-4">
          <Segmented
            tone="onBrand"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'reserved', label: `Reserved · ${reserved.data?.length ?? '–'}` },
              { value: 'selling', label: `Selling · ${stats?.active ?? '–'}` },
            ]}
          />
        </View>
        {tab === 'selling' && stats && (
          <View className="mt-4 flex-row gap-2.5">
            {[
              { label: 'active', value: String(stats.active) },
              { label: 'sold', value: String(stats.sold) },
              { label: 'earned', value: `$${stats.earned}` },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 rounded-2xl bg-white/15 px-3 py-2.5">
                <Text className="font-heading text-[20px] text-white">{stat.value}</Text>
                <Text className="font-body text-[12px] text-white/75">{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </ScreenHeader>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: TAB_BAR_SPACE + 40 }}>
        {tab === 'reserved' ? (
          reserved.error && !reserved.data ? (
            <ErrorState message={reserved.error} onRetry={reserved.reload} />
          ) : !reserved.data ? (
            <LoadingState />
          ) : reserved.data.length === 0 ? (
            <EmptyState emoji="🤚" title="Nothing on hold" body="Reserve an item to hold it for 72 hours while you arrange to meet." action={{ label: 'Browse the market', onPress: () => router.navigate('/market') }} />
          ) : (
            <>
              {priceChanges.map((item) => (
                <PriceChangeBanner key={`change-${item.id}`} reservation={item} />
              ))}
              {reserved.data.map((item) => (
                <ReservedCard key={item.id} reservation={item} userId={user.id} onChanged={reserved.reload} />
              ))}
            </>
          )
        ) : selling.error && !selling.data ? (
          <ErrorState message={selling.error} onRetry={selling.reload} />
        ) : !selling.data ? (
          <LoadingState />
        ) : (
          <>
            {selling.data.active.length === 0 && (
              <EmptyState emoji="🏷️" title="Nothing for sale" body="Turn last semester’s stuff into cash." action={{ label: 'Sell an item', onPress: () => router.push('/sell-item') }} />
            )}
            {selling.data.active.map((listing) => (
              <SellingCard key={listing.id} listing={listing} reservation={selling.data!.reservations[listing.id]} />
            ))}
            {selling.data.sold.length > 0 && (
              <>
                <Text className="mt-3 font-body-bold text-[13px] tracking-[1.2px] text-muted">SOLD · {selling.data.sold.length}</Text>
                {selling.data.sold.map((listing) => (
                  <View key={listing.id} className="flex-row items-center rounded-2xl bg-white/70 p-3">
                    <View className="w-11 opacity-70">
                      <ListingArt listing={listing} height={44} rounded="rounded-xl" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-body-semibold text-[14px] text-ink">{listing.title}</Text>
                      <Text className="font-body text-[12px] text-muted">Sold for {formatPrice(listing.price)}</Text>
                    </View>
                    <CheckIcon size={16} color={colors.mint.deep} />
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {toast && (
        <View pointerEvents="none" className="absolute left-5 right-5 items-center" style={{ bottom: TAB_BAR_SPACE + 4 }}>
          <View accessibilityLiveRegion="polite" className="flex-row items-center rounded-full bg-ink px-4 py-2.5">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-mint">
              <CheckIcon size={11} color={colors.ink} />
            </View>
            <Text className="ml-2 font-body-semibold text-[13.5px] text-white">
              {toast.startsWith('sold:') ? `Sale confirmed with ${toast.slice(5)} · it counts!` : `Reserved! Message ${firstName(toast)} to plan a meetup.`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
