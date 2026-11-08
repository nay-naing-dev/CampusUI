import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/Controls';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  emoji: string;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ emoji, title, body, action }: Props) {
  return (
    <View className="items-center px-6 py-12">
      <Text className="text-[44px]">{emoji}</Text>
      <Text className="mt-3 text-center font-heading text-[20px] text-ink">{title}</Text>
      <Text className="mt-2 text-center font-body text-[14.5px] leading-[21px] text-muted">{body}</Text>
      {action && <Button label={action.label} onPress={action.onPress} size="small" className="mt-5 self-stretch" />}
    </View>
  );
}

export function LoadingState() {
  const { theme } = useTheme();
  return (
    <View className="items-center py-16">
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <EmptyState emoji="😕" title="Couldn’t load this" body={message} action={{ label: 'Try again', onPress: onRetry }} />;
}
