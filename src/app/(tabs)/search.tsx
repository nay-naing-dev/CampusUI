import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip } from '@/components/Controls';
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeMedal';
import { ChevronDownIcon, ChevronRightIcon, CloseIcon, FilterIcon, SearchIcon, ShieldIcon } from '@/components/Icons';
import { ListingGrid } from '@/components/Listing';
import { PriceSlider } from '@/components/PriceSlider';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { UniCrest } from '@/components/UniCrest';
import { api } from '@/lib/api';
import type { Category, Condition, ListingSort, User } from '@/lib/api/types';
import { categoryMeta, CATEGORIES } from '@/lib/categories';
import { useApi } from '@/lib/useApi';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { findUniversity } from '@/theme/universities';

const DEBOUNCE_MS = 250;
const PRICE_CAP = 100;
const FILTER_CONDITIONS: Condition[] = ['Like new', 'Good', 'Fair', 'Used'];
const SORTS: { value: ListingSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Lowest price' },
  { value: 'price-high', label: 'Highest price' },
];

type Filters = { category: Category | null; conditions: Condition[]; maxPrice: number | null };
const NO_FILTERS: Filters = { category: null, conditions: [], maxPrice: null };

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove filter ${label}`}
      onPress={onRemove}
      className="h-8 flex-row items-center rounded-full bg-soft pl-3 pr-2 active:opacity-70"
    >
      <Text className="font-body-semibold text-[13px] text-ink">{label}</Text>
      <View className="ml-1">
        <CloseIcon size={13} color={colors.ink} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

/** A student matching the search: stickman, name, course, campus and top badge. */
function PersonRow({ person, divider }: { person: User; divider: boolean }) {
  const campus = findUniversity(person.universityId);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${person.fullName}, ${[person.major, campus?.short].filter(Boolean).join(', ')}`}
      onPress={() => router.push({ pathname: '/user/[id]', params: { id: person.id } })}
      className={`flex-row items-center px-3 py-2.5 active:bg-canvas ${divider ? 'border-t border-line' : ''}`}
    >
      <Avatar person={person} size={42} />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Text numberOfLines={1} className="font-body-bold text-[15px] text-ink">
            {person.fullName}
          </Text>
          {person.verification === 'verified' && (
            <View className="ml-1">
              <ShieldIcon size={14} color={colors.mint.deep} />
            </View>
          )}
        </View>
        <Text numberOfLines={1} className="font-body text-[12.5px] text-muted">
          {[person.major, person.year, `${person.sold} sold`].filter(Boolean).join(' · ')}
        </Text>
        {person.topBadge && (
          <View className="mt-1 flex-row">
            <BadgeChip id={person.topBadge} />
          </View>
        )}
      </View>
      {campus && <UniCrest university={campus} size={26} />}
      <View className="ml-2">
        <ChevronRightIcon size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

function FilterSheet({ open, initial, onClose, onApply }: { open: boolean; initial: Filters; onClose: () => void; onApply: (filters: Filters) => void }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(initial);
  const [lastOpen, setLastOpen] = useState(open);
  // Start from the applied filters each time the sheet opens.
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(initial);
  }
  const price = draft.maxPrice ?? PRICE_CAP;

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close filters" onPress={onClose} className="flex-1 bg-ink/40" />
      <View className="rounded-t-[28px] bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="mb-3 h-1 w-10 self-center rounded-full bg-line" />
        <View className="flex-row items-center justify-between">
          <Text accessibilityRole="header" className="font-heading text-[20px] text-ink">
            Filters
          </Text>
          <Text accessibilityRole="button" onPress={() => setDraft(NO_FILTERS)} className="font-body-bold text-[14px] text-loop">
            Reset
          </Text>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="font-body-bold text-[14.5px] text-ink">Price</Text>
          <Text className="font-body-semibold text-[14px] text-muted">{price >= PRICE_CAP ? 'Any price' : `$0 – $${price}`}</Text>
        </View>
        <PriceSlider value={price} max={PRICE_CAP} onChange={(value) => setDraft({ ...draft, maxPrice: value >= PRICE_CAP ? null : value })} />

        <Text className="mt-4 font-body-bold text-[14.5px] text-ink">Condition</Text>
        <View className="mt-2.5 flex-row flex-wrap gap-2">
          {FILTER_CONDITIONS.map((condition) => {
            const selected = draft.conditions.includes(condition);
            return (
              <Chip
                key={condition}
                label={condition}
                selected={selected}
                onPress={() =>
                  setDraft({
                    ...draft,
                    conditions: selected ? draft.conditions.filter((item) => item !== condition) : [...draft.conditions, condition],
                  })
                }
              />
            );
          })}
        </View>

        <Text className="mt-5 font-body-bold text-[14.5px] text-ink">Category</Text>
        <View className="mt-2.5 flex-row flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              icon={category.emoji}
              selected={draft.category === category.id}
              onPress={() => setDraft({ ...draft, category: draft.category === category.id ? null : category.id })}
            />
          ))}
        </View>

        <Button label="Show results" className="mt-6" onPress={() => onApply(draft)} />
      </View>
    </Modal>
  );
}

