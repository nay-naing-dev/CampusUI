import type { ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { SparkleIcon } from '@/components/Icons';
import { DealBook, DealCash, SpeechBubble, StudentFigure } from '@/components/Illustrations';
import { easeOut, overshoot, segment } from '@/lib/motion';
import { useTheme } from '@/theme/ThemeProvider';

// All in milliseconds on the splash screen's timeline.
const WALK_END = 600;
const OFFER = [650, 950] as const;
const ACCEPT = [1050, 1350] as const;
const SWAP = [1400, 1800] as const;
const CELEBRATE = [1750, 2050] as const;
const EXIT = [2050, 2350] as const;

const SCENE_MAX_WIDTH = 340;
const SCENE_HEIGHT = 300;
const STUDENT_WIDTH = 130;
const STUDENT_HEIGHT = STUDENT_WIDTH * 2;
/** Distance from a student's outer edge to the hand they reach out with. */
const HAND_INSET = 123;
const HAND_TOP = SCENE_HEIGHT - STUDENT_HEIGHT + 102;

// These take `time` as a number: Reanimated only tracks shared values read directly
// inside useAnimatedStyle, so one read in a nested helper would never update.
function walkStyle(time: number, startX: number) {
  'worklet';
  const progress = segment(time, 0, WALK_END);
  const steps = Math.abs(Math.sin(progress * Math.PI * 3)) * 8 * (1 - progress);
  const celebrate = Math.sin(segment(time, CELEBRATE[0], CELEBRATE[1]) * Math.PI) * 12;
  return { transform: [{ translateX: startX * (1 - easeOut(progress)) }, { translateY: -steps - celebrate }] };
}

function swapStyle(time: number, distance: number) {
  'worklet';
  const progress = easeOut(segment(time, SWAP[0], SWAP[1]));
  return {
    opacity: segment(time, WALK_END - 100, WALK_END + 50),
    transform: [{ translateX: distance * (progress - 0.5) }, { translateY: -Math.sin(progress * Math.PI) * 26 }],
  };
}

type PopProps = {
  time: SharedValue<number>;
  range: readonly [number, number];
  style: object;
  children: ReactNode;
};

function Pop({ time, range, style, children }: PopProps) {
  const animated = useAnimatedStyle(() => {
    const progress = segment(time.get(), range[0], range[1]);
    return { opacity: Math.min(1, progress * 3), transform: [{ scale: overshoot(progress) }] };
  });
  return <Animated.View style={[{ position: 'absolute' }, style, animated]}>{children}</Animated.View>;
}

/** Two students walk in, agree a price and swap a book for cash. */
export function DealScene({ time }: { time: SharedValue<number> }) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const sceneWidth = Math.min(SCENE_MAX_WIDTH, width - 32);
  const offstage = sceneWidth / 2 + STUDENT_WIDTH;
  const swapDistance = sceneWidth - 2 * HAND_INSET;

  const sceneStyle = useAnimatedStyle(() => {
    const leaving = easeOut(segment(time.get(), EXIT[0], EXIT[1]));
    return { opacity: 1 - leaving, transform: [{ scale: 1 - leaving * 0.15 }] };
  });

  const leftStudent = useAnimatedStyle(() => walkStyle(time.get(), -offstage));
  const rightStudent = useAnimatedStyle(() => walkStyle(time.get(), offstage));
  const bookStyle = useAnimatedStyle(() => swapStyle(time.get(), swapDistance));
  const cashStyle = useAnimatedStyle(() => swapStyle(time.get(), -swapDistance));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: sceneWidth, height: SCENE_HEIGHT }, sceneStyle]}
    >
      <Animated.View style={[{ position: 'absolute', left: 0, bottom: 0 }, leftStudent]}>
        <StudentFigure width={STUDENT_WIDTH} hair="long" bag="sling" rightArm="reach" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', right: 0, bottom: 0 }, rightStudent]}>
        <StudentFigure width={STUDENT_WIDTH} hair="spiky" bag="backpack" leftArm="reach" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', left: sceneWidth / 2 - 16, top: HAND_TOP - 30 }, bookStyle]}>
        <DealBook width={32} />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: sceneWidth / 2 - 18, top: HAND_TOP - 2 }, cashStyle]}>
        <DealCash width={36} />
      </Animated.View>

      <Pop time={time} range={OFFER} style={{ left: 36, top: -8 }}>
        <SpeechBubble width={94} label="$12?" tail="left" />
      </Pop>
      <Pop time={time} range={ACCEPT} style={{ right: 36, top: -8 }}>
        <SpeechBubble width={94} label="Deal!" tail="right" />
      </Pop>
      <Pop time={time} range={CELEBRATE} style={{ left: sceneWidth / 2 - 18, top: HAND_TOP - 66 }}>
        <SparkleIcon size={36} color={theme.highlight} />
      </Pop>
    </Animated.View>
  );
}

/** When the deal has faded out and the logo can start. */
export const DEAL_SCENE_END = EXIT[1];
