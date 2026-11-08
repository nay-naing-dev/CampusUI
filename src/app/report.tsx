import { launchImageLibraryAsync } from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, FieldError, IconButton, Segmented, TextField } from '@/components/Controls';
import { CloseIcon, EyeOffIcon, FlagIcon, InfoIcon, PhotoIcon, PlusIcon, UserIcon, WarningIcon } from '@/components/Icons';
import { ListingArt } from '@/components/Listing';
import { ScreenHeader } from '@/components/ScreenHeader';
import { api, errorMessage } from '@/lib/api';
import type { ReportReason } from '@/lib/api/types';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

type Target = 'listing' | 'seller';

const REASONS: { id: ReportReason; label: string; icon: (color: string) => ReactNode }[] = [
  { id: 'photos', label: 'Photos don’t match', icon: (color) => <PhotoIcon size={18} color={color} /> },
  { id: 'scam', label: 'Scam or fake', icon: (color) => <WarningIcon size={18} color={color} /> },
  { id: 'not-allowed', label: 'Not allowed', icon: (color) => <EyeOffIcon size={18} color={color} /> },
  { id: 'rude', label: 'Rude or unsafe', icon: (color) => <UserIcon size={18} color={color} /> },
];

const MAX_EVIDENCE = 3;

/** 17 Report a listing or a person. */
export default function ReportRoute() {
  const { listingId, target: initialTarget, userName } = useLocalSearchParams<{ listingId: string; target?: Target; userName?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { theme } = useTheme();
  const [target, setTarget] = useState<Target>(initialTarget ?? 'listing');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const load = useCallback(() => api.listings.get(listingId, user?.id ?? null), [listingId, user?.id]);
  const listing = useApi(load).data;
  const person = userName ?? listing?.seller.fullName ?? 'this person';

  const addEvidence = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!result.canceled) setEvidence((current) => [...current, result.assets[0].uri].slice(0, MAX_EVIDENCE));
  };

  const send = async () => {
    if (!user) return;
    if (!reason) {
      setError('Pick what’s wrong.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.reports.create(user.id, { target, listingId, reason, details: details.trim(), evidence });
      setSent(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const close = (
    <IconButton label="Close" onPress={() => router.back()}>
      <CloseIcon size={18} />
    </IconButton>
  );

  if (sent) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader title="Report" right={close} />
        <View className="items-center px-8 pt-16">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-soft">
            <FlagIcon size={28} color={theme.accent} />
          </View>
          <Text className="mt-4 font-heading text-[22px] text-ink">Thanks for telling us</Text>
          <Text className="mt-2 text-center font-body text-[14.5px] leading-[21px] text-muted">
            Our team reviews reports within 24 hours. {target === 'seller' ? person : 'The seller'} won’t know who reported.
          </Text>
          <Button label="Done" className="mt-8 self-stretch" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Report" right={close}>
        <View className="mt-4">
          <Segmented
            tone="onBrand"
            value={target}
            onChange={setTarget}
            options={[
              { value: 'listing', label: 'This listing' },
              { value: 'seller', label: userName ? 'This buyer' : 'This seller' },
            ]}
          />
        </View>
      </ScreenHeader>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>
          {listing && (
            <View className="flex-row items-center rounded-2xl bg-white p-3">
              <View className="w-11">
                <ListingArt listing={listing} height={44} rounded="rounded-xl" />
              </View>
              <View className="ml-3 flex-1">
                <Text numberOfLines={1} className="font-body-bold text-[14.5px] text-ink">
                  {target === 'listing' ? listing.title : person}
                </Text>
                <Text className="font-body text-[12.5px] text-muted">
                  {target === 'listing' ? `Listed by ${listing.seller.fullName}` : `About ${listing.title}`}
                </Text>
              </View>
            </View>
          )}

          <Text className="mt-6 font-body-bold text-[15px] text-ink">What’s wrong?</Text>
          <View className="mt-3 flex-row flex-wrap justify-between gap-y-2.5">
            {REASONS.map((option) => {
              const selected = reason === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setReason(option.id)}
                  className={`w-[48.5%] flex-row items-center rounded-2xl border-[1.5px] p-3 ${selected ? 'border-loop bg-soft' : 'border-line bg-white'}`}
                >
                  {option.icon(selected ? theme.accent : colors.muted)}
                  <Text className="ml-2 flex-1 font-body-semibold text-[13.5px] text-ink">{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6">
            <TextField label="Tell us more" value={details} onChangeText={setDetails} placeholder="What happened? Dates and details help." multiline maxLength={500} />
          </View>

          <Text className="mt-5 font-body-medium text-[14.5px] text-night">
            Add evidence <Text className="text-muted">· optional</Text>
          </Text>
          <View className="mt-2 flex-row gap-2.5">
            {evidence.map((uri) => (
              <Image key={uri} source={{ uri }} accessibilityIgnoresInvertColors className="h-16 w-16 rounded-xl bg-line" />
            ))}
            {evidence.length < MAX_EVIDENCE && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add a screenshot or photo"
                onPress={addEvidence}
                className="h-16 w-16 items-center justify-center rounded-xl border-[1.5px] border-dashed border-loop/50 bg-white"
              >
                <PlusIcon size={22} color={theme.accent} />
              </Pressable>
            )}
          </View>

          <View className="mt-5 flex-row rounded-2xl bg-tint p-3">
            <InfoIcon size={17} color={colors.muted} />
            <Text className="ml-2 flex-1 font-body text-[12.5px] leading-[18px] text-muted">
              We review within 24 hours. The other student won’t know who reported. In danger? Contact campus security first.
            </Text>
          </View>

          <FieldError message={error ?? undefined} />
          <Button label="Send report" className="mt-6" onPress={send} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
