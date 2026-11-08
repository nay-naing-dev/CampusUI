import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIcon, MarketIcon, PlusIcon, SearchIcon, UserIcon } from '@/components/Icons';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

const TABS: Record<string, { label: string; Icon: typeof MarketIcon }> = {
  market: { label: 'Market', Icon: MarketIcon },
  search: { label: 'Search', Icon: SearchIcon },
  activity: { label: 'Activity', Icon: ActivityIcon },
  profile: { label: 'Profile', Icon: UserIcon },
};

const BAR_HEIGHT = 62;
const SELL_SIZE = 58;
/** How far the Sell circle rises above the bar. */
const SELL_RISE = 28;

const openSell = () => router.push('/sell-item');

/**
 * Floating pill tab bar from the Figma "App components" board: Market, Search,
 * Sell as a raised circle, Activity, Profile. The active tab sits on a soft pill.
 *
 * The raised circle is laid out inside this component's own bounds (the
 * container leaves room above the bar for it). A negative margin would push it
 * outside its parent, and iOS and Android drop touches there.
 */
export function TabBar({ state, emitter, navigateToTab, badges = {} }: BottomTabBarProps & { badges?: Record<string, number> }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{ paddingTop: SELL_RISE, paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View
        className="flex-row items-center rounded-full bg-white px-2"
        style={{ height: BAR_HEIGHT, boxShadow: '0 10px 28px rgba(22,14,51,0.14)' }}
      >
        {state.routes.map((route, index) => {
          if (route.name === 'sell') {
            // Keeps the middle slot; the circle itself is drawn above, below.
            return (
              <Pressable
                key={route.key}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                onPress={openSell}
                className="h-full flex-1 items-center justify-end pb-2"
              >
                <Text className="font-body-semibold text-[10.5px] text-muted">Sell</Text>
              </Pressable>
            );
          }

          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const badge = badges[route.name] ?? 0;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={badge ? `${tab.label}, ${badge} new` : tab.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              className="flex-1 items-center"
            >
              <View className={`h-[48px] w-[54px] items-center justify-center rounded-[18px] ${focused ? 'bg-soft' : ''}`}>
                <tab.Icon size={21} color={focused ? theme.accent : colors.muted} strokeWidth={focused ? 2.3 : 1.9} />
                <Text className={`mt-0.5 font-body-semibold text-[10.5px] ${focused ? 'text-loop' : 'text-muted'}`}>{tab.label}</Text>
                {badge > 0 && <View className="absolute right-2.5 top-1.5 h-2 w-2 rounded-full bg-danger" />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* The raised Sell circle, centred over the middle slot and fully inside this view. */}
      <View pointerEvents="box-none" className="absolute left-0 right-0 top-0 items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sell an item"
          onPress={openSell}
          hitSlop={8}
          className="items-center justify-center rounded-full border-4 border-white bg-loop active:scale-95"
          style={{ width: SELL_SIZE, height: SELL_SIZE, boxShadow: `0 8px 18px ${theme.accent}55` }}
        >
          <PlusIcon size={26} color={theme.onAccent} strokeWidth={2.8} />
        </Pressable>
      </View>
    </View>
  );
}

/** Space to leave under scrolling content so the floating bar doesn't cover it. */
export const TAB_BAR_SPACE = 110;
