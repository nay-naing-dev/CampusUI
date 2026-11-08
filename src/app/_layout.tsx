import '../../global.css';

import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { Chango_400Regular } from '@expo-google-fonts/chango';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SessionProvider, useSession } from '@/state/session';
import colors from '@/theme/colors';
import { ThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { user } = useSession();

  return (
    <ThemeProvider universityId={user?.universityId ?? null}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="verification" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="campus-welcome" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="sign-in-gate" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="reserve/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="report" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="sell-item" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="price-change/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="confirm-sale/[id]" options={{ animation: 'fade' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BricolageGrotesque_800ExtraBold,
    Chango_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });
  const ready = loaded || !!error;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SessionProvider>
      <ThemedStack />
    </SessionProvider>
  );
}
