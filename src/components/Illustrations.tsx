import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import colors from '@/theme/colors';
import { LoopMarkShape } from '@/components/LoopMark';
import { DEFAULT_THEME } from '@/theme/universities';

const INK = colors.ink;
const STROKE = 6;
// Artwork keeps fixed colours; only the app chrome follows the campus theme.
const PINK = '#C9287C';
const SUN = '#FFC94A';
const BLUE = '#2F4FA8';
const NAVY = '#232C5C';
const TAN = '#D8C9B0';
const SKIN = '#FFFDF9';

const STUDENT_WIDTH = 160;
const STUDENT_HEIGHT = 320;

type StrokeProps = { d: string; fill?: string; width?: number; color?: string };

function Stroke({ d, fill = 'none', width = STROKE, color = INK }: StrokeProps) {
  return <Path d={d} fill={fill} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}

function Face({ x, y, r = 30 }: { x: number; y: number; r?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${r / 30})`}>
      <Circle r={30} fill={SKIN} stroke={INK} strokeWidth={STROKE} />
      <Circle cx={-11} cy={-1} r={3.6} fill={INK} />
      <Circle cx={11} cy={-1} r={3.6} fill={INK} />
      <Circle cx={-21} cy={9} r={5.5} fill="#F2A7C3" />
      <Circle cx={21} cy={9} r={5.5} fill="#F2A7C3" />
      <Path d="M-10 9Q0 20 10 9" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </G>
  );
}

function ShortHair({ x, y }: { x: number; y: number }) {
  return (
    <Path
      d={`M${x - 28} ${y - 8}C${x - 30} ${y - 40} ${x + 28} ${y - 42} ${x + 29} ${y - 8}C${x + 14} ${y - 22} ${x - 12} ${y - 24} ${x - 28} ${y - 8}Z`}
      fill={INK}
    />
  );
}

function SpikyHair({ x, y }: { x: number; y: number }) {
  return (
    <Path
      d={`M${x - 29} ${y - 6}L${x - 30} ${y - 24}L${x - 19} ${y - 22}L${x - 18} ${y - 38}L${x - 6} ${y - 30}L${x} ${y - 44}L${x + 8} ${y - 31}L${x + 19} ${y - 38}L${x + 20} ${y - 22}L${x + 31} ${y - 24}L${x + 29} ${y - 6}C${x + 14} ${y - 20} ${x - 12} ${y - 22} ${x - 29} ${y - 6}Z`}
      fill={INK}
    />
  );
}

function LongHairBack({ x, y }: { x: number; y: number }) {
  return (
    <Path
      d={`M${x - 34} ${y + 44}C${x - 44} ${y - 44} ${x + 44} ${y - 44} ${x + 34} ${y + 44}Z`}
      fill={INK}
    />
  );
}

function Hand({ x, y }: { x: number; y: number }) {
  return <Circle cx={x} cy={y} r={7} fill={SKIN} stroke={INK} strokeWidth={5} />;
}

type BubbleProps = { x: number; y: number; w: number; h: number; tailX: number; label: string };

function Bubble({ x, y, w, h, tailX, label }: BubbleProps) {
  const bottom = y + h;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} rx={16} fill="#fff" stroke={INK} strokeWidth={5} />
      <Path
        d={`M${tailX} ${bottom - 2}L${tailX - 8} ${bottom + 20}L${tailX + 22} ${bottom - 2}`}
        fill="#fff"
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <SvgText x={x + w / 2} y={y + h / 2 + 8} fontSize={23} fontFamily="Figtree_700Bold" fill={INK} textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}

function ShirtButtons({ x, y }: { x: number; y: number }) {
  return (
    <G>
      {[0, 18, 36, 54].map((offset) => (
        <Line key={offset} x1={x} y1={y + offset} x2={x} y2={y + offset + 8} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      ))}
    </G>
  );
}

type ArmPose = 'wave' | 'down' | 'reach';

const ARMS: Record<ArmPose, { curve: number[]; hand: [number, number] }> = {
  wave: { curve: [58, 100, 44, 88, 34, 64, 30, 42], hand: [30, 36] },
  down: { curve: [56, 100, 44, 128, 42, 152, 44, 176], hand: [44, 180] },
  reach: { curve: [56, 100, 44, 122, 28, 132, 10, 126], hand: [8, 126] },
};

function Arm({ pose, side }: { pose: ArmPose; side: 'left' | 'right' }) {
  const { curve, hand } = ARMS[pose];
  const flipX = (x: number) => (side === 'left' ? x : STUDENT_WIDTH - x);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = curve;
  return (
    <G>
      <Stroke d={`M${flipX(x0)} ${y0}C${flipX(x1)} ${y1} ${flipX(x2)} ${y2} ${flipX(x3)} ${y3}`} />
      <Hand x={flipX(hand[0])} y={hand[1]} />
    </G>
  );
}

export type StudentLook = {
  hair: 'short' | 'spiky' | 'long' | 'bun';
  top?: 'shirt' | 'sleeveless' | 'suit';
  skirt?: string;
  leftArm?: ArmPose;
  rightArm?: ArmPose;
  bag?: 'backpack' | 'sling';
  glasses?: boolean;
};

/** A student in uni uniform, drawn in a 160 x 320 box. Place inside an Svg with `x`, `y` and `scale`. */
function Student({
  x = 0,
  y = 0,
  scale = 1,
  hair,
  top = 'shirt',
  skirt = BLUE,
  leftArm = 'down',
  rightArm = 'down',
  bag,
  glasses = false,
}: StudentLook & { x?: number; y?: number; scale?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      {bag === 'backpack' && <Rect x={32} y={94} width={30} height={72} rx={12} fill={PINK} stroke={INK} strokeWidth={STROKE} />}
      {hair === 'long' && <LongHairBack x={80} y={52} />}

      <Stroke d="M66 276V306H50M94 276V306H110" />
      <Path d="M52 176L108 176L114 276L46 276Z" fill={skirt} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <Stroke d="M68 186L62 268" color="rgba(255,255,255,0.35)" width={4} />
      <Stroke d="M58 88L102 88L108 178L52 178Z" fill={top === 'suit' ? NAVY : '#fff'} />
      {top === 'shirt' && <ShirtButtons x={80} y={108} />}
      {top === 'suit' && (
        <G>
          <Path d="M68 90L92 90L80 120Z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <Path d="M76 100H84L86 128L80 138L74 128Z" fill={PINK} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </G>
      )}
      {bag === 'sling' && (
        <G>
          <Stroke d="M62 90L104 150" width={4} />
          <Rect x={92} y={146} width={30} height={24} rx={6} fill={SUN} stroke={INK} strokeWidth={5} />
        </G>
      )}

      <Arm pose={leftArm} side="left" />
      <Arm pose={rightArm} side="right" />

      {hair === 'bun' && <Circle cx={80} cy={14} r={12} fill={INK} />}
      <Face x={80} y={52} r={28} />
      {hair === 'spiky' ? <SpikyHair x={80} y={50} /> : <ShortHair x={80} y={50} />}
      {glasses && (
        <G fill="none" stroke={INK} strokeWidth={3}>
          <Circle cx={69} cy={51} r={9} />
          <Circle cx={91} cy={51} r={9} />
          <Line x1={78} y1={51} x2={82} y2={51} />
        </G>
      )}
    </G>
  );
}

/** One student as a standalone drawing. Height follows from `width`. */
export function StudentFigure({ width, ...look }: StudentLook & { width: number }) {
  return (
    <Svg width={width} height={(width * STUDENT_HEIGHT) / STUDENT_WIDTH} viewBox={`0 0 ${STUDENT_WIDTH} ${STUDENT_HEIGHT}`}>
      <Student {...look} />
    </Svg>
  );
}

/** Five students trading around a table. viewBox is 740 x 600. */
export function TradingTable({ width }: { width: number }) {
  return (
    <Svg width={width} height={(width * 600) / 740} viewBox="0 0 740 600">
      <Path d="M16 556C200 520 560 545 738 526V575C500 600 200 600 16 575Z" fill="#EEEBE7" />

      <Bubble x={36} y={24} w={106} h={50} tailX={66} label="$12?" />
      <Bubble x={594} y={24} w={118} h={52} tailX={636} label="Deal!" />
      <G transform="translate(322 18) scale(0.48)">
        <LoopMarkShape color={DEFAULT_THEME.brand} />
      </G>

      {/* Behind the table */}
      <Student x={168} y={158} scale={1.05} hair="short" glasses rightArm="reach" />
      <Student x={286} y={126} scale={1.05} hair="bun" top="suit" skirt={NAVY} />
      <Student x={404} y={158} scale={1.05} hair="spiky" leftArm="reach" />

      {/* Table */}
      <Path d="M130 395V495Q370 540 610 495V395Z" fill="#E8DAC9" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <Stroke d="M208 425L203 518" color={TAN} width={4} />
      <Stroke d="M375 428L378 528" color={TAN} width={4} />
      <Stroke d="M540 415L550 505" color={TAN} width={4} />
      <Ellipse cx={370} cy={386} rx={242} ry={32} fill="#F3E6D3" stroke={INK} strokeWidth={STROKE} />

      {/* On the table */}
      <Path d="M265 382L312 362L360 381L312 398Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <Path d="M274 382L312 366L312 392Z" fill={PINK} />
      <Stroke d="M312 362V398" width={4} />
      <G transform="rotate(9 410 353)">
        <Rect x={391} y={322} width={40} height={62} rx={8} fill={INK} />
        <Rect x={396} y={329} width={30} height={46} rx={3} fill="#FFF4E4" />
        <Rect x={401} y={333} width={20} height={16} rx={2} fill="#F7CFA0" />
        <Rect x={401} y={354} width={20} height={4} rx={2} fill={PINK} />
        <Rect x={401} y={362} width={13} height={4} rx={2} fill={PINK} />
      </G>
      <G transform="rotate(-10 510 368)">
        <Rect x={484} y={354} width={52} height={30} rx={5} fill="#fff" stroke={INK} strokeWidth={5} />
        <Circle cx={510} cy={369} r={7} fill="none" stroke="#2EA36B" strokeWidth={4.5} />
      </G>

      {/* Either side of the table */}
      <Student x={0} y={136} scale={1.35} hair="long" bag="sling" rightArm="reach" />
      <Student x={524} y={136} scale={1.35} hair="long" glasses skirt={colors.mint.skirt} leftArm="reach" />
    </Svg>
  );
}

/** A plain curly-haired stickman with no uniform, waving. viewBox is 120 x 260. */
export function PlainStickman({ height }: { height: number }) {
  return (
    <Svg width={(height * 120) / 260} height={height} viewBox="0 0 120 260">
      <G>
        <Stroke d="M60 66V160" width={4} />
        <Stroke d="M60 160L38 254H26M60 160L84 254H96" width={4} />
        <Stroke d="M60 86L34 120L30 150" width={4} />
        <Stroke d="M60 86L92 66L100 24" width={4} />
        <Circle cx={101} cy={18} r={5} fill={SKIN} stroke={INK} strokeWidth={4} />
      </G>
      <Face x={60} y={42} r={24} />
      <G fill={INK}>
        <Circle cx={37} cy={32} r={9} />
        <Circle cx={43} cy={20} r={10} />
        <Circle cx={56} cy={14} r={10} />
        <Circle cx={69} cy={15} r={10} />
        <Circle cx={80} cy={23} r={9} />
        <Circle cx={84} cy={34} r={8} />
      </G>
    </Svg>
  );
}

/** Speech bubble for the startup deal. */
export function SpeechBubble({ width, label, tail }: { width: number; label: string; tail: 'left' | 'right' }) {
  return (
    <Svg width={width} height={(width * 82) / 124} viewBox="0 0 124 82">
      <Bubble x={4} y={4} w={116} h={52} tailX={tail === 'left' ? 26 : 74} label={label} />
    </Svg>
  );
}

/** The textbook passed across during the startup deal. */
export function DealBook({ width }: { width: number }) {
  return (
    <Svg width={width} height={width} viewBox="0 0 40 40">
      <Rect x={5} y={4} width={30} height={32} rx={4} fill={PINK} stroke={INK} strokeWidth={3.5} />
      <Path d="M12 4V36" stroke={INK} strokeWidth={3} />
      <Path d="M18 14H29M18 21H26" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

/** The cash passed back during the startup deal. */
export function DealCash({ width }: { width: number }) {
  return (
    <Svg width={width} height={(width * 28) / 44} viewBox="0 0 44 28">
      <Rect x={3} y={3} width={38} height={22} rx={4} fill="#fff" stroke={INK} strokeWidth={3.5} />
      <Circle cx={22} cy={14} r={5} fill="none" stroke="#2EA36B" strokeWidth={3} />
    </Svg>
  );
}

/** Waiting hourglass for the verification screen. viewBox is 120 x 170. */
export function Hourglass({ width }: { width: number }) {
  return (
    <Svg width={width} height={(width * 170) / 120} viewBox="0 0 120 170">
      <Ellipse cx={60} cy={158} rx={54} ry={8} fill="#CFC9DE" />
      <Path
        d="M26 16C26 56 56 62 56 75C56 88 26 94 26 134H94C94 94 64 88 64 75C64 62 94 56 94 16Z"
        fill="#FFFFFF"
        fillOpacity={0.7}
        stroke="#C9C3DC"
        strokeWidth={3}
      />
      <Path d="M44 36Q60 46 76 36Z" fill="#FFB547" />
      <Path d="M36 134Q60 100 84 134Z" fill="#FFB547" />
      <Rect x={14} y={6} width={92} height={13} rx={6.5} fill={SUN} />
      <Rect x={14} y={131} width={92} height={13} rx={6.5} fill={SUN} />
    </Svg>
  );
}

const MALE_LOOKS: StudentLook[] = [
  { hair: 'short' },
  { hair: 'spiky', bag: 'backpack' },
  { hair: 'short', glasses: true },
  { hair: 'short', glasses: true, bag: 'sling' },
  { hair: 'spiky', glasses: true },
  { hair: 'short', bag: 'backpack' },
];

const FEMALE_LOOKS: StudentLook[] = [
  { hair: 'long' },
  { hair: 'bun', bag: 'sling' },
  { hair: 'long', glasses: true },
  { hair: 'bun', glasses: true },
  { hair: 'long', bag: 'backpack' },
  { hair: 'bun' },
];

export const LOOK_COUNT = MALE_LOOKS.length;

/** A student's stickman look from their gender and "Shuffle my look" index. */
export function lookFor(person: { gender: 'male' | 'female'; look: number }): StudentLook {
  const looks = person.gender === 'female' ? FEMALE_LOOKS : MALE_LOOKS;
  return looks[((person.look % looks.length) + looks.length) % looks.length];
}

type BustProps = StudentLook & { size: number; background?: string };

/** Head and shoulders of a student, cropped into a circle. Used as an avatar. */
export function StudentBust({ size, background = '#F1ECF8', ...look }: BustProps) {
  return (
    <Svg width={size} height={size} viewBox="20 0 120 120">
      <Defs>
        <ClipPath id="bust">
          <Circle cx={80} cy={60} r={60} />
        </ClipPath>
      </Defs>
      <Circle cx={80} cy={60} r={60} fill={background} />
      <G clipPath="url(#bust)">
        <Student {...look} leftArm="down" rightArm="down" bag={undefined} />
      </G>
    </Svg>
  );
}
