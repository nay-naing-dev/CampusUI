import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { BackButton, Button, Checkbox, FieldError, TextField, TextLink } from '@/components/Controls';
import { PlainStickman } from '@/components/Illustrations';
import { UniCrest } from '@/components/UniCrest';
import { errorMessage } from '@/lib/api';
import { isGmail } from '@/lib/validation';
import { useSession } from '@/state/session';
import { findUniversity } from '@/theme/universities';

// Seeded in src/lib/api/mock-db.ts. Remove with the mock API.
const DEMO_ACCOUNTS = [
  { email: 'demo@gmail.com', universityId: 'tukse' },
  { email: 'wytu.demo@gmail.com', universityId: 'wytu' },
];
const DEMO_PASSWORD = 'password123';

export default function LoginRoute() {
  // Set by the sign-in gate, so you land back on the listing you were reserving.
  const { next: returnTo } = useLocalSearchParams<{ next?: string }>();
  const { login, continueAsGuest } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next = {
      email: isGmail(email) ? undefined : 'Enter your Gmail address, like name@gmail.com.',
      password: password ? undefined : 'Enter your password.',
    };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;

    setBusy(true);
    try {
      await login(email, password);
      router.replace({ pathname: '/campus-welcome', params: returnTo ? { next: returnTo } : {} });
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      hero={
        <View>
          <View className="absolute right-0 top-0">
            <PlainStickman height={250} />
          </View>
          <BackButton onPress={() => router.replace('/welcome')} />
          <Text accessibilityRole="header" className="mt-7 font-heading text-[40px] leading-[46px] text-white">
            Welcome{'\n'}back
          </Text>
          <Text className="mt-3 font-body text-[16px] leading-[21px] text-white/80">
            Log in with the Gmail{'\n'}you signed up with
          </Text>
        </View>
      }
    >
      <View className="gap-4">
        <TextField
          label="Gmail"
          value={email}
          onChangeText={setEmail}
          placeholder="name@gmail.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          error={errors.email}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          secret
          error={errors.password}
          onSubmitEditing={submit}
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Checkbox checked={remember} onChange={setRemember} label="Remember me">
          <Text className="font-body-medium text-[14.5px] text-night">Remember me</Text>
        </Checkbox>
        <TextLink label="Forgot password?" className="text-[14.5px]" onPress={() => router.push('/forgot-password')} />
      </View>

      <FieldError message={formError ?? undefined} />
      <Button label="Log in" className="mt-6" onPress={submit} loading={busy} />

      <View className="my-6 flex-row items-center">
        <View className="h-px flex-1 bg-line" />
        <Text className="mx-3 font-body text-[13px] text-muted">or</Text>
        <View className="h-px flex-1 bg-line" />
      </View>

      <Button
        label="Browse as guest"
        variant="light"
        onPress={() => {
          continueAsGuest();
          router.replace('/market');
        }}
      />

      <Text className="mt-7 text-center font-body text-[15px] text-muted">
        New to CampusLoop? <TextLink label="Sign up" onPress={() => router.replace('/signup')} />
      </Text>

      <View className="mt-8 rounded-2xl border border-dashed border-line p-4">
        <Text className="font-body-bold text-[12px] tracking-[1.4px] text-muted">DEMO ACCOUNTS · TAP TO FILL</Text>
        <View className="mt-3 gap-2">
          {DEMO_ACCOUNTS.map((account) => {
            const campus = findUniversity(account.universityId)!;
            return (
              <Pressable
                key={account.email}
                accessibilityRole="button"
                accessibilityLabel={`Fill demo account ${account.email}, ${campus.name}`}
                onPress={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                  setErrors({});
                  setFormError(null);
                }}
                className="flex-row items-center rounded-xl bg-canvas p-2.5 active:opacity-70"
              >
                <UniCrest university={campus} size={26} />
                <View className="ml-3 flex-1">
                  <Text className="font-body-semibold text-[14px] text-ink">{account.email}</Text>
                  <Text className="font-body text-[12.5px] text-muted">
                    {campus.short} theme · {DEMO_PASSWORD}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </AuthScreen>
  );
}
