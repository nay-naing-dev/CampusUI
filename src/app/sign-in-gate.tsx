import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { Button, IconButton } from '@/components/Controls';
import { CloseIcon } from '@/components/Icons';
import { PlainStickman } from '@/components/Illustrations';
import { ListingArt } from '@/components/Listing';
import { PosterText } from '@/components/PosterText';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useApi } from '@/lib/useApi';

const VERBS = { reserve: 'reserve', message: 'message the seller about', save: 'save' } as const;

/** 10 Sign-in gate: guests hit this when they try to reserve, message or save. */
export default function SignInGateRoute() {
  const { listingId, intent = 'reserve' } = useLocalSearchParams<{ listingId?: string; intent?: keyof typeof VERBS }>();
  const insets = useSafeAreaInsets();
  const load = useCallback(async () => (listingId ? api.listings.get(listingId, null) : null), [listingId]);
  const listing = useApi(load).data;
  const verb = VERBS[intent] ?? VERBS.reserve;
  const next = listingId ? `/listing/${listingId}` : '/market';
  const thing = listing ? listing.title.split(',')[0].toLowerCase() : 'this';

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BrandBackground />
      <View className="flex-1 px-5" style={{ paddingTop: insets.top + 10 }}>
        <IconButton label="Close" onPress={() => router.back()}>
          <CloseIcon size={18} />
        </IconButton>
        <View className="mt-4 items-center">
          <PosterText lines={['PSST...']} size={40} wobble tilt={-3} />
        </View>
        <View className="mt-4 flex-1 flex-row items-start justify-center">
          <PlainStickman height={240} />
          <View className="-ml-2 mt-6 max-w-[170px] rounded-2xl bg-white p-3.5" style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
            <Text className="font-body-bold text-[14px] leading-[19px] text-ink">
              Sign in first to {verb} {listing ? `this ${thing}` : 'this'}!
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-t-[28px] bg-white px-5 pt-5" style={{ paddingBottom: insets.bottom + 18 }}>
        {listing && (
          <View className="mb-4 flex-row items-center rounded-2xl bg-tint p-3">
            <View className="w-11">
              <ListingArt listing={listing} height={44} rounded="rounded-xl" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-body text-[12px] text-muted">You’re trying to {verb}</Text>
              <Text numberOfLines={1} className="font-body-bold text-[14.5px] text-ink">
                {listing.title} · {formatPrice(listing.price)}
              </Text>
            </View>
          </View>
        )}
        <Button label="Log in" onPress={() => router.replace({ pathname: '/login', params: { next } })} />
        <Button label="Create a student account" variant="light" className="mt-3" onPress={() => router.replace('/signup')} />
        <Text className="mt-4 text-center font-body text-[12.5px] leading-[18px] text-muted">
          Reserving is for verified students. You only see and meet people from your own campus.
        </Text>
      </View>
    </View>
  );
}
