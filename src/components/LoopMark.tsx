import { View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import colors from '@/theme/colors';

const VIEW_BOX = '0 -14 200 126';
const ASPECT = 126 / 200;
const LOOP = 'M100 62C118 36 134 26 152 26C174 26 188 42 188 62C188 82 174 98 152 98C134 98 118 88 100 62C82 36 66 26 48 26C26 26 12 42 12 62C12 82 26 98 48 98C66 98 82 88 100 62Z';
const LOOP_LENGTH = 492;
const LOOP_WIDTH = 22;

const AnimatedPath = Animated.createAnimatedComponent(Path);

function Cap({ color, outline }: { color: string; outline: string }) {
  return (
    <G transform="translate(56 14) rotate(-14)" stroke={outline} strokeWidth={3} strokeLinejoin="round">
      <Path d="M-16 5V15C-8 23 8 23 16 15V5L0 12Z" fill={color} />
      <Path d="M-30 -4L0 -17L30 -4L0 9Z" fill={color} />
      <Path d="M24 -2V13" fill="none" strokeLinecap="round" />
      <Circle cx={24} cy={16} r={3.5} fill={color} />
    </G>
  );
}

type Props = {
  width: number;
  color?: string;
  outline?: string;
};

/** The mark's shapes alone, for placing inside another Svg. Covers x 0-200, y -14 to 112. */
export function LoopMarkShape({ color = '#fff', outline = colors.ink }: Omit<Props, 'width'>) {
  return (
    <G>
      <Path d={LOOP} fill="none" stroke={color} strokeWidth={LOOP_WIDTH} strokeLinejoin="round" />
      <Cap color={color} outline={outline} />
    </G>
  );
}

/** The CampusLoop mark: a graduation cap on an infinity loop. */
export function LoopMark({ width, color, outline }: Props) {
  return (
    <Svg width={width} height={width * ASPECT} viewBox={VIEW_BOX} fill="none">
      <LoopMarkShape color={color} outline={outline} />
    </Svg>
  );
}

type AnimatedProps = Props & {
  /** 0 to 1: how much of the loop has been drawn. */
  loop: SharedValue<number>;
  /** 0 to 1: the cap dropping onto the loop. It may run past 1 to bounce. */
  cap: SharedValue<number>;
};

/** The same mark, drawing its loop and then dropping its cap on. */
export function AnimatedLoopMark({ width, color = '#fff', outline = colors.ink, loop, cap }: AnimatedProps) {
  const loopProps = useAnimatedProps(() => ({ strokeDashoffset: LOOP_LENGTH * (1 - loop.get()) }));
  const loopStyle = useAnimatedStyle(() => ({ opacity: loop.get() > 0 ? 1 : 0 }));
  const capStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, cap.get() * 3),
    transform: [{ translateY: (cap.get() - 1) * width * 0.3 }],
  }));

  return (
    <View style={{ width, height: width * ASPECT }}>
      <Animated.View style={loopStyle}>
        <Svg width={width} height={width * ASPECT} viewBox={VIEW_BOX} fill="none">
          <AnimatedPath
            d={LOOP}
            stroke={color}
            strokeWidth={LOOP_WIDTH}
            strokeLinecap="round"
            strokeDasharray={[LOOP_LENGTH, LOOP_LENGTH]}
            animatedProps={loopProps}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, capStyle]}>
        <Svg width={width} height={width * ASPECT} viewBox={VIEW_BOX} fill="none">
          <Cap color={color} outline={outline} />
        </Svg>
      </Animated.View>
    </View>
  );
}
