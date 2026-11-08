import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandBackground } from '@/components/BrandBackground';

/** Brand-coloured header with a rounded form sheet below it, shared by log in and sign up. */
export function AuthScreen({ hero, children }: { hero: ReactNode; children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="light" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ paddingTop: insets.top + 12 }} className="px-5 pb-16">
            <BrandBackground />
            {hero}
          </View>
          <View
            className="-mt-9 flex-1 rounded-t-[36px] bg-surface px-5 pt-7"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
