import { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { BellIcon, ChatIcon, CheckIcon, ShieldIcon, SparkleIcon, TagIcon } from '@/components/Icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { api } from '@/lib/api';
import type { AppNotification } from '@/lib/api/types';
import { timeAgo } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import { useTheme } from '@/theme/ThemeProvider';

const ICONS: Record<AppNotification['kind'], typeof BellIcon> = {
  verified: ShieldIcon,
  reserved: TagIcon,
  price: TagIcon,
  message: ChatIcon,
  tip: BellIcon,
  confirm: CheckIcon,
  badge: SparkleIcon,
};

export default function NotificationsRoute() {
  const { user } = useSession();
  const { theme } = useTheme();
  const load = useCallback(async () => (user ? api.notifications.list(user) : []), [user]);
  const notifications = useApi(load);
  const unread = notifications.data?.some((item) => !item.read);

  const markAllRead = async () => {
    if (!user || !notifications.data) return;
    notifications.setData(notifications.data.map((item) => ({ ...item, read: true })));
    await api.notifications.markAllRead(user.id);
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader
        back
        title="Notifications"
        right={
          unread ? (
            <Pressable accessibilityRole="button" onPress={markAllRead} hitSlop={8} className="rounded-full bg-white/15 px-3 py-2 active:opacity-70">
              <Text className="font-body-semibold text-[13px] text-white">Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />
      {notifications.error && !notifications.data ? (
        <ErrorState message={notifications.error} onRetry={notifications.reload} />
      ) : !notifications.data ? (
        <LoadingState />
      ) : (
        <FlatList
          data={notifications.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={<EmptyState emoji="🔔" title="All caught up" body="Offers, messages and price drops show up here." />}
          renderItem={({ item }) => {
            const Icon = ICONS[item.kind];
            return (
              <View className={`flex-row rounded-2xl p-4 ${item.read ? 'bg-white' : 'bg-loop/10'}`}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Icon size={19} color={theme.accent} />
                </View>
                <View className="ml-3 flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text className="mr-2 flex-1 font-body-bold text-[15px] text-ink">{item.title}</Text>
                    <Text className="font-body text-[12px] text-muted">{timeAgo(item.createdAt)}</Text>
                  </View>
                  <Text className="mt-0.5 font-body text-[14px] leading-[20px] text-muted">{item.body}</Text>
                </View>
                {!item.read && <View className="ml-2 mt-1.5 h-2 w-2 rounded-full bg-loop" />}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
