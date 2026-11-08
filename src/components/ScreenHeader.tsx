import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';
import { BackButton } from '@/components/Controls';

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Shows a back button that pops the stack. */
  back?: boolean;
  right?: ReactNode;
  /** Extra content under the title, still on the brand colour. */
  children?: ReactNode;
};

/** Flat brand-coloured header used across the app's inner screens. */
export function ScreenHeader({ title, eyebrow, subtitle, back = false, right, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="px-5 pb-5" style={{ paddingTop: insets.top + 10 }}>
      <StatusBar style="light" />
      <BrandBackground />
      <View className="min-h-11 flex-row items-center">
        {back && (
          <View className="mr-3">
            <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/market'))} />
          </View>
        )}
        <View className="flex-1">
          {eyebrow ? <Text className="font-body-bold text-[12px] tracking-[1.6px] text-highlight">{eyebrow}</Text> : null}
          <Text accessibilityRole="header" numberOfLines={1} className="font-heading text-[26px] leading-[32px] text-white">
            {title}
          </Text>
        </View>
        {right}
      </View>
      {subtitle ? <Text className="mt-1.5 font-body text-[14.5px] leading-[20px] text-white/80">{subtitle}</Text> : null}
      {children}
    </View>
  );
}
