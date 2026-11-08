import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { Button, FieldError, IconButton } from '@/components/Controls';
import { LoadingState } from '@/components/EmptyState';
import { ChevronLeftIcon } from '@/components/Icons';
import { HoldRing, ListingArt } from '@/components/Listing';
import { PosterText } from '@/components/PosterText';
import { api, errorMessage } from '@/lib/api';
import { HOLD_HOURS } from '@/lib/api/types';
import { deadline, firstName, formatPrice } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';

function Step({ number, title, body }: { number: number; title: string; body: string }) {
  return (
    <View className="flex-row">
      <View className="h-6 w-6 items-center justify-center rounded-full bg-loop">
        <Text className="font-body-bold text-[12px] text-white">{number}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-body-bold text-[14.5px] text-ink">{title}</Text>
        <Text className="mt-0.5 font-body text-[13px] leading-[18px] text-muted">{body}</Text>
      </View>
    </View>
  );
}

/** 09 Reserve · confirm: holds an item for 72 hours. */
export default function ReserveRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => api.listings.get(id, user?.id ?? null), [id, user?.id]);
  const listing = useApi(load);
  const item = listing.data;

  // When the hold would end if confirmed now; fixed when the screen opens.
  const [releases] = useState(() => new Date(Date.now() + HOLD_HOURS * 3_600_000).toISOString());

  if (!user) return null;
  const seller = item ? firstName(item.seller.fullName) : 'the seller';

  const confirm = async () => {
    if (!item) return;
    setBusy(true);
    setError(null);
    try {
      await api.reservations.create(item.id, user.id);
      router.dismissAll();
      router.navigate({ pathname: '/activity', params: { tab: 'reserved', toast: item.seller.fullName } });
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BrandBackground />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}>
        <IconButton label="Go back" onPress={() => router.back()}>
          <ChevronLeftIcon size={20} />
        </IconButton>

        {!item ? (
          <LoadingState />
        ) : (
          <View className="mt-6 rounded-[28px] bg-white p-5" style={{ boxShadow: '0 16px 36px rgba(0,0,0,0.25)' }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <PosterText lines={['HOLD IT!']} size={30} wobble tilt={-3} />
                <Text className="mt-3 font-body text-[14px] leading-[20px] text-muted">
                  Nobody else can reserve it while you hold it.
                </Text>
              </View>
              <HoldRing hours={HOLD_HOURS} size={76} caption="hold time" />
            </View>

            <View className="mt-5 flex-row items-center rounded-2xl bg-tint p-3">
              <View className="w-12">
                <ListingArt listing={item} height={48} rounded="rounded-xl" />
              </View>
              <View className="mx-3 flex-1">
                <Text numberOfLines={1} className="font-body-bold text-[14.5px] text-ink">
                  {item.title}
                </Text>
                <Text className="font-body text-[12.5px] text-muted">
                  {item.seller.fullName} · {item.seller.major || 'Student'}
                </Text>
              </View>
              <Text className="font-heading text-[18px] text-ink">{formatPrice(item.price)}</Text>
            </View>

            <View className="mt-5 gap-4">
              <Step number={1} title="Reserve" body={`The hold starts now and ends ${deadline(releases)}.`} />
              <Step number={2} title="Meet up" body={`Message ${seller} and pick a spot on campus.`} />
              <Step number={3} title="Pay in person" body={`Check the item, pay, and ${seller} marks it sold.`} />
            </View>

            <FieldError message={error ?? undefined} />
            <Button label={`Reserve for ${HOLD_HOURS} hours`} className="mt-6" onPress={confirm} loading={busy} />
            <Text accessibilityRole="button" onPress={() => router.back()} className="mt-4 py-1 text-center font-body-bold text-[14.5px] text-loop">
              Not now
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