export default function SearchRoute() {
  const params = useLocalSearchParams<{ category?: Category; filters?: string }>();
  const { user } = useSession();
  const { university } = useTheme();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ ...NO_FILTERS, category: params.category ?? null });
  const [sort, setSort] = useState<ListingSort>('newest');
  const [sheetOpen, setSheetOpen] = useState(params.filters === 'open');

  // Tapping a category or filter chip on Market opens this tab with it applied.
  const [seenParams, setSeenParams] = useState(params);
  if (params.category !== seenParams.category || params.filters !== seenParams.filters) {
    setSeenParams(params);
    if (params.category) setFilters({ ...filters, category: params.category });
    if (params.filters === 'open') setSheetOpen(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const load = useCallback(
    () =>
      api.listings.list(
        { universityId: user?.universityId ?? null, search, sort, category: filters.category, conditions: filters.conditions, maxPrice: filters.maxPrice },
        user?.id ?? null,
      ),
    [user?.universityId, user?.id, search, sort, filters],
  );
  const results = useApi(load);
  const loadPeople = useCallback(
    () => api.users.search(search, user?.universityId ?? null, user?.id ?? null),
    [search, user?.universityId, user?.id],
  );
  const people = useApi(loadPeople);

  const active = [
    filters.category && { key: 'category', label: categoryMeta(filters.category).label, clear: () => setFilters({ ...filters, category: null }) },
    ...filters.conditions.map((condition) => ({
      key: condition,
      label: condition,
      clear: () => setFilters({ ...filters, conditions: filters.conditions.filter((item) => item !== condition) }),
    })),
    filters.maxPrice != null && { key: 'price', label: `Under $${filters.maxPrice}`, clear: () => setFilters({ ...filters, maxPrice: null }) },
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => !!chip);

  const sortLabel = SORTS.find((option) => option.value === sort)!.label;
  const nextSort = () => setSort(SORTS[(SORTS.findIndex((option) => option.value === sort) + 1) % SORTS.length].value);

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title="Search">
        <View className="mt-3 flex-row items-center gap-2">
          <View className="h-12 flex-1 flex-row items-center rounded-2xl bg-white px-4">
            <SearchIcon size={19} color={colors.muted} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Items or students, e.g. hoodie, Zaw Lin"
              placeholderTextColor="#8D87A3"
              accessibilityLabel="Search items and students"
              returnKeyType="search"
              autoCorrect={false}
              className="ml-2.5 h-full flex-1 font-body text-[16px] text-ink"
            />
            {text ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setText('')} hitSlop={10}>
                <CloseIcon size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={active.length ? `Filters, ${active.length} on` : 'Filters'}
            onPress={() => setSheetOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-loop active:opacity-80"
          >
            <FilterIcon size={21} color="#fff" strokeWidth={2.2} />
          </Pressable>
        </View>
      </ScreenHeader>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}>
        {active.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, gap: 8 }}>
            {active.map((chip) => (
              <ActiveChip key={chip.key} label={chip.label} onRemove={chip.clear} />
            ))}
          </ScrollView>
        )}

        <View className="px-5 pt-4">
          {!!people.data?.length && (
            <View className="mb-5">
              <Text className="mb-2 font-body-bold text-[15px] text-ink">Students</Text>
              <View className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 6px 18px rgba(36,20,65,0.06)' }}>
                {people.data.map((person, index) => (
                  <PersonRow key={person.id} person={person} divider={index > 0} />
                ))}
              </View>
            </View>
          )}

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-body-bold text-[15px] text-ink">
              {results.data ? `${results.data.length} results ${university ? 'on your campus' : 'on CampusLoop'}` : 'Searching…'}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Sort: ${sortLabel}. Tap to change.`} onPress={nextSort} className="flex-row items-center">
              <Text className="font-body-semibold text-[13px] text-loop">{sortLabel}</Text>
              <ChevronDownIcon size={14} color={colors.muted} />
            </Pressable>
          </View>

          {results.error && !results.data ? (
            <ErrorState message={results.error} onRetry={results.reload} />
          ) : !results.data ? (
            <LoadingState />
          ) : results.data.length === 0 ? (
            people.data?.length ? (
              <Text className="py-6 text-center font-body text-[14px] text-muted">No items match. Tap a student above to see what they sell.</Text>
            ) : (
              <EmptyState emoji="🔍" title="No matches" body="Try another word, a student’s name, or loosen the filters." />
            )
          ) : (
            <ListingGrid listings={results.data} columns={3} />
          )}
        </View>
      </ScrollView>

      <FilterSheet
        open={sheetOpen}
        initial={filters}
        onClose={() => setSheetOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}
