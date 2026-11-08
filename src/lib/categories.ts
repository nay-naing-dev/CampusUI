import type { Category, Condition } from '@/lib/api/types';

// The four big tiles on Market and Sell come first, as in the designs.
export const CATEGORIES: { id: Category; label: string; emoji: string; tint: string }[] = [
  { id: 'dorm', label: 'Dorm', emoji: '🛋️', tint: '#FFE9A8' },
  { id: 'books', label: 'Textbooks', emoji: '📚', tint: '#F9D3E6' },
  { id: 'clothes', label: 'Clothes', emoji: '👕', tint: '#DCD3F7' },
  { id: 'tech', label: 'Tech', emoji: '🎧', tint: '#D3E3FB' },
  { id: 'bikes', label: 'Bikes', emoji: '🚲', tint: '#CFEFE6' },
  { id: 'other', label: 'Other', emoji: '🎒', tint: '#ECE8F4' },
];

export const CONDITIONS: Condition[] = ['New', 'Like new', 'Good', 'Fair'];

export function categoryMeta(id: Category) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
