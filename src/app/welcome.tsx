import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { Button, TextLink } from '@/components/Controls';
import { SparkleIcon } from '@/components/Icons';
import { TradingTable } from '@/components/Illustrations';
import { LoopMark } from '@/components/LoopMark';
import { PosterText } from '@/components/PosterText';
import { UniCrest } from '@/components/UniCrest';
import { notBuiltYet } from '@/lib/placeholder';
import { useSession } from '@/state/session';
import { useTheme } from '@/theme/ThemeProvider';
import { UNIVERSITIES } from '@/theme/universities';

export default function WelcomeRoute() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { continueAsGuest } = useSession();
  // Keep the sheet's buttons on screen on shorter phones.
  const cardWidth = Math.min(width - 32, (height * 0.34 * 740) / 600);

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="light" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="items-center pb-14" style={{ paddingTop: insets.top + 8 }}>
          <BrandBackground />
          <PosterText lines={['PASS IT ON!']} size={34} wobble tilt={-2} />
          <View>
            <View
              className="mt-3 overflow-hidden rounded-[28px] bg-cream"
              style={{ transform: [{ rotate: '-1deg' }], boxShadow: '0 14px 30px rgba(22,14,51,0.3)' }}
            >
              <TradingTable width={cardWidth} />
            </View>
            <View className="absolute -right-2 -top-4">
              <SparkleIcon size={28} color={theme.highlight} />
            </View>
            <View
              className="absolute -bottom-3 right-1 h-[72px] w-[72px] items-center justify-center rounded-full bg-white"
              style={{ boxShadow: '0 8px 18px rgba(22,14,51,0.22)' }}
            >
              <LoopMark width={52} color={theme.brand} />
            </View>
          </View>
        </View>

        <View className="-mt-9 flex-1 rounded-t-[36px] bg-surface px-7 pt-8" style={{ paddingBottom: insets.bottom + 20 }}>
          <Text className="font-body-bold text-[13px] tracking-[1.6px] text-loop">WELCOME TO CAMPUSLOOP</Text>
          <Text accessibilityRole="header" className="mt-2 font-heading text-[28px] leading-[34px] text-ink">
            Buy it. Sell it. Loop it.
          </Text>

          <View className="mt-4 flex-row items-center">
            <View className="flex-row">
              {UNIVERSITIES.slice(0, 5).map((university, index) => (
                <View key={university.id} style={{ marginLeft: index === 0 ? 0 : -8 }}>
                  <UniCrest university={university} size={26} rim />
                </View>
              ))}
            </View>
            <Text className="ml-2.5 flex-1 font-body text-[13.5px] text-muted">
              {UNIVERSITIES.length} campuses · sign up with your Gmail
            </Text>
          </View>

          <View className="mt-8 gap-3">
            <Button label="Log in" onPress={() => router.push('/login')} />
            <Button label="Sign up" variant="dark" onPress={() => router.push('/signup')} />
          </View>

          <Text className="mt-5 text-center font-body text-[14.5px] text-muted">
            Campus not listed?{' '}
            <TextLink label="Request your university" onPress={() => notBuiltYet('Request your university')} />
          </Text>
          <TextLink
            label="Browse as guest"
            className="mt-4 text-center text-[14.5px]"
            onPress={() => {
              continueAsGuest();
              router.replace('/market');
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
