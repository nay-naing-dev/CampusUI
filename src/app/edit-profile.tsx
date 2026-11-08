import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Button, FieldError, TextField } from '@/components/Controls';
import { LockIcon } from '@/components/Icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { UniCrest } from '@/components/UniCrest';
import { api, errorMessage } from '@/lib/api';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { findUniversity } from '@/theme/universities';

export default function EditProfileRoute() {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useSession();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [major, setMajor] = useState(user?.major ?? '');
  const [year, setYear] = useState(user?.year ?? '');
  const [hometown, setHometown] = useState(user?.hometown ?? '');
  const [contact, setContact] = useState(user?.contact ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  // The account's own campus, even while another theme is being previewed.
  const campus = findUniversity(user.universityId);

  const save = async () => {
    if (!fullName.trim()) {
      setError('Your name can’t be empty.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setUser(
        await api.users.update(user.id, {
          fullName: fullName.trim(),
          major: major.trim(),
          year: year.trim(),
          hometown: hometown.trim(),
          contact: contact.trim(),
        }),
      );
      router.back();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader back title="Edit profile" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>
          <View className="items-center">
            <Avatar person={user} size={88} />
            <Text className="mt-2 font-body text-[12.5px] text-muted">Change your look with “Shuffle my look” on Profile.</Text>
          </View>

          <View className="mt-6 gap-4">
            <TextField label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField label="Major" value={major} onChangeText={setMajor} placeholder="Computer Science" />
              </View>
              <View className="w-[38%]">
                <TextField label="Year" value={year} onChangeText={setYear} placeholder="Year 3" />
              </View>
            </View>
            <TextField label="Hometown" value={hometown} onChangeText={setHometown} placeholder="Kyaukse" />
            <TextField label="Contact" value={contact} onChangeText={setContact} placeholder="Telegram @username" autoCapitalize="none" />
          </View>

          <Text className="mb-2 mt-6 font-body-medium text-[14.5px] text-night">Gmail</Text>
          <View className="h-14 flex-row items-center rounded-2xl bg-line px-4">
            <Text className="flex-1 font-body text-[16px] text-muted">{user.email}</Text>
            <LockIcon size={18} color={colors.muted} />
          </View>

          <Text className="mb-2 mt-4 font-body-medium text-[14.5px] text-night">University</Text>
          <View className="flex-row items-center rounded-2xl bg-line p-3">
            {campus && <UniCrest university={campus} size={32} />}
            <View className="ml-3 flex-1">
              <Text className="font-body-semibold text-[15px] text-ink">{campus?.name}</Text>
              <Text className="font-body text-[12.5px] text-muted">Changing campus needs a new student ID check.</Text>
            </View>
            <LockIcon size={18} color={colors.muted} />
          </View>

          <FieldError message={error ?? undefined} />
          <Button label="Save changes" className="mt-7" onPress={save} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
