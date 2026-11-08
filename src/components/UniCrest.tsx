import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { University } from '@/theme/universities';

// Simplified redraws of the Figma campus badges. Replace with the exported
// badge artwork (SVG) once it can be pulled from the file.

const SHIELD = 'M30 4L54 11V32C54 48 44 59 30 65C16 59 6 48 6 32V11Z';
const INK = '#160E33';

function Emblem({ id, theme }: { id: string; theme: University['theme'] }) {
  switch (id) {
    case 'tukse': // elephant on blue, yellow and red
      return (
        <G>
          <Path d="M8 22H52V32C52 47 43 57 30 62C17 57 8 47 8 32Z" fill={theme.accent} />
          <Path d="M8 22H30V60C17 55 8 46 8 32Z" fill={theme.highlight} />
          <Path d="M30 22H52V32C52 45 45 54 30 60Z" fill={theme.third} />
          <Ellipse cx={19} cy={37} rx={8} ry={10} fill="#E4E7F0" stroke={INK} strokeWidth={1.5} />
          <Ellipse cx={41} cy={37} rx={8} ry={10} fill="#E4E7F0" stroke={INK} strokeWidth={1.5} />
          <Circle cx={30} cy={36} r={9} fill="#F4F5FA" stroke={INK} strokeWidth={1.5} />
          <Path d="M30 42C30 49 27 52 24 52" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
          <Path d="M30 42C30 49 27 52 24 52" fill="none" stroke="#F4F5FA" strokeWidth={1.4} strokeLinecap="round" />
          <Circle cx={26.5} cy={34} r={1.3} fill={INK} />
          <Circle cx={33.5} cy={34} r={1.3} fill={INK} />
        </G>
      );
    case 'wytu': // gear around a sun
      return (
        <G>
          {Array.from({ length: 8 }, (_, tooth) => (
            <Rect key={tooth} x={27.5} y={24} width={5} height={7} rx={1} fill={theme.highlight} stroke={INK} strokeWidth={1.2} transform={`rotate(${tooth * 45} 30 39)`} />
          ))}
          <Circle cx={30} cy={39} r={11} fill={theme.highlight} stroke={INK} strokeWidth={1.5} />
          <Circle cx={30} cy={39} r={6} fill="#FFD23F" stroke={INK} strokeWidth={1.2} />
          <Path d="M17 54Q30 60 43 54" fill="none" stroke={theme.third} strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case 'utycc': // sun over green hills
      return (
        <G>
          <Circle cx={30} cy={36} r={9} fill="#FFD23F" stroke={INK} strokeWidth={1.4} />
          <Circle cx={27} cy={35} r={1.1} fill={INK} />
          <Circle cx={33} cy={35} r={1.1} fill={INK} />
          <Path d="M27 39Q30 41.5 33 39" fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
          <Path d="M9 50Q19 41 30 48Q41 41 51 50V52C46 57 39 61 30 64C21 61 14 57 9 52Z" fill={theme.highlight} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        </G>
      );
    case 'miit': // globe
      return (
        <G>
          <Circle cx={30} cy={41} r={13} fill={theme.third} stroke={INK} strokeWidth={1.5} />
          <Ellipse cx={30} cy={41} rx={6} ry={13} fill="none" stroke="#fff" strokeWidth={1.2} />
          <Path d="M17 41H43M19 34H41M19 48H41" stroke="#fff" strokeWidth={1.2} />
          <Path d="M24 32Q28 36 25 41Q31 44 34 50" fill="none" stroke={theme.highlight} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case 'sfu': // torch
      return (
        <G>
          <Path d="M30 26C36 32 37 37 33 42C35 38 32 35 30 34C29 38 25 39 27 43C22 39 24 32 30 26Z" fill={theme.third} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M22 43H38L35 47H25Z" fill="#E9E4DE" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
          <Rect x={27.5} y={47} width={5} height={12} rx={1.5} fill="#E9E4DE" stroke={INK} strokeWidth={1.2} />
        </G>
      );
    default:
      return null;
  }
}

type Props = {
  university: University;
  size?: number;
  /** Adds a white rim so the badge reads on a coloured header. */
  rim?: boolean;
};

/** The campus badge: shield, name banner and emblem, in the campus colours. */
export function UniCrest({ university, size = 44, rim = false }: Props) {
  const { theme, short } = university;
  const fontSize = short.length >= 5 ? 7.5 : 9;
  // SFU's shield is black, the rest use the campus primary.
  const shield = theme.accent;

  return (
    <Svg width={size} height={(size * 68) / 60} viewBox="0 0 60 68" accessibilityLabel={`${university.name} badge`}>
      <Path d={SHIELD} fill={shield} stroke={rim ? '#fff' : INK} strokeWidth={rim ? 3.5 : 2} strokeLinejoin="round" />
      <Emblem id={university.id} theme={theme} />
      <Path d={SHIELD} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={10} y={10} width={40} height={11} rx={3} fill={theme.highlight} stroke={INK} strokeWidth={1.6} />
      <SvgText x={30} y={18.4} fontSize={fontSize} fontFamily="Figtree_700Bold" fontWeight="700" fill={INK} textAnchor="middle">
        {short}
      </SvgText>
    </Svg>
  );
}
