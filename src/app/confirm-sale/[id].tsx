import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeMedal } from '@/components/BadgeMedal';
import { BrandBackground } from '@/components/BrandBackground';
import { Button, FieldError } from '@/components/Controls';
import { LoadingState } from '@/components/EmptyState';
import { CheckIcon, ClockIcon, SparkleIcon } from '@/components/Icons';
import { Hourglass, lookFor, StudentFigure } from '@/components/Illustrations';
import { ListingArt } from '@/components/Listing';
import { PosterText } from '@/components/PosterText';
import { api, errorMessage } from '@/lib/api';
import type { Badge } from '@/lib/api/types';
import { firstName, formatPrice } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { findUniversity } from '@/theme/universities';

type Stage = 'ask' | 'waiting' | 'done';

function Check({ label, done }: { label: string; done: boolean }) {
  return (
    <View className="flex-row items-center">
      <View className={`h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-mint' : 'bg-[#FDF0D5]'}`}>
        {done ? <CheckIcon size={12} color={colors.ink} /> : <ClockIcon size={13} color="#B7791F" />}
      </View>
      <Text className="ml-2.5 flex-1 font-body-semibold text-[14px] text-ink">{label}</Text>
    </View>
  );
}

/**
 * Confirm a sale. Seller and buyer each confirm on their own phone; only when
 * both have, the item is sold and it counts towards stats and badges.
 * Replaces the earlier one-sided "Mark as sold".
 */
