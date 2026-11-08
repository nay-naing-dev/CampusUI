import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeMedal';
import { CheckIcon, HeartIcon } from '@/components/Icons';
import type { Listing, ListingStatus, ListingWithSeller, User } from '@/lib/api/types';
import { HOLD_HOURS } from '@/lib/api/types';
import { categoryMeta } from '@/lib/categories';
import { formatPrice } from '@/lib/format';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

const openListing = (id: string) => router.push({ pathname: '/listing/[id]', params: { id } });

/** The listing's first photo, or its category artwork when it has none. */
export function ListingArt({ listing, height, rounded = 'rounded-2xl', photo }: { listing: Listing; height: number; rounded?: string; photo?: string }) {
  const meta = categoryMeta(listing.category);
  const uri = photo ?? listing.photos[0];

  return (
    <View className={`items-center justify-center overflow-hidden ${rounded}`} style={{ height, backgroundColor: meta.tint }}>
      {uri ? (
        <Image source={{ uri }} accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ fontSize: height * 0.4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {meta.emoji}
        </Text>
      )}
    </View>
  );
}

function PriceChip({ price, className = '' }: { price: number; className?: string }) {
  return (
    <View className={`absolute rounded-lg bg-ink/85 px-2 py-0.5 ${className}`}>
      <Text className="font-body-bold text-[13px] text-white">{formatPrice(price)}</Text>
    </View>
  );
}

const STATUS: Record<ListingStatus, { label: string; surface: string; text: string }> = {
  available: { label: 'Available', surface: 'bg-mint-wash', text: 'text-mint-deep' },
  reserved: { label: 'Reserved', surface: 'bg-[#FDF0D5]', text: 'text-[#8A5A00]' },
  sold: { label: 'Sold', surface: 'bg-line', text: 'text-muted' },
};

export function StatusPill({ status }: { status: ListingStatus }) {
  const style = STATUS[status];
  return (
    <View className={`self-start rounded-full px-2.5 py-0.5 ${style.surface}`}>
      <Text className={`font-body-bold text-[11.5px] ${style.text}`}>{style.label}</Text>
    </View>
  );
}

export function Tag({ label, tone = 'tint' }: { label: string; tone?: 'tint' | 'mint' }) {
  return (
    <View className={`rounded-full px-2.5 py-1 ${tone === 'mint' ? 'bg-mint-wash' : 'bg-tint'}`}>
      <Text className={`font-body-semibold text-[12px] ${tone === 'mint' ? 'text-mint-deep' : 'text-ink'}`}>{label}</Text>
    </View>
  );
}

/** Seller line: stickman, name with a verified tick, course and rating, campus pill. */
export function SellerRow({ seller, universityId, compact = false }: { seller: User; universityId: string; compact?: boolean }) {
  const { user } = useSession();
  const { theme } = useTheme();
  const sameCampus = user?.universityId === universityId;
  const details = [seller.major, seller.year].filter(Boolean).join(' · ');

  return (
    <View className="flex-row items-center">
      <Avatar person={seller} size={compact ? 30 : 40} />
      <View className="ml-2.5 flex-1">
        <View className="flex-row items-center">
          <Text numberOfLines={1} className={`font-body-bold text-ink ${compact ? 'text-[13px]' : 'text-[15px]'}`}>
            {seller.id === user?.id ? 'You' : seller.fullName}
          </Text>
          {seller.verification === 'verified' && (
            <View className="ml-1 h-3.5 w-3.5 items-center justify-center rounded-full" style={{ backgroundColor: theme.accent }}>
              <CheckIcon size={9} color={theme.onAccent} />
            </View>
          )}
        </View>
        <Text numberOfLines={1} className={`font-body text-muted ${compact ? 'text-[11.5px]' : 'text-[12.5px]'}`}>
          {[details, seller.rating ? `★ ${seller.rating.toFixed(1)}` : null].filter(Boolean).join(' · ')}
        </Text>
        {!compact && seller.topBadge && (
          <View className="mt-1 flex-row">
            <BadgeChip id={seller.topBadge} />
          </View>
        )}
      </View>
      {sameCampus && seller.id !== user?.id && (
        <View className="flex-row items-center rounded-full bg-mint-wash px-2 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-mint" />
          <Text className="ml-1 font-body-semibold text-[11px] text-mint-deep">Same campus</Text>
        </View>
      )}
    </View>
  );
}

