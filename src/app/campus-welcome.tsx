import { router, useLocalSearchParams, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { SparkleIcon } from '@/components/Icons';
import { AnimatedLoopMark } from '@/components/LoopMark';
import { PosterText } from '@/components/PosterText';
import { UniCrest } from '@/components/UniCrest';
import { easeOut, overshoot, segment } from '@/lib/motion';
import { useTheme } from '@/theme/ThemeProvider';

// One timeline, in milliseconds, using the same motion as the startup splash:
// the badge fades and rises in, then the CampusLoop loop draws itself and its
// cap drops on, then the words follow. No springs or bouncing.
const BADGE_END = 600;
const LOOP_START = 450;
const LOOP_END = LOOP_START + 800;
const CAP_END = LOOP_END + 300;
const WORDMARK_END = CAP_END + 150;
const SPARKLES_END = WORDMARK_END + 200;
const WELCOME_END = SPARKLES_END + 300;
/** Time to read the finished frame before moving on. */
const HOLD_MS = 1100;

function riseStyle(time: number, start: number, end: number) {
  'worklet';
  const progress = easeOut(segment(time, start, end));
  return { opacity: progress, transform: [{ translateY: (1 - progress) * 14 }] };
}

/**
 * "Splash · <campus>" from the University themes board: shown after log in or
 * sign-up, in the student's campus colours, then on to the market.
 */
export default function CampusWelcomeRoute() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const insets = useSafeAreaInsets();
  const { theme, university } = useTheme();
  const reducedMotion = useReducedMotion();
  const time = useSharedValue(0);
  const destination = (next ?? '/market') as Href;

  useEffect(() => {
    time.set(reducedMotion ? WELCOME_END : withTiming(WELCOME_END, { duration: WELCOME_END, easing: Easing.linear }));
    const timer = setTimeout(() => router.replace(destination), (reducedMotion ? 0 : WELCOME_END) + HOLD_MS);
    return () => clearTimeout(timer);
  }, [destination, reducedMotion, time]);

  const badgeStyle = useAnimatedStyle(() => riseStyle(time.get(), 0, BADGE_END));
  const loop = useDerivedValue(() => easeOut(segment(time.get(), LOOP_START, LOOP_END)));
  // The cap's small settle is the main logo's own drop, kept as it is.
  const cap = useDerivedValue(() => overshoot(segment(time.get(), LOOP_END - 100, CAP_END)));
  const wordmarkStyle = useAnimatedStyle(() => riseStyle(time.get(), CAP_END - 150, WORDMARK_END));
  const sparkleStyle = useAnimatedStyle(() => ({ opacity: easeOut(segment(time.get(), WORDMARK_END - 100, SPARKLES_END)) }));
  const welcomeStyle = useAnimatedStyle(() => riseStyle(time.get(), SPARKLES_END - 100, WELCOME_END));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue to the market"
      onPress={() => router.replace(destination)}
      className="flex-1 items-center justify-center px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="light" />
      <BrandBackground />

      {university && (
        <Animated.View style={badgeStyle}>
          <UniCrest university={university} size={128} rim />
          <Animated.View style={[{ position: 'absolute', right: -44, top: 6 }, sparkleStyle]}>
            <SparkleIcon size={26} color={theme.highlight} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', left: -40, bottom: 18 }, sparkleStyle]}>
            <SparkleIcon size={16} color={theme.highlight} />
          </Animated.View>
        </Animated.View>
      )}

      <View className="mt-10 items-center">
        <AnimatedLoopMark width={110} loop={loop} cap={cap} />
        <Animated.View style={wordmarkStyle}>
          <Text className="mt-1 font-heading text-[28px] text-white">CampusLoop</Text>
        </Animated.View>
      </View>

      <Animated.View style={welcomeStyle} className="mt-10 items-center">
        <PosterText lines={[university ? `Welcome, ${university.short}!` : 'Welcome!']} size={24} color={theme.highlight} />
        <Text className="mt-3 text-center font-body text-[14px] text-white/85">
          Your campus market · {university?.name ?? 'CampusLoop'}
        </Text>
      </Animated.View>

      <View className="absolute" style={{ bottom: insets.bottom + 28 }}>
        <Text className="font-body text-[12.5px] text-white/60">Tap to continue</Text>
      </View>
    </Pressable>
  );
}
