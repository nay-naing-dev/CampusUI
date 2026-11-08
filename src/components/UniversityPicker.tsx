import { useState } from 'react';
import { FlatList, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FieldError, TextLink } from '@/components/Controls';
import { CheckIcon, ChevronDownIcon, CloseIcon, SearchIcon } from '@/components/Icons';
import { UniCrest } from '@/components/UniCrest';
import { notBuiltYet } from '@/lib/placeholder';
import colors from '@/theme/colors';
import { findUniversity, UNIVERSITIES } from '@/theme/universities';

type Props = {
  value: string | null;
  onChange: (universityId: string) => void;
  error?: string;
};

/** A form field that opens a searchable sheet of supported universities. */
export function UniversityPicker({ value, onChange, error }: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = findUniversity(value);

  const search = query.trim().toLowerCase();
  const matches = UNIVERSITIES.filter(
    (university) =>
      !search ||
      university.name.toLowerCase().includes(search) ||
      university.short.toLowerCase().includes(search) ||
      university.city.toLowerCase().includes(search),
  );

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View>
      <Text className="mb-2 font-body-medium text-[14.5px] text-night">University</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `University: ${selected.name}. Tap to change.` : 'Choose your university'}
        onPress={() => setOpen(true)}
        className={`min-h-14 flex-row items-center rounded-2xl border-[1.5px] bg-white px-3 py-2 active:opacity-80 ${error ? 'border-danger' : selected ? 'border-loop' : 'border-line'}`}
      >
        {selected ? (
          <>
            <UniCrest university={selected} size={34} />
            <View className="ml-3 flex-1">
              <Text className="font-body-bold text-[15.5px] text-ink">{selected.name}</Text>
              <Text className="font-body text-[13px] text-muted">{selected.city} · Theme applied</Text>
            </View>
          </>
        ) : (
          <Text className="ml-1 flex-1 font-body text-[16.5px] text-[#8D87A3]">Choose your university</Text>
        )}
        <ChevronDownIcon size={20} color={colors.muted} />
      </Pressable>
      <FieldError message={error} />

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={close}
      >
        <View className="flex-1 bg-canvas" style={{ paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 12 }}>
          <View className="flex-row items-center justify-between px-5 pb-3">
            <Text accessibilityRole="header" className="font-heading text-[24px] text-ink">
              Your university
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={close}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-full bg-line active:opacity-70"
            >
              <CloseIcon size={18} color={colors.ink} />
            </Pressable>
          </View>
          <Text className="px-5 font-body text-[14px] text-muted">
            Your campus sets your market and the app’s colours. We check it against your student ID.
          </Text>

          <View className="mx-5 mt-4 h-12 flex-row items-center rounded-2xl border-[1.5px] border-line bg-white px-3">
            <SearchIcon size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or city"
              placeholderTextColor="#8D87A3"
              accessibilityLabel="Search universities"
              autoCorrect={false}
              className="ml-2 h-full flex-1 font-body text-[16px] text-ink"
            />
          </View>

          <FlatList
            data={matches}
            keyExtractor={(university) => university.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 10 }}
            renderItem={({ item }) => {
              const active = item.id === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={item.name}
                  onPress={() => {
                    onChange(item.id);
                    close();
                  }}
                  className={`flex-row items-center rounded-2xl border-[1.5px] bg-white p-3 active:opacity-80 ${active ? 'border-loop' : 'border-transparent'}`}
                >
                  <UniCrest university={item} size={40} />
                  <View className="mx-3 flex-1">
                    <Text className="font-body-bold text-[15.5px] text-ink">{item.name}</Text>
                    <Text className="mt-0.5 font-body text-[13px] text-muted">{item.city}</Text>
                  </View>
                  {/* Swatches preview the theme this campus gets. */}
                  <View className="mr-2 flex-row">
                    {[item.theme.brand, item.theme.accent, item.theme.highlight].map((swatch) => (
                      <View key={swatch} className="-ml-1.5 h-4 w-4 rounded-full border-2 border-white" style={{ backgroundColor: swatch }} />
                    ))}
                  </View>
                  <View className={`h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-loop' : 'border-[1.5px] border-line'}`}>
                    {active && <CheckIcon size={13} />}
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text className="mt-6 text-center font-body text-[15px] text-muted">No university matches “{query}”.</Text>
            }
            ListFooterComponent={
              <Text className="mt-4 text-center font-body text-[14px] text-muted">
                Not listed?{' '}
                <TextLink label="Request your university" onPress={() => notBuiltYet('Request your university')} />
              </Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
