import { launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync } from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, FieldError, IconButton, TextField, Toggle } from '@/components/Controls';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { CloseIcon, InfoIcon, PhotoIcon, PlusIcon } from '@/components/Icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { api, errorMessage } from '@/lib/api';
import type { Category, Condition, Listing } from '@/lib/api/types';
import { CATEGORIES, CONDITIONS } from '@/lib/categories';
import { formatPrice } from '@/lib/format';
import { notBuiltYet } from '@/lib/placeholder';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

const MAX_PHOTOS = 4;

type Draft = {
  photos: string[];
  title: string;
  price: string;
  free: boolean;
  category: Category | null;
  condition: Condition | null;
  description: string;
  meetup: string;
};

const EMPTY_DRAFT: Draft = { photos: [], title: '', price: '', free: false, category: null, condition: null, description: '', meetup: '' };

// A new listing's draft survives leaving the screen, like the "Draft saved"
// label in the design. With the API this would sync to the server.
let savedDraft: Draft = EMPTY_DRAFT;

function draftFrom(listing: Listing): Draft {
  return {
    photos: listing.photos,
    title: listing.title,
    price: listing.price ? String(listing.price) : '',
    free: listing.price === 0,
    category: listing.category,
    condition: listing.condition,
    description: listing.description,
    meetup: listing.meetup,
  };
}

type Errors = { title?: string; price?: string; category?: string; condition?: string; meetup?: string };

function Label({ children, hint }: { children: string; hint?: string }) {
  return (
    <View className="mb-2 mt-6 flex-row items-baseline">
      <Text className="font-body-bold text-[14.5px] text-ink">{children}</Text>
      {hint ? <Text className="ml-1.5 font-body text-[12.5px] text-muted">{hint}</Text> : null}
    </View>
  );
}

type Props = {
  /** "tab" is the Sell tab; "page" is the stacked /sell-item screen. */
  presentation: 'tab' | 'page';
  /** Edit this listing instead of creating a new one (page only). */
  editId?: string;
};

/**
 * 11 Sell an item: photos (gallery or camera), title, category, condition,
 * price or free, description and meet-up spot. Also edits an existing listing.
 */
