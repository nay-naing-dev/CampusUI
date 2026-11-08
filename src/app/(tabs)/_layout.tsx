import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useCallback } from 'react';
import { TabBar } from '@/components/TabBar';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';

export default function TabsLayout() {
  const { user, isGuest } = useSession();

  // Red dot on Activity while the buyer owes an answer: a price change, or
  // confirming a sale the seller already marked as done.
  const loadPending = useCallback(
    async () =>
      user
        ? (await api.reservations.forBuyer(user.id)).filter((item) => item.priceChange || (item.sellerConfirmedAt && !item.buyerConfirmedAt)).length
        : 0,
    [user],
  );
  const pending = useApi(loadPending);

  if (!user && !isGuest) return <Redirect href="/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} badges={{ activity: pending.data ?? 0 }} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
    >
      <Tabs.Screen name="market" options={{ title: 'Market' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="sell" options={{ title: 'Sell' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
