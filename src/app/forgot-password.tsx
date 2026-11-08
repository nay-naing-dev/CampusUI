import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { BackButton, Button, TextField } from '@/components/Controls';
import { MailIcon } from '@/components/Icons';
import { api, errorMessage } from '@/lib/api';
import { isGmail } from '@/lib/validation';
import { useTheme } from '@/theme/ThemeProvider';

export default function ForgotPasswordRoute() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async () => {
    if (!isGmail(email)) {
      setError('Enter your Gmail address, like name@gmail.com.');
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await api.auth.requestPasswordReset(email);
      setSentTo(email.trim());
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      hero={
        <View>
          <BackButton onPress={() => router.back()} />
          <Text accessibilityRole="header" className="mt-7 font-heading text-[34px] leading-[40px] text-white">
            Reset your{'\n'}password
          </Text>
          <Text className="mt-3 font-body text-[16px] leading-[21px] text-white/80">
            We’ll email you a link to choose a new one.
          </Text>
        </View>
      }
    >
      {sentTo ? (
        <View className="items-center pt-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-loop/10">
            <MailIcon size={30} color={theme.accent} />
          </View>
          <Text className="mt-4 font-heading text-[22px] text-ink">Check your inbox</Text>
          <Text className="mt-2 text-center font-body text-[15px] leading-[22px] text-muted">
            If an account uses {sentTo}, a reset link is on its way. It expires in 30 minutes.
          </Text>
          <Button label="Back to log in" className="mt-8 self-stretch" onPress={() => router.replace('/login')} />
          <Button label="Use a different Gmail" variant="light" className="mt-3 self-stretch" onPress={() => setSentTo(null)} />
        </View>
      ) : (
        <>
          <TextField
            label="Gmail"
            value={email}
            onChangeText={setEmail}
            placeholder="name@gmail.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={error}
            onSubmitEditing={submit}
          />
          <Button label="Send reset link" className="mt-6" onPress={submit} loading={busy} />
        </>
      )}
    </AuthScreen>
  );
}
