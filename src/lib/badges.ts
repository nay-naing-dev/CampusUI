import type { Badge, BadgeId, BadgeTier, User } from '@/lib/api/types';

// Achievement rules. They only read confirmed numbers (sales and purchases both
// students approved), so a seller can't farm badges by marking things sold.
// The NestJS API should own this; the mock calls it from src/lib/api.

type Rule = Omit<Badge, 'earned' | 'current'> & {
  measure: (user: User) => number;
  /** Extra condition beyond reaching the goal. */
  also?: (user: User) => boolean;
};

const RULES: Rule[] = [
  { id: 'first-loop', title: 'First Loop', emoji: '🔁', tier: 'bronze', group: 'selling', description: 'Your first sale, confirmed by you and the buyer.', goal: 1, unit: 'sale', measure: (user) => user.sold },
  { id: 'rising-seller', title: 'Rising Seller', emoji: '🌱', tier: 'silver', group: 'selling', description: '5 confirmed sales on your campus.', goal: 5, unit: 'sales', measure: (user) => user.sold },
  { id: 'campus-trader', title: 'Campus Trader', emoji: '🏪', tier: 'gold', group: 'selling', description: '10 confirmed sales. People know your stall.', goal: 10, unit: 'sales', measure: (user) => user.sold },
  { id: 'loop-legend', title: 'Loop Legend', emoji: '👑', tier: 'gold', group: 'selling', description: '25 confirmed sales. A campus institution.', goal: 25, unit: 'sales', measure: (user) => user.sold },
  { id: 'big-earner', title: 'Big Earner', emoji: '💰', tier: 'silver', group: 'selling', description: '$250 earned from confirmed sales.', goal: 250, unit: 'dollars', measure: (user) => user.earned },
  {
    id: 'five-star',
    title: 'Five-Star Seller',
    emoji: '⭐',
    tier: 'gold',
    group: 'selling',
    description: 'A 4.8+ rating across at least 5 confirmed sales.',
    goal: 5,
    unit: 'sales at 4.8+',
    measure: (user) => user.sold,
    also: (user) => user.rating >= 4.8,
  },
  { id: 'free-spirit', title: 'Free Spirit', emoji: '🎁', tier: 'bronze', group: 'selling', description: 'Gave something away for free to another student.', goal: 1, unit: 'gift', measure: (user) => user.givenAway },
  { id: 'first-find', title: 'First Find', emoji: '🛍️', tier: 'bronze', group: 'buying', description: 'Your first confirmed purchase.', goal: 1, unit: 'purchase', measure: (user) => user.bought },
  { id: 'regular', title: 'Regular', emoji: '🧺', tier: 'silver', group: 'buying', description: '5 confirmed purchases. Loop it forward.', goal: 5, unit: 'purchases', measure: (user) => user.bought },
  { id: 'verified', title: 'Verified Student', emoji: '🛡️', tier: 'bronze', group: 'trust', description: 'Your student ID was checked by the CampusLoop team.', goal: 1, unit: 'check', measure: (user) => (user.verification === 'verified' ? 1 : 0) },
];

const TIER_RANK: Record<BadgeTier, number> = { bronze: 1, silver: 2, gold: 3 };

export function computeBadges(user: User): Badge[] {
  return RULES.map(({ measure, also, ...rule }) => {
    const current = measure(user);
    return { ...rule, current: Math.min(current, rule.goal), earned: current >= rule.goal && (also?.(user) ?? true) };
  });
}

/** The most impressive selling badge, for the seller row on listings. */
export function topBadgeId(user: User): BadgeId | null {
  const earned = computeBadges(user).filter((badge) => badge.earned && badge.group === 'selling');
  if (!earned.length) return null;
  // Higher tier first; within a tier, the later (harder) rule wins.
  return earned.reduce((best, badge) => (TIER_RANK[badge.tier] >= TIER_RANK[best.tier] ? badge : best)).id;
}

export function badgeMeta(id: BadgeId) {
  const rule = RULES.find((item) => item.id === id)!;
  return { title: rule.title, emoji: rule.emoji, tier: rule.tier };
}

export const TIER_COLORS: Record<BadgeTier, { ring: string; fill: string; text: string }> = {
  bronze: { ring: '#C98A4B', fill: '#F8E7D6', text: '#7A4A1C' },
  silver: { ring: '#9AA6B8', fill: '#EEF1F6', text: '#4A5568' },
  gold: { ring: '#E3AC1D', fill: '#FFF3C9', text: '#7A5A00' },
};