/** Big "Just listed on your campus" card. */
export function FeaturedListing({ listing }: { listing: ListingWithSeller }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)}`}
      onPress={() => openListing(listing.id)}
      className="rounded-3xl bg-white p-2.5 active:opacity-90"
      style={{ boxShadow: '0 8px 22px rgba(36,20,65,0.08)' }}
    >
      <View>
        <ListingArt listing={listing} height={170} rounded="rounded-[20px]" />
        <View className="absolute left-2.5 top-2.5 rounded-md bg-white px-2 py-0.5">
          <Text className="font-body-bold text-[11px] text-ink">{listing.condition}</Text>
        </View>
        <View className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white">
          <HeartIcon size={16} color={listing.saved ? theme.accent : colors.ink} strokeWidth={listing.saved ? 2.6 : 2} />
        </View>
        <PriceChip price={listing.price} className="bottom-2.5 left-2.5" />
      </View>
      <View className="px-1 pb-1 pt-3">
        <SellerRow seller={listing.seller} universityId={listing.universityId} />
        <Text numberOfLines={1} className="mt-2 font-body-semibold text-[14.5px] text-ink">
          {listing.title}
        </Text>
      </View>
    </Pressable>
  );
}

/** Small tile: art with a price chip, title underneath. Used in grids and rails. */
export function ListingTile({ listing, width }: { listing: ListingWithSeller; width?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)}, ${listing.condition}`}
      onPress={() => openListing(listing.id)}
      className={`${width ? '' : 'flex-1'} active:opacity-85`}
      style={width ? { width } : undefined}
    >
      <View>
        <ListingArt listing={listing} height={width ? width : 104} />
        <PriceChip price={listing.price} className="bottom-1.5 left-1.5" />
        {listing.status === 'reserved' && (
          <View className="absolute right-1.5 top-1.5 rounded-md bg-[#FDF0D5] px-1.5 py-0.5">
            <Text className="font-body-bold text-[10px] text-[#8A5A00]">On hold</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={1} className="mt-1.5 font-body-semibold text-[13px] text-ink">
        {listing.title}
      </Text>
      <Text numberOfLines={1} className="font-body text-[11.5px] text-muted">
        {listing.condition}
      </Text>
    </Pressable>
  );
}

/** Tiles laid out `columns` per row. */
export function ListingGrid({ listings, columns = 3 }: { listings: ListingWithSeller[]; columns?: number }) {
  const rows: ListingWithSeller[][] = [];
  for (let index = 0; index < listings.length; index += columns) rows.push(listings.slice(index, index + columns));

  return (
    <View className="gap-4">
      {rows.map((row) => (
        <View key={row[0].id} className="flex-row gap-3">
          {row.map((listing) => (
            <ListingTile key={listing.id} listing={listing} />
          ))}
          {Array.from({ length: columns - row.length }, (_, gap) => (
            <View key={gap} className="flex-1" />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Countdown ring for a hold: the arc shrinks as the 72 hours run out. */
export function HoldRing({ hours, size = 52, total = HOLD_HOURS, caption = 'left' }: { hours: number; size?: number; total?: number; caption?: string }) {
  const { theme } = useTheme();
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const remaining = Math.min(1, hours / total);

  return (
    <View accessible accessibilityLabel={`${hours} hours ${caption}`} style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.soft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * remaining} ${circumference}`}
        />
      </Svg>
      <Text className="font-heading text-ink" style={{ fontSize: size * 0.3 }}>
        {hours}h
      </Text>
      {size >= 64 && <Text className="font-body text-[10.5px] text-muted">{caption}</Text>}
    </View>
  );
}
