import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

export function ChevronLeftIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function UploadIcon({ size = 20, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4.5 15v3.5a2 2 0 002 2h11a2 2 0 002-2V15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PhotoIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7.5h3.5L9 5h6l1.5 2.5H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5a1 1 0 011-1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={13} r={3.2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function ClockIcon({ size = 16, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={2.4} />
      <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function EyeIcon({ size = 22, color = '#6B6485' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 22, color = '#6B6485' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M4 4l16 16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SparkleIcon({ size = 32, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M18 2c1 7 4 10 12 12 1 .4 1 1.4 0 1.8-7 1.6-10 4.6-12 12-.4 1.2-1.6 1.2-2 0-1.4-7.4-4.6-10.4-12-12-1.2-.4-1.2-1.4 0-1.8 7.4-2 10.6-5 12-12 .4-1 1.6-1 2 0z"
        fill={color}
      />
    </Svg>
  );
}

type LineIconProps = IconProps & { strokeWidth?: number };

function line(d: string) {
  return function LineIcon({ size = 22, color = '#fff', strokeWidth = 2 }: LineIconProps) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  };
}

export const HomeIcon = line('M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1v-8.5z');
export const SearchIcon = line('M10.8 18.1a7.3 7.3 0 100-14.6 7.3 7.3 0 000 14.6zM16.2 16.2L20.5 20.5');
export const PlusIcon = line('M12 5v14M5 12h14');
export const ChatIcon = line('M5 18.5V7a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8.5L5 18.5z');
export const UserIcon = line('M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5');
export const BellIcon = line('M6 16.5V11a6 6 0 1112 0v5.5l1.5 1.5h-15L6 16.5zM10 20.5a2 2 0 004 0');
export const HeartIcon = line('M12 19.5S4 14.8 4 9.2A4.2 4.2 0 0112 7a4.2 4.2 0 018 2.2c0 5.6-8 10.3-8 10.3z');
export const PinIcon = line('M12 21s6.5-5.6 6.5-11a6.5 6.5 0 10-13 0c0 5.4 6.5 11 6.5 11zM12 12.3a2.3 2.3 0 100-4.6 2.3 2.3 0 000 4.6z');
export const SendIcon = line('M4.5 12L19.5 4.5 16 19.5l-4.5-6-7-1.5zM11.5 13.5L19.5 4.5');
export const ChevronRightIcon = line('M9 5l7 7-7 7');
export const ChevronDownIcon = line('M5 9l7 7 7-7');
export const CloseIcon = line('M6 6l12 12M18 6L6 18');
export const LogoutIcon = line('M14.5 4.5H18a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-3.5M10 16l-4-4 4-4M6 12h9.5');
export const TagIcon = line('M3.5 12.2V4.5a1 1 0 011-1h7.7l8.3 8.3a1.4 1.4 0 010 2l-6.7 6.7a1.4 1.4 0 01-2 0L3.5 12.2zM8 8h.01');
export const ShieldIcon = line('M12 3.5l7 2.8v5.4c0 4.4-3 7.6-7 8.8-4-1.2-7-4.4-7-8.8V6.3l7-2.8zM9 12l2 2 4-4');
export const PaletteIcon = line('M12 20.5a8.5 8.5 0 118.5-8.5c0 2.2-1.8 3.5-3.6 3.5h-1.6a1.8 1.8 0 00-1.3 3.1 1.1 1.1 0 01-.8 1.9H12zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01');
export const EditIcon = line('M4.5 19.5l1-4L15.8 5.2a2 2 0 012.9 0l.1.1a2 2 0 010 2.9L8.5 18.5l-4 1zM13.5 7.5l3 3');
export const MailIcon = line('M4 6.5h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1v-11zM4 7l8 6 8-6');
export const LockIcon = line('M6.5 10.5h11a1 1 0 011 1V19a1 1 0 01-1 1h-11a1 1 0 01-1-1v-7.5a1 1 0 011-1zM8.5 10.5V8a3.5 3.5 0 017 0v2.5');
export const MarketIcon = line('M4 9.5L5.5 4.5h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0 2.7 2.7 0 005.3 0M5.5 12v7.5h13V12M10 19.5v-4.5h4v4.5');
export const ActivityIcon = line('M7 3.5h10a1.5 1.5 0 011.5 1.5v14.5a1 1 0 01-1 1h-11a1 1 0 01-1-1V5A1.5 1.5 0 017 3.5zM9 8.5h6M9 12h6M9 15.5h3.5');
export const ShareIcon = line('M12 15V3.5M7.5 8L12 3.5 16.5 8M5 12.5v6a2 2 0 002 2h10a2 2 0 002-2v-6');
export const FlagIcon = line('M5.5 21V4.5M5.5 4.5h11l-2 4 2 4h-11');
export const TrashIcon = line('M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5');
export const SettingsIcon = line('M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z');
export const ShuffleIcon = line('M4 7h3.5c4.5 0 5.5 10 10 10H20M4 17h3.5c1.7 0 2.8-1.4 3.7-3.3M13 9.8C14 8.2 15.2 7 17.5 7H20M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5');
export const FilterIcon = line('M4 7h10M18 7h2M4 17h4M12 17h8M14 4.5v5M8 14.5v5');
export const WarningIcon = line('M12 4l9 15.5H3L12 4zM12 10v4M12 17h.01');
export const InfoIcon = line('M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5.5M12 7.5h.01');
export const WalletIcon = line('M4 7.5h14.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18V7.5zM4 7.5L15 4.5V7.5M16 13.5h.01');
