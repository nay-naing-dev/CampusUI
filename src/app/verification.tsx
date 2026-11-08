import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Controls';
import { CheckIcon, ClockIcon } from '@/components/Icons';
import { Hourglass, StudentFigure } from '@/components/Illustrations';
import { UniCrest } from '@/components/UniCrest';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

const HOURGLASS_WIDTH = 88;
const AMBER = '#B7791F';

function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View className="flex-row items-center">
      <View className={`h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-mint-wash' : 'bg-[#FDF0D5]'}`}>
        {done ? <CheckIcon size={13} color={colors.mint.deep} /> : <ClockIcon size={15} color={AMBER} />}
      </View>
      <Text className="ml-3 flex-1 font-body-medium text-[15px] text-ink">{label}</Text>
    </View>
  );
}

export default function VerificationRoute() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { university } = useTheme();
  const studentWidth = Math.min(118, (width - 40 - HOURGLASS_WIDTH) / 2);

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      >
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="flex-row items-end justify-center">
          <StudentFigure width={studentWidth} hair="long" leftArm="wave" top="sleeveless" />
          <View className="mb-16">
            <Hourglass width={HOURGLASS_WIDTH} />
          </View>
          <StudentFigure width={studentWidth} hair="spiky" bag="sling" leftArm="reach" />
        </View>

        <Text accessibilityRole="header" className="mt-5 text-center font-heading text-[30px] leading-[36px] text-ink">
          You’re in the queue
        </Text>
        <Text className="mt-3 px-2 text-center font-body text-[15.5px] leading-[22px] text-muted">
          We usually verify student IDs within 24 hours. You can browse your campus market while you wait.
        </Text>

        <View className="mt-6 gap-3 rounded-2xl bg-white p-5" style={{ boxShadow: '0 12px 28px rgba(36,20,65,0.08)' }}>
          {university && (
            <View className="mb-1 flex-row items-center border-b border-line pb-3">
              <UniCrest university={university} size={32} />
              <View className="ml-3 flex-1">
                <Text className="font-body-bold text-[15px] text-ink">{university.name}</Text>
                <Text className="font-body text-[13px] text-muted">Your campus theme is on</Text>
              </View>
            </View>
          )}
          <StatusRow label="Account created" done />
          <StatusRow label={university ? `Campus chosen · ${university.short}` : 'Campus chosen'} done />
          <StatusRow label="Student ID in review" done={false} />
        </View>

        <Button label="Browse the market" className="mt-7" onPress={() => router.replace('/campus-welcome')} />
      </ScrollView>
    </View>
  );
}
