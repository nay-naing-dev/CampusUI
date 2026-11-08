import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '@/components/Controls';
import { LockIcon } from '@/components/Icons';
import type { Badge, BadgeId } from '@/lib/api/types';
import { badgeMeta, TIER_COLORS } from '@/lib/badges';
import colors from '@/theme/colors';

const LOCKED = { ring: '#D9D4E5', fill: '#F3F1F7', text: colors.muted };

/** Round medal: tier-coloured ring, emoji in the middle. Locked ones show progress. */
export function BadgeMedal({ badge, size = 64 }: { badge: Badge; size?: number }) {
  const palette = badge.earned ? TIER_COLORS[badge.tier] : LOCKED;
  const stroke = size * 0.08;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = badge.goal ? badge.current / badge.goal : 0;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill={palette.fill} stroke={palette.ring} strokeWidth={stroke} />
        {!badge.earned && progress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={TIER_COLORS[badge.tier].ring}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * progress} ${circumference}`}
          />
        )}
      </Svg>
      <Text style={{ fontSize: size * 0.42, opacity: badge.earned ? 1 : 0.35 }}>{badge.emoji}</Text>
      {!badge.earned && (
        <View className="absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-muted">
          <LockIcon size={10} color="#fff" strokeWidth={2.4} />
        </View>
      )}
    </View>
  );
}

/** Tiny pill with a seller's top badge, for seller rows. */
export function BadgeChip({ id }: { id: BadgeId }) {
  const meta = badgeMeta(id);
  const palette = TIER_COLORS[meta.tier];
  return (
    <View className="flex-row items-center rounded-full px-2 py-0.5" style={{ backgroundColor: palette.fill }}>
      <Text className="text-[11px]">{meta.emoji}</Text>
      <Text className="ml-1 font-body-bold text-[11px]" style={{ color: palette.text }}>
        {meta.title}
      </Text>
    </View>
  );
}

function progressText(badge: Badge) {
  if (badge.earned) return 'Unlocked';
  if (badge.unit === 'dollars') return `$${badge.current} of $${badge.goal}`;
  return `${badge.current} of ${badge.goal} ${badge.unit}`;
}

/** Bottom sheet explaining one badge and how close the student is. */
export function BadgeSheet({ badge, onClose }: { badge: Badge | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!badge} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} className="flex-1 bg-ink/40" />
      {badge && (
        <View className="items-center rounded-t-[28px] bg-white px-6 pt-6" style={{ paddingBottom: insets.bottom + 18 }}>
          <BadgeMedal badge={badge} size={96} />
          <Text className="mt-3 font-body-bold text-[12px] uppercase tracking-[1.4px]" style={{ color: TIER_COLORS[badge.tier].text }}>
            {badge.tier} · {badge.group}
          </Text>
          <Text accessibilityRole="header" className="mt-1 font-heading text-[24px] text-ink">
            {badge.title}
          </Text>
          <Text className="mt-2 text-center font-body text-[14.5px] leading-[21px] text-muted">{badge.description}</Text>
          <View className="mt-5 w-full">
            <View className="h-2 overflow-hidden rounded-full bg-line">
              <View className="h-full rounded-full" style={{ width: `${(badge.current / badge.goal) * 100}%`, backgroundColor: TIER_COLORS[badge.tier].ring }} />
            </View>
            <Text className="mt-1.5 text-center font-body-semibold text-[13px] text-ink">{progressText(badge)}</Text>
          </View>
          {badge.group !== 'trust' && (
            <Text className="mt-3 text-center font-body text-[12.5px] text-muted">Only sales that both the buyer and the seller confirmed count.</Text>
          )}
          <Button label="Close" variant="light" className="mt-5 self-stretch" onPress={onClose} />
        </View>
      )}
    </Modal>
  );
}
