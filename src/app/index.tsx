import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { DEAL_SCENE_END, DealScene } from '@/components/DealScene';
import { SparkleIcon } from '@/components/Icons';
import { AnimatedLoopMark } from '@/components/LoopMark';
import { PosterText } from '@/components/PosterText';
import { UniCrest } from '@/components/UniCrest';
import { easeOut, overshoot, segment } from '@/lib/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { UNIVERSITIES, type University } from '@/theme/universities';

// Sequence, in milliseconds on one timeline: the deal plays out first, then the
// CampusLoop mark draws itself, then each campus crest pops in under it.
const LOOP_START = DEAL_SCENE_END - 50;
const LOOP_END = LOOP_START + 800;
const CAP_END = LOOP_END + 300;
const WORDMARK_END = CAP_END + 150;
const SPARKLES_END = WORDMARK_END + 200;
const CRESTS_START = SPARKLES_END - 50;
const CREST_STAGGER = 110;
const CREST_DURATION = 320;
const CRESTS_END = CRESTS_START + CREST_STAGGER * (UNIVERSITIES.length - 1) + CREST_DURATION;
const TAGLINE_END = CRESTS_END + 250;
/** Time to read the finished frame before moving on. */
const HOLD_MS = 1300;

const DOT_COUNT = 3;

function CrestPop({ time, index, university }: { time: SharedValue<number>; index: number; university: University }) {
  const style = useAnimatedStyle(() => {
    const start = CRESTS_START + index * CREST_STAGGER;
    const progress = segment(time.get(), start, start + CREST_DURATION);
    // Same ease-out fade-and-rise as the wordmark: no overshoot, no bounce.
    const eased = easeOut(progress);
    return { opacity: eased, transform: [{ translateY: (1 - eased) * 14 }] };
  });
  return (
    <Animated.View style={style}>
      <UniCrest university={university} size={40} rim />
    </Animated.View>
  );
}

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const time = useSharedValue(0);
  const total = TAGLINE_END + HOLD_MS;
  const [activeDot, setActiveDot] = useState(0);

  const finish = () => router.replace('/welcome');

  useEffect(() => {
    time.set(reducedMotion ? TAGLINE_END : withTiming(TAGLINE_END, { duration: TAGLINE_END, easing: Easing.linear }));
    const duration = reducedMotion ? 1800 : total;
    const step = setInterval(() => setActiveDot((dot) => Math.min(DOT_COUNT - 1, dot + 1)), duration / DOT_COUNT);
    const done = setTimeout(() => router.replace('/welcome'), duration);
    return () => {
      clearInterval(step);
      clearTimeout(done);
    };
  }, [reducedMotion, time, total]);

  const loop = useDerivedValue(() => easeOut(segment(time.get(), LOOP_START, LOOP_END)));
  const cap = useDerivedValue(() => overshoot(segment(time.get(), LOOP_END - 100, CAP_END)));
  const wordmarkStyle = useAnimatedStyle(() => {
    const progress = easeOut(segment(time.get(), CAP_END - 150, WORDMARK_END));
    return { opacity: progress, transform: [{ translateY: (1 - progress) * 14 }] };
  });
  const sparkleStyle = useAnimatedStyle(() => {
    const progress = segment(time.get(), WORDMARK_END - 100, SPARKLES_END);
    return { opacity: Math.min(1, progress * 3), transform: [{ scale: overshoot(progress) }] };
  });
  const crestLabelStyle = useAnimatedStyle(() => ({
    opacity: segment(time.get(), CRESTS_START - 100, CRESTS_START + 200),
  }));
  const taglineStyle = useAnimatedStyle(() => {
    const progress = segment(time.get(), CRESTS_END - 100, TAGLINE_END);
    return { opacity: Math.min(1, progress * 3), transform: [{ scale: overshoot(progress) }] };
  });

  return (
    <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="light" />
      <BrandBackground />

      <View className="absolute inset-0 items-center justify-center">
        <DealScene time={time} />
      </View>

      <View className="items-center">
        <View>
          <AnimatedLoopMark width={172} loop={loop} cap={cap} />
          <Animated.View style={[{ position: 'absolute', right: -64, top: -18 }, sparkleStyle]}>
            <SparkleIcon size={30} color={theme.highlight} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', left: -70, bottom: -40 }, sparkleStyle]}>
            <SparkleIcon size={20} color={theme.highlight} />
          </Animated.View>
        </View>

        <Animated.View style={wordmarkStyle}>
          <Text className="mt-2 font-heading text-[36px] text-white">CampusLoop</Text>
        </Animated.View>

        <Animated.View style={[{ marginTop: 36 }, crestLabelStyle]}>
          <Text className="text-center font-body-bold text-[12px] tracking-[1.6px] text-white/70">LIVE ON YOUR CAMPUS</Text>
        </Animated.View>
        <View
          accessible
          accessibilityLabel={`Available at ${UNIVERSITIES.map((university) => university.short).join(', ')}`}
          className="mt-3 flex-row gap-2.5"
        >
          {UNIVERSITIES.map((university, index) => (
            <CrestPop key={university.id} time={time} index={index} university={university} />
          ))}
        </View>

        <Animated.View style={[{ marginTop: 40 }, taglineStyle]}>
          <PosterText lines={['Buy it. Sell it.', 'Loop it.']} size={24} color={theme.highlight} />
        </Animated.View>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute flex-row items-center"
        style={{ bottom: insets.bottom + 56 }}
      >
        {Array.from({ length: DOT_COUNT }, (_, dot) => (
          <View key={dot} className={`mx-1 h-1.5 w-1.5 rounded-full ${dot <= activeDot ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={finish}
        hitSlop={12}
        className="absolute right-5 rounded-full bg-white/15 px-4 py-2 active:opacity-70"
        style={{ top: insets.top + 12 }}
      >
        <Text className="font-body-semibold text-[14px] text-white">Skip</Text>
      </Pressable>
    </View>
  );
}