export function SellScreen({ presentation, editId }: Props) {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useSession();
  const { theme, university } = useTheme();
  const editing = !!editId;
  const [draft, setDraft] = useState<Draft>(editing ? EMPTY_DRAFT : savedDraft);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const loadListing = useCallback(async () => (editId ? api.listings.get(editId, user?.id ?? null) : null), [editId, user?.id]);
  const existing = useApi(loadListing);

  // Fill the form once the listing being edited arrives.
  const [filledFrom, setFilledFrom] = useState<string | null>(null);
  if (existing.data && filledFrom !== existing.data.id) {
    setFilledFrom(existing.data.id);
    setDraft(draftFrom(existing.data));
  }

  useEffect(() => {
    if (!editing) savedDraft = draft;
  }, [draft, editing]);

  const update = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));
  const hasDraft = !editing && JSON.stringify(draft) !== JSON.stringify(EMPTY_DRAFT);
  const title = editing ? 'Edit listing' : 'Sell an item';
  const bottomSpace = presentation === 'tab' ? TAB_BAR_SPACE + 20 : insets.bottom + 32;

  const leave = () => (presentation === 'tab' ? router.navigate('/market') : router.canGoBack() ? router.back() : router.replace('/market'));
  const close = (
    <IconButton label={presentation === 'tab' ? 'Close' : 'Go back'} onPress={leave}>
      <CloseIcon size={18} />
    </IconButton>
  );
  const header = (extra?: ReactNode) =>
    presentation === 'page' ? (
      <ScreenHeader back title={title} right={extra} />
    ) : (
      <ScreenHeader
        title={title}
        right={
          <View className="flex-row items-center gap-3">
            {extra}
            {close}
          </View>
        }
      />
    );

  if (!user) {
    return (
      <View className="flex-1 bg-canvas">
        {header()}
        <EmptyState
          emoji="🏷️"
          title="Sign up to sell"
          body="Selling is for verified students, so buyers know who they’re meeting."
          action={{ label: 'Create a student account', onPress: () => router.push('/signup') }}
        />
      </View>
    );
  }

  if (user.verification === 'pending') {
    return (
      <View className="flex-1 bg-canvas">
        {header()}
        <EmptyState emoji="⏳" title="Almost there" body="You can sell once your student ID is verified. That usually takes under 24 hours." />
        <View className="px-6">
          <Button
            label="Approve my ID (testing)"
            variant="outline"
            size="small"
            loading={approving}
            onPress={async () => {
              setApproving(true);
              try {
                setUser(await api.users.simulateVerification(user.id));
              } finally {
                setApproving(false);
              }
            }}
          />
        </View>
      </View>
    );
  }

  if (editing && !existing.data) {
    return (
      <View className="flex-1 bg-canvas">
        {header()}
        {existing.error ? <EmptyState emoji="😕" title="Couldn’t open this listing" body={existing.error} /> : <LoadingState />}
      </View>
    );
  }

  if (existing.data && (existing.data.sellerId !== user.id || existing.data.status === 'sold')) {
    return (
      <View className="flex-1 bg-canvas">
        {header()}
        <EmptyState
          emoji="🔒"
          title={existing.data.status === 'sold' ? 'This one’s sold' : 'Not your listing'}
          body={existing.data.status === 'sold' ? 'Sold listings stay as they were so both of you have a record.' : 'You can only edit things you listed.'}
          action={{ label: 'Go back', onPress: leave }}
        />
      </View>
    );
  }

  const reserved = existing.data?.status === 'reserved';
  const priceValue = draft.free ? 0 : Number(draft.price);
  const problems: Errors = {
    title: draft.title.trim().length >= 3 ? undefined : 'Give it a short title.',
    price: draft.free || priceValue > 0 ? undefined : 'Enter a price, or switch on Free.',
    category: draft.category ? undefined : 'Pick a category.',
    condition: draft.condition ? undefined : 'Pick a condition.',
    meetup: draft.meetup.trim() ? undefined : 'Where on campus can you meet?',
  };
  const errors: Errors = submitted ? problems : {};
  const room = MAX_PHOTOS - draft.photos.length;

  const addFromLibrary = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: true, selectionLimit: room });
    if (!result.canceled) update({ photos: [...draft.photos, ...result.assets.map((asset) => asset.uri)].slice(0, MAX_PHOTOS) });
  };

  const addFromCamera = async () => {
    const permission = await requestCameraPermissionsAsync();
    if (!permission.granted) {
      notBuiltYet('Camera is off', 'Allow camera access in Settings to take photos, or pick from your gallery.');
      return;
    }
    const result = await launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) update({ photos: [...draft.photos, result.assets[0].uri].slice(0, MAX_PHOTOS) });
  };

  const makeCover = (uri: string) => update({ photos: [uri, ...draft.photos.filter((item) => item !== uri)] });

  const submit = async () => {
    setSubmitted(true);
    setFormError(null);
    if (Object.values(problems).some(Boolean) || !draft.category || !draft.condition) return;
    const input = {
      title: draft.title.trim(),
      price: priceValue,
      category: draft.category,
      condition: draft.condition,
      description: draft.description.trim(),
      photos: draft.photos,
      meetup: draft.meetup.trim(),
    };
    setBusy(true);
    try {
      if (editId) {
        await api.listings.update(editId, user.id, input);
        leave();
      } else {
        const listing = await api.listings.create(input, user);
        setDraft(EMPTY_DRAFT);
        setSubmitted(false);
        if (presentation === 'page') router.replace({ pathname: '/listing/[id]', params: { id: listing.id } });
        else router.push({ pathname: '/listing/[id]', params: { id: listing.id } });
      }
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      {header(hasDraft ? <Text className="font-body-semibold text-[12.5px] text-white/75">Draft saved</Text> : undefined)}
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: bottomSpace }}>
          <Label hint={`${draft.photos.length}/${MAX_PHOTOS} · first is the cover`}>Photos</Label>
          {draft.photos.length === 0 ? (
            <View className="items-center rounded-3xl border-[1.5px] border-dashed border-loop/50 bg-soft/60 py-6">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-loop">
                <PhotoIcon color={theme.onAccent} />
              </View>
              <Text className="mt-3 font-body-bold text-[15px] text-ink">Add up to {MAX_PHOTOS} photos</Text>
              <Text className="mt-0.5 font-body text-[13px] text-muted">Good light, plain background, show any wear</Text>
              <View className="mt-4 flex-row gap-2.5">
                <Button label="Gallery" size="small" onPress={addFromLibrary} />
                <Button label="Camera" size="small" variant="light" onPress={addFromCamera} />
              </View>
            </View>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {draft.photos.map((uri, index) => (
                  <Pressable
                    key={uri}
                    accessibilityRole="button"
                    accessibilityLabel={index === 0 ? 'Cover photo' : `Photo ${index + 1}. Tap to make it the cover.`}
                    onPress={() => index > 0 && makeCover(uri)}
                  >
                    <Image
                      source={{ uri }}
                      accessibilityIgnoresInvertColors
                      className={`h-24 w-24 rounded-2xl bg-line ${index === 0 ? 'border-2 border-loop' : ''}`}
                    />
                    <View className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/75 px-1.5 py-0.5">
                      <Text className="font-body-bold text-[10.5px] text-white">{index === 0 ? 'Cover' : 'Make cover'}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo"
                      onPress={() => update({ photos: draft.photos.filter((item) => item !== uri) })}
                      hitSlop={8}
                      className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-ink/70"
                    >
                      <CloseIcon size={13} strokeWidth={2.6} />
                    </Pressable>
                  </Pressable>
                ))}
                {room > 0 && (
                  <View className="gap-2">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Add photos from gallery"
                      onPress={addFromLibrary}
                      className="h-[43px] w-24 flex-row items-center justify-center rounded-xl border-[1.5px] border-dashed border-loop/50 bg-soft/60"
                    >
                      <PlusIcon size={16} color={theme.accent} />
                      <Text className="ml-1 font-body-semibold text-[12px] text-loop">Gallery</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Take a photo"
                      onPress={addFromCamera}
                      className="h-[43px] w-24 flex-row items-center justify-center rounded-xl border-[1.5px] border-dashed border-loop/50 bg-soft/60"
                    >
                      <PhotoIcon size={16} color={theme.accent} />
                      <Text className="ml-1 font-body-semibold text-[12px] text-loop">Camera</Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </>
          )}

          <View className="mt-6">
            <TextField label="Title" value={draft.title} onChangeText={(value) => update({ title: value })} placeholder="e.g. Adjustable LED desk lamp" maxLength={60} error={errors.title} />
          </View>

          <Label>Category</Label>
          <View className="flex-row flex-wrap gap-2.5">
            {CATEGORIES.map((category) => {
              const selected = draft.category === category.id;
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={category.label}
                  onPress={() => update({ category: category.id })}
                  className="w-[22%] items-center"
                >
                  <View
                    className={`aspect-square w-full items-center justify-center rounded-2xl border-2 ${selected ? 'border-loop' : 'border-transparent'}`}
                    style={{ backgroundColor: category.tint }}
                  >
                    <Text className="text-[26px]">{category.emoji}</Text>
                  </View>
                  <Text className={`mt-1 font-body-semibold text-[12px] ${selected ? 'text-loop' : 'text-ink'}`}>{category.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <FieldError message={errors.category} />

          <Label>Condition</Label>
          <View className="flex-row flex-wrap gap-2">
            {CONDITIONS.map((condition) => (
              <Chip key={condition} label={condition} selected={draft.condition === condition} onPress={() => update({ condition })} />
            ))}
          </View>
          <FieldError message={errors.condition} />

          <Label>Price</Label>
          <View className={`flex-row items-center rounded-2xl border-[1.5px] bg-white px-4 py-3 ${errors.price ? 'border-danger' : 'border-line'}`}>
            <Text className={`font-heading text-[26px] ${draft.free ? 'text-muted' : 'text-ink'}`}>$</Text>
            <TextInput
              value={draft.free ? '0' : draft.price}
              editable={!draft.free}
              onChangeText={(value) => update({ price: value.replace(/[^\d]/g, '') })}
              placeholder="12"
              placeholderTextColor="#B9B3CC"
              keyboardType="number-pad"
              accessibilityLabel="Price in dollars"
              className={`ml-1 flex-1 font-heading text-[26px] ${draft.free ? 'text-muted' : 'text-ink'}`}
            />
            <Text className="mr-2 font-body-semibold text-[14px] text-ink">Free</Text>
            <Toggle label="Give it away for free" value={draft.free} onChange={(free) => update({ free })} />
          </View>
          <FieldError message={errors.price} />
          {reserved && existing.data && priceValue !== existing.data.price && (
            <View className="mt-2 flex-row rounded-xl bg-[#FFF4D1] p-3">
              <InfoIcon size={16} color="#8A5A00" />
              <Text className="ml-2 flex-1 font-body text-[12.5px] leading-[18px] text-ink">
                Someone is holding this at {formatPrice(existing.data.price)}. They’ll have 12 hours to accept {formatPrice(priceValue)} or let the hold go.
              </Text>
            </View>
          )}

          <View className="mt-6 gap-4">
            <TextField label="Description" value={draft.description} onChangeText={(value) => update({ description: value })} placeholder="Size, edition, any wear, why you’re selling…" multiline maxLength={500} />
            <TextField label="Meet-up spot" value={draft.meetup} onChangeText={(value) => update({ meetup: value })} placeholder="e.g. Main library steps" error={errors.meetup} />
          </View>

          <FieldError message={formError ?? undefined} />
          <Button label={editing ? 'Save changes' : 'Post listing'} className="mt-7" onPress={submit} loading={busy} />
          {editing ? (
            <Text accessibilityRole="button" onPress={leave} className="mt-4 py-1 text-center font-body-bold text-[14px] text-muted">
              Discard changes
            </Text>
          ) : (
            <Text className="mt-3 text-center font-body text-[12.5px] leading-[18px] text-muted">
              Students at {university?.short ?? 'your campus'} can reserve it for 72 hours. Edit or remove it anytime.
            </Text>
          )}
          {!editing && hasDraft && (
            <Text
              accessibilityRole="button"
              onPress={() => {
                setDraft(EMPTY_DRAFT);
                setSubmitted(false);
              }}
              className="mt-3 py-1 text-center font-body-semibold text-[13px]"
              style={{ color: colors.muted }}
            >
              Clear draft
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

