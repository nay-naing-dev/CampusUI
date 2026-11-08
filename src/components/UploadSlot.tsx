import { launchImageLibraryAsync } from 'expo-image-picker';
import { Image, Pressable, Text, View } from 'react-native';
import { CheckIcon, PhotoIcon, UploadIcon } from '@/components/Icons';
import { useTheme } from '@/theme/ThemeProvider';
import colors from '@/theme/colors';

export type IdPhoto = { uri: string; detail: string };

type Props = {
  label: string;
  photo: IdPhoto | null;
  onChange: (photo: IdPhoto) => void;
};

function describe(fileName?: string | null, fileSize?: number) {
  const size = fileSize ? `${(fileSize / 1_048_576).toFixed(1)} MB` : null;
  return [fileName, size].filter(Boolean).join(' · ') || 'Photo added';
}

/** Lets a student pick a photo of one side of their ID, and previews it. */
export function UploadSlot({ label, photo, onChange }: Props) {
  const { theme } = useTheme();
  const pick = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      onChange({ uri: asset.uri, detail: describe(asset.fileName, asset.fileSize) });
    }
  };

  if (photo) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, photo added. Tap to replace.`}
        onPress={pick}
        className="flex-row items-center rounded-2xl bg-white p-3 active:opacity-80"
        style={{ boxShadow: '0 8px 20px rgba(36,20,65,0.08)' }}
      >
        <Image source={{ uri: photo.uri }} accessibilityIgnoresInvertColors className="h-14 w-20 rounded-lg bg-line" />
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-body-bold text-[15px] text-ink">{label}</Text>
            <View className="flex-row items-center rounded-full bg-mint-wash px-2 py-0.5">
              <CheckIcon size={11} color={colors.mint.deep} />
              <Text className="ml-1 font-body-semibold text-[11.5px] text-mint-deep">Uploaded</Text>
            </View>
          </View>
          <Text numberOfLines={1} className="mt-0.5 font-body text-[12.5px] text-muted">
            {photo.detail}
          </Text>
          <View className="mt-2 h-1 rounded-full bg-mint" />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. Tap to upload a photo.`}
      onPress={pick}
      className="flex-row items-center rounded-2xl border-[1.5px] border-dashed border-loop/50 p-3 active:opacity-70"
    >
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-loop/10">
        <PhotoIcon color={theme.accent} />
      </View>
      <View className="mx-3 flex-1">
        <Text className="font-body-bold text-[15px] text-ink">{label}</Text>
        <Text className="mt-0.5 font-body text-[12.5px] text-muted">Tap to upload a photo</Text>
      </View>
      <UploadIcon color={theme.accent} />
    </Pressable>
  );
}
