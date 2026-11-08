import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { ListingArt } from '@/components/Listing';
import { ScreenHeader } from '@/components/ScreenHeader';
import { api } from '@/lib/api';
import type { ConversationSummary } from '@/lib/api/types';
import { formatPrice, timeAgo } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';

function preview(conversation: ConversationSummary, viewerId: string) {
  const message = conversation.lastMessage;
  if (!message) return 'Say hi 👋';
  const mine = message.senderId === viewerId ? 'You: ' : '';
  return message.kind === 'offer' ? `${mine}Offered ${formatPrice(message.amount ?? 0)}` : `${mine}${message.body}`;
}

function Row({ conversation, viewerId }: { conversation: ConversationSummary; viewerId: string }) {
  const unread = conversation.unread > 0;
  const role = conversation.sellerId === viewerId ? 'Your listing' : 'You’re buying';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${conversation.other.fullName} about ${conversation.listing.title}${unread ? `, ${conversation.unread} unread` : ''}`}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
      className="flex-row items-center rounded-2xl bg-white p-3 active:opacity-80"
    >
      <View>
        <Avatar person={conversation.other} size={50} />
        <View className="absolute -bottom-1 -right-1 overflow-hidden rounded-lg border-2 border-white" style={{ width: 26 }}>
          <ListingArt listing={conversation.listing} height={22} rounded="rounded-md" />
        </View>
      </View>
      <View className="ml-3.5 flex-1">
        <View className="flex-row items-center justify-between">
          <Text numberOfLines={1} className="mr-2 flex-1 font-body-bold text-[15.5px] text-ink">
            {conversation.other.fullName}
          </Text>
          <Text className={`font-body text-[12.5px] ${unread ? 'text-loop' : 'text-muted'}`}>
            {timeAgo(conversation.updatedAt)}
          </Text>
        </View>
        <Text numberOfLines={1} className="mt-0.5 font-body text-[12.5px] text-muted">
          {role} · {conversation.listing.title}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text numberOfLines={1} className={`flex-1 text-[14px] ${unread ? 'font-body-semibold text-ink' : 'font-body text-muted'}`}>
            {preview(conversation, viewerId)}
          </Text>
          {unread && (
            <View className="ml-2 h-5 min-w-5 items-center justify-center rounded-full bg-loop px-1.5">
              <Text className="font-body-bold text-[11px] text-white">{conversation.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function InboxRoute() {
  const { user } = useSession();
  const load = useCallback(async () => (user ? api.chats.list(user.id) : []), [user]);
  const chats = useApi(load);

  if (!user) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader back title="Messages" />
        <EmptyState
          emoji="💬"
          title="Chat with sellers"
          body="Sign up to message sellers, make offers and arrange meet-ups."
          action={{ label: 'Sign up with Gmail', onPress: () => router.push('/signup') }}
        />
      </View>
    );
  }

  const unread = chats.data?.reduce((total, chat) => total + chat.unread, 0) ?? 0;

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader back title="Messages" eyebrow={unread ? `${unread} UNREAD` : undefined} />
      {chats.error && !chats.data ? (
        <ErrorState message={chats.error} onRetry={chats.reload} />
      ) : !chats.data ? (
        <LoadingState />
      ) : (
        <FlatList
          data={chats.data}
          keyExtractor={(chat) => chat.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => <Row conversation={item} viewerId={user.id} />}
          ListEmptyComponent={
            <EmptyState
              emoji="💬"
              title="No messages yet"
              body="When you message a seller, or someone asks about your item, it shows up here."
              action={{ label: 'Browse the market', onPress: () => router.navigate('/market') }}
            />
          }
        />
      )}
    </View>
  );
}
