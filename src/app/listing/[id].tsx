import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconButton } from '@/components/Controls';
import { ErrorState, LoadingState } from '@/components/EmptyState';
import { ChevronLeftIcon, FlagIcon, HeartIcon, PinIcon, ShareIcon, WalletIcon } from '@/components/Icons';
import { ListingArt, SellerRow, StatusPill, Tag } from '@/components/Listing';
import { api, errorMessage } from '@/lib/api';
import { categoryMeta } from '@/lib/categories';
import { firstName, formatPrice, hoursLeft, timeAgo } from '@/lib/format';
import { notBuiltYet } from '@/lib/placeholder';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { findUniversity } from '@/theme/universities';

const ART_HEIGHT = 300;

export default function ListingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const load = useCallback(() => api.listings.get(id, user?.id ?? null), [id, user?.id]);
  const listing = useApi(load);
  const item = listing.data;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/market'));

  if (!item) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 12 }}>
        <View className="px-5">
          <IconButton label="Go back" tone="light" onPress={goBack}>
            <ChevronLeftIcon size={20} color={colors.ink} />
          </IconButton>
        </View>
        {listing.error ? <ErrorState message={listing.error} onRetry={listing.reload} /> : <LoadingState />}
      </View>
    );
  }

  const mine = user?.id === item.sellerId;
  const myHold = item.reservation && item.reservation.buyerId === user?.id ? item.reservation : null;
  const heldByOther = item.status === 'reserved' && !myHold && !mine;
  const campus = findUniversity(item.universityId);
  const meta = categoryMeta(item.category);
  const photos = item.photos.length ? item.photos : [undefined];
  const seller = firstName(item.seller.fullName);

  const toggleSave = async () => {
    if (!user) return router.push({ pathname: '/sign-in-gate', params: { listingId: item.id, intent: 'save' } });
    listing.setData({ ...item, saved: !item.saved });
    await api.listings.setSaved(item.id, user.id, !item.saved);
  };

  const contact = async () => {
    if (!user) return router.push({ pathname: '/sign-in-gate', params: { listingId: item.id, intent: 'message' } });
    setBusy(true);
    try {
      const conversationId = await api.chats.open(item.id, user.id);
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
    } catch (error) {
      notBuiltYet('Could not open chat', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const reserve = () => {
    if (!user) return router.push({ pathname: '/sign-in-gate', params: { listingId: item.id, intent: 'reserve' } });
    router.push({ pathname: '/reserve/[id]', params: { id: item.id } });
  };

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={{ paddingTop: insets.top }} className="bg-tint">
          <ListingArt listing={item} height={ART_HEIGHT} rounded="rounded-none" photo={photos[photoIndex]} />
          <View className="absolute left-5 right-5 flex-row justify-between" style={{ top: insets.top + 8 }}>
            <IconButton label="Go back" tone="light" onPress={goBack}>
              <ChevronLeftIcon size={20} color={colors.ink} />
            </IconButton>
            <IconButton label="Share" tone="light" onPress={() => Share.share({ message: `${item.title} for ${formatPrice(item.price)} on CampusLoop` })}>
              <ShareIcon size={19} color={colors.ink} />
            </IconButton>
          </View>
          <View className="absolute bottom-10 self-center rounded-full bg-ink/60 px-2.5 py-0.5">
            <Text className="font-body-semibold text-[12px] text-white">
              {photoIndex + 1}/{photos.length}
            </Text>
          </View>
        </View>

        <View className="-mt-6 rounded-t-[28px] bg-canvas px-5 pt-5">
          {photos.length > 1 && (
            <View className="mb-4 flex-row gap-2">
              {photos.map((uri, index) => (
                <Pressable
                  key={uri ?? index}
                  accessibilityRole="button"
                  accessibilityLabel={`Photo ${index + 1}`}
                  onPress={() => setPhotoIndex(index)}
                  className={`w-14 overflow-hidden rounded-xl border-2 ${index === photoIndex ? 'border-loop' : 'border-transparent'}`}
                >
                  <ListingArt listing={item} height={52} rounded="rounded-lg" photo={uri} />
                </Pressable>
              ))}
            </View>
          )}

          <View className="flex-row items-start">
            <Text accessibilityRole="header" className="mr-3 flex-1 font-heading text-[22px] leading-[28px] text-ink">
              {item.title}
            </Text>
            <Text className="font-heading text-[26px] text-loop">{formatPrice(item.price)}</Text>
          </View>

          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            <StatusPill status={item.status} />
            <Tag label={meta.label} />
            <Tag label={item.condition} />
            <Text className="ml-1 font-body text-[12.5px] text-muted">{timeAgo(item.createdAt) === 'now' ? 'just now' : `${timeAgo(item.createdAt)} ago`}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`See ${item.seller.fullName}’s profile`}
            disabled={mine}
            onPress={() => router.push({ pathname: '/user/[id]', params: { id: item.sellerId } })}
            className="mt-5 rounded-2xl bg-white p-3.5 active:opacity-80"
          >
            <SellerRow seller={item.seller} universityId={item.universityId} />
          </Pressable>

          {item.description ? (
            <>
              <Text className="mt-5 font-body-bold text-[15px] text-ink">Description</Text>
              <Text className="mt-1.5 font-body text-[14.5px] leading-[22px] text-muted">{item.description}</Text>
            </>
          ) : null}

          <View className="mt-4 flex-row items-center rounded-2xl bg-white p-3.5">
            <PinIcon size={18} color={theme.accent} />
            <Text className="ml-2.5 flex-1 font-body text-[14px] text-ink">
              Meet at <Text className="font-body-semibold">{item.meetup}</Text>
              {campus ? ` · ${campus.short}` : ''}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center rounded-2xl bg-[#FFF4D1] p-3.5">
            <WalletIcon size={18} color="#8A5A00" />
            <Text className="ml-2.5 flex-1 font-body text-[13.5px] leading-[19px] text-ink">
              Pay {mine ? 'yourself' : seller} when you meet. CampusLoop takes no fees.
            </Text>
          </View>

          {!mine && user && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/report', params: { listingId: item.id } })}
              className="mt-5 flex-row items-center self-center py-2"
            >
              <FlagIcon size={15} color={colors.muted} />
              <Text className="ml-1.5 font-body-semibold text-[13px] text-muted">Report this listing</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {myHold && (
          <Text className="mb-2 text-center font-body-semibold text-[13px] text-loop">
            You’re holding this · {hoursLeft(myHold.expiresAt)}h left
          </Text>
        )}
        {heldByOther && (
          <Text className="mb-2 text-center font-body text-[13px] text-muted">
            Someone is holding this. It frees up if they don’t meet within 72 hours.
          </Text>
        )}
        <View className="flex-row gap-3">
          {mine ? (
            <Button
              label={item.reservation ? 'Manage reservation' : item.status === 'sold' ? 'Sold' : 'Edit listing'}
              disabled={item.status === 'sold'}
              className="flex-1"
              onPress={() =>
                item.reservation
                  ? router.push({ pathname: '/manage/[id]', params: { id: item.reservation.id } })
                  : router.push({ pathname: '/sell-item', params: { id: item.id } })
              }
            />
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.saved ? 'Remove from saved' : 'Save'}
                onPress={toggleSave}
                className="h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-line active:opacity-70"
              >
                <HeartIcon size={22} color={item.saved ? theme.accent : colors.ink} strokeWidth={item.saved ? 2.6 : 2} />
              </Pressable>
              <Button label="Contact" variant="dark" className="flex-1" onPress={contact} loading={busy} />
              <Button
                label={myHold ? 'Holding' : heldByOther ? 'On hold' : 'Reserve'}
                className="flex-1"
                onPress={reserve}
                disabled={!!myHold || heldByOther || item.status === 'sold'}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
