import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { BrandBackground } from '@/components/BrandBackground';
import { Button } from '@/components/Controls';
import { LoadingState } from '@/components/EmptyState';
import { ClockIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { deadline, formatPrice } from '@/lib/format';
import { useApi } from '@/lib/useApi';

function Ticket({ label, price, now = false }: { label: string; price: number; now?: boolean }) {
  return (
    <View
      className={`w-[118px] rounded-2xl border-2 border-ink px-3.5 py-3 ${now ? 'bg-[#FFD84D]' : 'bg-white'}`}
      style={{ transform: [{ rotate: now ? '4deg' : '-4deg' }] }}
    >
      <Text className="font-body-bold text-[12px] tracking-[1px] text-ink">{label}</Text>
      <Text className={`font-heading text-[30px] text-ink ${now ? '' : 'line-through'}`}>{formatPrice(price)}</Text>
    </View>
  );
}

/** 16 Price change: the seller changed the price on something you hold. */
export default function PriceChangeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<'accept' | 'cancel' | null>(null);
  const load = useCallback(() => api.reservations.get(id), [id]);
  const item = useApi(load).data;
  const change = item?.priceChange;

  const respond = async (accept: boolean) => {
    if (!item) return;
    setBusy(accept ? 'accept' : 'cancel');
    await api.reservations.respondToPriceChange(item.id, accept);
    router.back();
  };

  return (
    <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="light" />
      <BrandBackground />
      {!item ? (
        <LoadingState />
      ) : !change ? (
        <View className="rounded-[28px] bg-white p-6">
          <Text className="text-center font-heading text-[20px] text-ink">Nothing to answer</Text>
          <Text className="mt-2 text-center font-body text-[14px] text-muted">The price on this item hasn’t changed.</Text>
          <Button label="Back" className="mt-5" onPress={() => router.back()} />
        </View>
      ) : (
        <View className="items-center rounded-[28px] bg-white px-5 pb-5 pt-12" style={{ boxShadow: '0 16px 36px rgba(0,0,0,0.25)' }}>
          <View className="absolute -top-8">
            <Avatar person={item.seller} size={64} ring />
          </View>
          <Text accessibilityRole="header" className="text-center font-heading text-[22px] text-ink">
            {item.seller.fullName} changed the price
          </Text>
          <Text className="mt-2 text-center font-body text-[14px] leading-[20px] text-muted">
            Accept to keep your hold on the {item.listing.title}. If you cancel, it goes back on sale.
          </Text>

          <View className="my-6 flex-row items-center gap-3">
            <Ticket label="WAS" price={change.from} />
            <Ticket label="NOW" price={change.to} now />
          </View>

          <View className="flex-row items-center rounded-full bg-[#FFF4D1] px-3 py-1.5">
            <ClockIcon size={14} color="#8A5A00" />
            <Text className="ml-1.5 font-body-semibold text-[12.5px] text-[#8A5A00]">Respond by {deadline(change.respondBy)}</Text>
          </View>

          <Button
            label={`Accept ${formatPrice(change.to)} · keep hold`}
            variant="dark"
            className="mt-5 self-stretch"
            loading={busy === 'accept'}
            onPress={() => respond(true)}
          />
          <Text accessibilityRole="button" onPress={() => respond(false)} className="mt-4 py-1 font-body-bold text-[14.5px] text-danger">
            {busy === 'cancel' ? 'Cancelling…' : 'Cancel reservation'}
          </Text>
        </View>
      )}
    </View>
  );
}
