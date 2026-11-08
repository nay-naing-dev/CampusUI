import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { ErrorState, LoadingState } from '@/components/EmptyState';
import { CloseIcon, SendIcon, TagIcon } from '@/components/Icons';
import { ListingArt } from '@/components/Listing';
import { ScreenHeader } from '@/components/ScreenHeader';
import { api } from '@/lib/api';
import type { Message } from '@/lib/api/types';
import { clockTime, formatPrice } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

// Stands in for a websocket until the NestJS gateway exists.
const POLL_MS = 2500;

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  if (message.kind === 'offer') {
    return (
      <View className={`max-w-[78%] rounded-2xl border-[1.5px] border-loop bg-white p-3 ${mine ? 'self-end' : 'self-start'}`}>
        <Text className="font-body-bold text-[12px] tracking-[1.2px] text-loop">{mine ? 'YOUR OFFER' : 'OFFER'}</Text>
        <Text className="mt-0.5 font-heading text-[22px] text-ink">{formatPrice(message.amount ?? 0)}</Text>
        <Text className="mt-1 font-body text-[11.5px] text-muted">{clockTime(message.createdAt)}</Text>
      </View>
    );
  }
  return (
    <View className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${mine ? 'self-end rounded-br-md bg-loop' : 'self-start rounded-bl-md bg-white'}`}>
      <Text className={`font-body text-[15.5px] leading-[21px] ${mine ? 'text-white' : 'text-ink'}`}>{message.body}</Text>
      <Text className={`mt-1 text-right font-body text-[11px] ${mine ? 'text-white/70' : 'text-muted'}`}>{clockTime(message.createdAt)}</Text>
    </View>
  );
}

export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { theme } = useTheme();
  const scroll = useRef<ScrollViewInstance>(null);
  const [draft, setDraft] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(() => api.chats.get(id, user?.id ?? ''), [id, user?.id]);
  const chat = useApi(load);
  const { reload } = chat;

  useEffect(() => {
    const timer = setInterval(reload, POLL_MS);
    return () => clearInterval(timer);
  }, [reload]);

  if (!user) return null;

  const summary = chat.data?.summary;
  const messages = chat.data?.messages ?? [];
  const amount = Number(draft.replace(/[^\d]/g, ''));
  const canSend = offerMode ? amount > 0 : draft.trim().length > 0;

  const send = async () => {
    if (!canSend || !chat.data) return;
    setSending(true);
    const sent = await api.chats.send(id, user.id, offerMode ? { kind: 'offer', body: 'Offer', amount } : { kind: 'text', body: draft.trim() });
    chat.setData({ ...chat.data, messages: [...messages, sent] });
    setDraft('');
    setOfferMode(false);
    setSending(false);
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader
        back
        title={summary?.other.fullName ?? 'Chat'}
        eyebrow={summary?.sellerId === user.id ? 'BUYER' : 'SELLER'}
        right={summary ? <Avatar person={summary.other} size={42} ring /> : undefined}
      >
        {summary && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View listing ${summary.listing.title}`}
            onPress={() => router.push({ pathname: '/listing/[id]', params: { id: summary.listing.id } })}
            className="mt-4 flex-row items-center rounded-2xl bg-white/10 p-2 active:opacity-80"
          >
            <View className="w-12">
              <ListingArt listing={summary.listing} height={48} rounded="rounded-xl" />
            </View>
            <View className="ml-3 flex-1">
              <Text numberOfLines={1} className="font-body-semibold text-[14.5px] text-white">
                {summary.listing.title}
              </Text>
              <Text className="font-body-bold text-[14px] text-highlight">
                {formatPrice(summary.listing.price)}
                {summary.listing.status === 'sold' ? ' · Sold' : ''}
              </Text>
            </View>
          </Pressable>
        )}
      </ScreenHeader>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {chat.error && !chat.data ? (
          <ErrorState message={chat.error} onRetry={reload} />
        ) : !chat.data ? (
          <LoadingState />
        ) : (
          <ScrollView
            ref={scroll}
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1, justifyContent: 'flex-end' }}
          >
            <Text className="mb-2 text-center font-body text-[12.5px] text-muted">
              Meet in a public spot on campus. Never pay before you see the item.
            </Text>
            {messages.map((message) => (
              <Bubble key={message.id} message={message} mine={message.senderId === user.id} />
            ))}
          </ScrollView>
        )}

        <View className="border-t border-line bg-white px-3 pt-2.5" style={{ paddingBottom: insets.bottom + 10 }}>
          {offerMode && (
            <View className="mb-2 flex-row items-center px-1">
              <TagIcon size={15} color={theme.accent} />
              <Text className="ml-1.5 flex-1 font-body-semibold text-[13px] text-loop">
                Making an offer · asking {summary ? formatPrice(summary.listing.price) : ''}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Cancel offer" onPress={() => { setOfferMode(false); setDraft(''); }} hitSlop={10}>
                <CloseIcon size={16} color={colors.muted} />
              </Pressable>
            </View>
          )}
          <View className="flex-row items-end gap-2">
            {!offerMode && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Make an offer"
                onPress={() => { setOfferMode(true); setDraft(''); }}
                className="h-11 flex-row items-center rounded-full border-[1.5px] border-line px-3 active:opacity-70"
              >
                <TagIcon size={17} color={theme.accent} />
                <Text className="ml-1 font-body-bold text-[13.5px] text-loop">Offer</Text>
              </Pressable>
            )}
            <View className="min-h-11 flex-1 justify-center rounded-3xl bg-canvas px-4">
              <TextInput
                value={draft}
                onChangeText={offerMode ? (value) => setDraft(value.replace(/[^\d]/g, '')) : setDraft}
                placeholder={offerMode ? 'Your price in $' : 'Message'}
                placeholderTextColor="#8D87A3"
                accessibilityLabel={offerMode ? 'Offer amount in dollars' : 'Message'}
                keyboardType={offerMode ? 'number-pad' : 'default'}
                multiline={!offerMode}
                autoFocus={offerMode}
                className="max-h-28 py-2.5 font-body text-[16px] text-ink"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={offerMode ? 'Send offer' : 'Send message'}
              accessibilityState={{ disabled: !canSend || sending }}
              disabled={!canSend || sending}
              onPress={send}
              className={`h-11 w-11 items-center justify-center rounded-full ${canSend ? 'bg-loop' : 'bg-line'}`}
            >
              <SendIcon size={19} color={canSend ? '#fff' : colors.muted} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
