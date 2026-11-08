import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

const WOBBLE = [-5, 3, -2, 4, -4, 2, 5, -3];
const OUTLINE_STEPS = 16;

type Props = {
  lines: string[];
  size: number;
  /** Rotates each letter a little, for hand-lettered headlines. */
  wobble?: boolean;
  tilt?: number;
  color?: string;
};

type RowProps = {
  line: string;
  size: number;
  wobble: boolean;
  color: string;
  offset?: { x: number; y: number };
};

function LetterRow({ line, size, wobble, color, offset }: RowProps) {
  return (
    <View
      className="flex-row"
      style={offset ? { position: 'absolute', left: offset.x, top: offset.y } : undefined}
    >
      {line.split('').map((char, index) => (
        <Text
          key={index}
          className="font-display"
          style={{
            color,
            fontSize: size,
            lineHeight: size * 1.3,
            includeFontPadding: false,
            transform: wobble ? [{ rotate: `${WOBBLE[index % WOBBLE.length]}deg` }] : undefined,
          }}
        >
          {char}
        </Text>
      ))}
    </View>
  );
}

/**
 * Lettering with a white sticker outline and a soft drop shadow. React Native has
 * no text stroke, so the outline is built from offset copies behind the fill.
 */
export function PosterText({ lines, size, wobble = false, tilt = 0, color }: Props) {
  const { theme } = useTheme();
  const fill = color ?? theme.accent;
  const radius = size * 0.15;
  const outline = Array.from({ length: OUTLINE_STEPS }, (_, step) => {
    const angle = (step / OUTLINE_STEPS) * Math.PI * 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={lines.join(' ')}
      className="items-center"
      style={{ transform: [{ rotate: `${tilt}deg` }] }}
    >
      {lines.map((line) => (
        <View key={line} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <LetterRow
            line={line}
            size={size}
            wobble={wobble}
            color="rgba(22,14,51,0.35)"
            offset={{ x: 0, y: radius + size * 0.08 }}
          />
          {outline.map((offset, step) => (
            <LetterRow key={step} line={line} size={size} wobble={wobble} color="#fff" offset={offset} />
          ))}
          <LetterRow line={line} size={size} wobble={wobble} color={fill} />
        </View>
      ))}
    </View>
  );
}
