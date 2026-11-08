import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Controls';
import { ErrorState, LoadingState } from '@/components/EmptyState';
import { ChatIcon, CloseIcon, EditIcon, FlagIcon, TrashIcon } from '@/components/Icons';
import { lookFor, StudentFigure } from '@/components/Illustrations';
import { HoldRing, ListingArt, StatusPill } from '@/components/Listing';
import { ScreenHeader } from '@/components/ScreenHeader';
import { api } from '@/lib/api';
import { deadline, firstName, formatPrice, hoursLeft, timeAgo } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { findUniversity } from '@/theme/universities';

type ActionProps = { icon: ReactNode; title: string; body: string; onPress: () => void; danger?: boolean };

function Action({ icon, title, body, onPress, danger = false }: ActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className={`flex-1 rounded-2xl p-3.5 active:opacity-80 ${danger ? 'bg-[#FDE8E7]' : 'bg-tint'}`}
    >
      {icon}
      <Text className={`mt-2 font-body-bold text-[14px] ${danger ? 'text-danger' : 'text-ink'}`}>{title}</Text>
      <Text className="mt-0.5 font-body text-[12px] leading-[16px] text-muted">{body}</Text>
    </Pressable>
  );
}

/** 13 Manage reservation: the seller's view of a held item. */
export default function ManageRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { theme } = useTheme();

  const load = useCallback(() => api.reservations.get(id), [id]);
  const reservation = useApi(load);
  const item = reservation.data;

  if (!user) return null;
  if (!item) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader back title="Manage" />
        {reservation.error ? <ErrorState message={reservation.error} onRetry={reservation.reload} /> : <LoadingState />}
      </View>
    );
  }

  const buyer = firstName(item.buyer.fullName);
  const buyerCampus = findUniversity(item.buyer.universityId);
  const active = item.status === 'active';

  const confirm = (title: string, message: string, action: string, run: () => Promise<void>) =>
    Alert.alert(title, message, [
      { text: 'Keep', style: 'cancel' },
      { text: action, style: 'destructive', onPress: run },
    ]);

  const openChat = async () => {
    const conversationId = await api.chats.open(item.listing.id, user.id, item.buyerId);
    router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader back title="Manage">
        <View className="mt-4 flex-row items-center rounded-2xl bg-white/15 p-2.5">
          <View className="w-12">
            <ListingArt listing={item.listing} height={48} rounded="rounded-xl" />
          </View>
          <View className="ml-3 flex-1">
            <Text numberOfLines={1} className="font-body-bold text-[15px] text-white">
              {item.listing.title}
            </Text>
            <Text className="font-body text-[13px] text-white/80">
              {formatPrice(item.listing.price)} · {item.listing.condition}
            </Text>
          </View>
          <StatusPill status={item.listing.status} />
        </View>
      </ScreenHeader>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}>
        <View className="rounded-3xl bg-white p-4" style={{ boxShadow: '0 8px 22px rgba(36,20,65,0.07)' }}>
          <View className="flex-row">
            <View className="mr-3 items-center rounded-2xl bg-soft px-1 pt-2">
              <StudentFigure width={64} skirt={buyerCampus?.theme.uniform} {...lookFor(item.buyer)} leftArm="wave" />
            </View>
            <View className="flex-1">
              <Text className="font-body-bold text-[16px] text-ink">
                {active ? `${buyer} reserved this` : item.status === 'completed' ? `Sold to ${buyer}` : 'Hold released'}
              </Text>
              <Text className="mt-0.5 font-body text-[12.5px] text-muted">
                {[item.buyer.major, item.buyer.year].filter(Boolean).join(' · ')} · {timeAgo(item.createdAt)} ago
              </Text>
              {active && (
                <View className="mt-3 flex-row items-center">
                  <HoldRing hours={hoursLeft(item.expiresAt)} size={50} />
                  <View className="ml-3 flex-1">
                    <Text className="font-body-bold text-[13.5px] text-ink">Releases {deadline(item.expiresAt)}</Text>
                    <Text className="font-body text-[12px] text-muted">if you don’t meet before then</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          {item.priceChange && (
            <Text className="mt-3 rounded-xl bg-[#FFF4D1] px-3 py-2 font-body text-[12.5px] text-ink">
              Waiting for {buyer} to accept {formatPrice(item.priceChange.to)} (was {formatPrice(item.priceChange.from)}).
            </Text>
          )}
          <Button label={`Message ${buyer}`} variant="dark" size="small" className="mt-4" icon={<ChatIcon size={17} />} onPress={openChat} />
        </View>

        {active && (
          <>
            <View className="mt-4 flex-row gap-3">
              <Action
                icon={<EditIcon size={20} color={theme.accent} />}
                title="Edit details"
                body={`Photos, price, details. A new price needs ${buyer}’s OK.`}
                onPress={() => router.push({ pathname: '/sell-item', params: { id: item.listing.id } })}
              />
              <Action
                icon={<CloseIcon size={20} color={theme.accent} />}
                title="Cancel hold"
                body="Put it back on sale. They get told."
                onPress={() =>
                  confirm('Cancel this hold?', `${buyer} is told and the item goes back on sale.`, 'Cancel hold', async () => {
                    await api.reservations.cancel(item.id);
                    router.back();
                  })
                }
              />
            </View>
            <View className="mt-3 flex-row gap-3">
              <Action
                danger
                icon={<TrashIcon size={20} color={colors.danger} />}
                title="Remove"
                body="Delete the listing and end the hold."
                onPress={() =>
                  confirm('Remove this listing?', 'It disappears from search and the hold ends.', 'Remove', async () => {
                    await api.listings.remove(item.listing.id);
                    router.back();
                  })
                }
              />
              <Action
                icon={<FlagIcon size={20} color={theme.accent} />}
                title="Report buyer"
                body="Something feel off?"
                onPress={() => router.push({ pathname: '/report', params: { listingId: item.listing.id, target: 'seller', userName: item.buyer.fullName } })}
              />
            </View>
          </>
        )}
      </ScrollView>

      {active && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 10 }}>
          <Button
            label={
              item.sellerConfirmedAt
                ? `Waiting for ${buyer} to confirm`
                : item.buyerConfirmedAt
                  ? `${buyer} confirmed · confirm the sale`
                  : '✓  Mark as sold'
            }
            variant={item.sellerConfirmedAt ? 'light' : 'primary'}
            onPress={() => router.push({ pathname: '/confirm-sale/[id]', params: { id: item.id } })}
          />
          <Text className="mt-2 text-center font-body text-[12px] text-muted">
            Only after you’ve met and been paid. {buyer} confirms too before it counts.
          </Text>
        </View>
      )}
    </View>
  );
}