export default function ConfirmSaleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useSession();
  const { theme } = useTheme();
  const [busy, setBusy] = useState<'confirm' | 'decline' | 'simulate' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ stage: Stage; badges: Badge[] } | null>(null);

  const load = useCallback(() => api.reservations.get(id), [id]);
  const reservation = useApi(load);
  const item = reservation.data;

  if (!user) return null;

  const isSeller = item?.sellerId === user.id;
  const other = item ? (isSeller ? item.buyer : item.seller) : null;
  const otherName = other ? firstName(other.fullName) : '';
  const mine = item ? (isSeller ? item.sellerConfirmedAt : item.buyerConfirmedAt) : null;
  const theirs = item ? (isSeller ? item.buyerConfirmedAt : item.sellerConfirmedAt) : null;
  const stage: Stage = result?.stage ?? (item?.status === 'completed' ? 'done' : mine ? 'waiting' : 'ask');

  const refreshUser = async () => {
    const fresh = await api.reservations.get(id);
    reservation.setData(fresh);
    setUser(isSeller ? fresh.seller : fresh.buyer);
  };

  const confirm = async () => {
    setBusy('confirm');
    setError(null);
    try {
      const outcome = await api.reservations.confirmSale(id, user.id);
      await refreshUser();
      setResult({ stage: outcome.completed ? 'done' : 'waiting', badges: outcome.newBadges });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  const simulateOther = async () => {
    setBusy('simulate');
    const outcome = await api.reservations.simulateOtherConfirmation(id, user.id);
    await refreshUser();
    setResult({ stage: outcome.completed ? 'done' : 'waiting', badges: outcome.newBadges });
    setBusy(null);
  };

  const decline = async () => {
    setBusy('decline');
    await api.reservations.declineSale(id, user.id);
    router.back();
  };

  const finish = () => {
    router.dismissAll();
    router.navigate({ pathname: '/activity', params: { tab: isSeller ? 'selling' : 'reserved', toast: `sold:${other?.fullName ?? ''}` } });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BrandBackground />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>
        {!item || !other ? (
          <LoadingState />
        ) : (
          <View className="overflow-hidden rounded-[28px] bg-white" style={{ boxShadow: '0 16px 36px rgba(0,0,0,0.25)' }}>
            <View className="items-center bg-[#FFF4D1] pt-5">
              {stage === 'waiting' ? (
                <View className="pb-3">
                  <Hourglass width={70} />
                </View>
              ) : (
                <>
                  <PosterText lines={[stage === 'done' ? 'SOLD!' : isSeller ? 'SOLD?' : 'GOT IT?']} size={32} wobble tilt={-4} />
                  <View className="absolute right-6 top-6">
                    <SparkleIcon size={22} color={theme.highlight} />
                  </View>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="mt-1 flex-row items-end">
                    <StudentFigure width={84} skirt={findUniversity(item.buyer.universityId)?.theme.uniform} {...lookFor(item.buyer)} rightArm="wave" />
                    <StudentFigure width={84} skirt={findUniversity(item.seller.universityId)?.theme.uniform} {...lookFor(item.seller)} leftArm="wave" />
                  </View>
                </>
              )}
            </View>

            <View className="p-5">
              {stage === 'ask' && (
                <>
                  <Text accessibilityRole="header" className="text-center font-heading text-[22px] leading-[28px] text-ink">
                    {isSeller ? `Mark as sold to ${other.fullName}?` : `Got the ${item.listing.title.toLowerCase()} from ${otherName}?`}
                  </Text>
                  <Text className="mt-2 text-center font-body text-[14px] leading-[20px] text-muted">
                    {theirs
                      ? `${otherName} already confirmed. Your confirmation makes the sale official.`
                      : `${otherName} confirms too, then the sale counts for both of you. The hold pauses while you wait.`}
                  </Text>
                </>
              )}
              {stage === 'waiting' && (
                <>
                  <Text accessibilityRole="header" className="text-center font-heading text-[22px] text-ink">
                    Waiting for {otherName}
                  </Text>
                  <Text className="mt-2 text-center font-body text-[14px] leading-[20px] text-muted">
                    You confirmed. We’ve asked {otherName} to confirm too. It counts once you both have.
                  </Text>
                </>
              )}
              {stage === 'done' && (
                <>
                  <Text accessibilityRole="header" className="text-center font-heading text-[22px] text-ink">
                    It’s official!
                  </Text>
                  <Text className="mt-2 text-center font-body text-[14px] leading-[20px] text-muted">
                    You and {otherName} both confirmed. It now counts on your profile.
                  </Text>
                </>
              )}

              <View className="mt-4 flex-row items-center rounded-2xl bg-tint p-3">
                <View className="w-11">
                  <ListingArt listing={item.listing} height={44} rounded="rounded-xl" />
                </View>
                <Text numberOfLines={1} className="mx-3 flex-1 font-body-bold text-[14px] text-ink">
                  {item.listing.title}
                </Text>
                <Text className="font-heading text-[18px] text-ink">{formatPrice(item.listing.price)}</Text>
              </View>

              <View className="mt-4 gap-2.5">
                <Check label={`Seller: ${isSeller ? 'you' : item.seller.fullName}`} done={!!item.sellerConfirmedAt} />
                <Check label={`Buyer: ${isSeller ? item.buyer.fullName : 'you'}`} done={!!item.buyerConfirmedAt} />
              </View>

              {stage === 'done' && !!result?.badges.length && (
                <View className="mt-5 rounded-2xl bg-soft p-4">
                  <Text className="text-center font-body-bold text-[12px] tracking-[1.4px] text-ink">BADGE UNLOCKED</Text>
                  <View className="mt-3 flex-row flex-wrap justify-center gap-4">
                    {result.badges.map((badge) => (
                      <View key={badge.id} className="w-24 items-center">
                        <BadgeMedal badge={badge} size={64} />
                        <Text className="mt-1.5 text-center font-body-bold text-[13px] text-ink">{badge.title}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <FieldError message={error ?? undefined} />

              {stage === 'ask' && (
                <>
                  <View className="mt-5 flex-row gap-3">
                    <Button label="Not yet" variant="light" className="flex-1" onPress={() => router.back()} />
                    <Button label={isSeller ? 'I sold it' : 'I got it'} className="flex-1" onPress={confirm} loading={busy === 'confirm'} />
                  </View>
                  {theirs && (
                    <Text accessibilityRole="button" onPress={decline} className="mt-4 py-1 text-center font-body-bold text-[14px] text-danger">
                      {busy === 'decline' ? 'Sending…' : isSeller ? 'I haven’t been paid' : 'I haven’t received it'}
                    </Text>
                  )}
                </>
              )}
              {stage === 'waiting' && (
                <>
                  <Button label="Done" className="mt-5" onPress={() => router.back()} />
                  <Button
                    label={`Confirm as ${otherName} (testing)`}
                    variant="outline"
                    size="small"
                    className="mt-3"
                    loading={busy === 'simulate'}
                    onPress={simulateOther}
                  />
                </>
              )}
              {stage === 'done' && <Button label="Done" className="mt-5" onPress={finish} />}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
