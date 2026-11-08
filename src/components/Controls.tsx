import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { CheckIcon, ChevronLeftIcon, EyeIcon, EyeOffIcon, SparkleIcon } from '@/components/Icons';
import { useTheme } from '@/theme/ThemeProvider';
import colors from '@/theme/colors';

// GlassView only renders real Liquid Glass on iOS 26 and above.
const HAS_NATIVE_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

type Variant = 'primary' | 'dark' | 'light' | 'outline';

// Flat fills; the colour of `primary` and `dark` follows the university theme.
const VARIANTS: Record<Variant, { surface: string; text: string; spinner: string }> = {
  primary: { surface: 'bg-loop', text: 'text-white', spinner: '#fff' },
  dark: { surface: 'bg-brand-deep', text: 'text-white', spinner: '#fff' },
  light: { surface: 'bg-white border border-line', text: 'text-ink', spinner: colors.ink },
  outline: { surface: 'border-[1.5px] border-loop bg-transparent', text: 'text-loop', spinner: colors.ink },
};

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  size?: 'large' | 'small';
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  icon,
  size = 'large',
}: ButtonProps) {
  const { theme } = useTheme();
  const { surface, text, spinner } = VARIANTS[variant];
  const height = size === 'large' ? 'h-14' : 'h-11';
  const inactive = loading || disabled;

  const content = loading ? (
    <ActivityIndicator color={spinner} />
  ) : (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className={`font-body-bold ${size === 'large' ? 'text-[17px]' : 'text-[15px]'} ${text}`}>{label}</Text>
    </View>
  );

  const glassTint = variant === 'primary' ? theme.accent : variant === 'dark' ? theme.brandDeep : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      // Scales rather than fades on press: Apple advises against opacity on glass.
      className={`rounded-full active:scale-[0.97] ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {HAS_NATIVE_GLASS && glassTint ? (
        <GlassView
          glassEffectStyle="regular"
          tintColor={`${glassTint}E6`}
          style={{ height: size === 'large' ? 56 : 44, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
        >
          {content}
        </GlassView>
      ) : (
        <View className={`${height} items-center justify-center rounded-full px-5 ${surface}`}>{content}</View>
      )}
    </Pressable>
  );
}

type TextLinkProps = { label: string; onPress: () => void; className?: string };

export function TextLink({ label, onPress, className = '' }: TextLinkProps) {
  return (
    <Text accessibilityRole="link" onPress={onPress} className={`font-body-bold text-loop ${className}`}>
      {label}
    </Text>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={6}
      className="h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 active:opacity-70"
    >
      <ChevronLeftIcon size={20} />
    </Pressable>
  );
}

type CheckboxProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  children: ReactNode;
};

export function Checkbox({ checked, onChange, label, children }: CheckboxProps) {
  return (
    <View className="flex-row items-center">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        hitSlop={12}
        className={`h-6 w-6 items-center justify-center rounded-lg border-[1.5px] ${checked ? 'border-loop bg-loop' : 'border-muted/40 bg-white'}`}
      >
        {checked && <CheckIcon size={15} />}
      </Pressable>
      <View className="ml-2.5 shrink">{children}</View>
    </View>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  icon?: ReactNode;
  error?: string;
  /** Masks the value and adds a show/hide toggle. */
  secret?: boolean;
  accessory?: ReactNode;
};

export function TextField({ label, icon, error, secret = false, accessory, multiline, ...input }: FieldProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View>
      <Text className="mb-2 font-body-medium text-[14.5px] text-night">{label}</Text>
      <View
        className={`flex-row rounded-2xl border-[1.5px] bg-white px-4 ${multiline ? 'min-h-[112px] items-start py-3' : 'h-14 items-center'} ${error ? 'border-danger' : focused ? 'border-loop' : 'border-line'}`}
        style={focused ? { boxShadow: `0 0 0 3px ${theme.accent}24` } : undefined}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          {...input}
          multiline={multiline}
          accessibilityLabel={label}
          secureTextEntry={secret && !revealed}
          placeholderTextColor="#8D87A3"
          onFocus={(event) => {
            setFocused(true);
            input.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            input.onBlur?.(event);
          }}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={`flex-1 font-body text-[16.5px] text-ink ${multiline ? 'min-h-[88px]' : 'h-full'}`}
        />
        {accessory}
        {secret && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            onPress={() => setRevealed((value) => !value)}
            hitSlop={12}
            className="ml-3"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </Pressable>
        )}
      </View>
      <FieldError message={error} />
    </View>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <Text className="mt-1.5 font-body-medium text-[13px] text-danger">{message}</Text> : null;
}

export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Text className={`font-body-bold text-[13px] tracking-[1.6px] text-loop ${className}`}>{children}</Text>;
}

export function Hint({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View className="mt-3 flex-row items-center">
      <SparkleIcon size={14} color={theme.accent} />
      <Text className="ml-2 flex-1 font-body text-[13px] text-muted">{children}</Text>
    </View>
  );
}

type ChipProps = { label: string; selected?: boolean; onPress: () => void; icon?: string };

export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-10 flex-row items-center rounded-full border-[1.5px] px-4 active:opacity-80 ${selected ? 'border-loop bg-loop' : 'border-line bg-white'}`}
    >
      {icon ? <Text className="mr-1.5 text-[15px]">{icon}</Text> : null}
      <Text className={`font-body-semibold text-[14px] ${selected ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** "onBrand" sits on the coloured header, "light" on the page. */
  tone?: 'onBrand' | 'light';
};

/** Two-or-more-way switch, e.g. Reserved / Selling on Activity. */
export function Segmented<T extends string>({ options, value, onChange, tone = 'light' }: SegmentedProps<T>) {
  return (
    <View accessibilityRole="tablist" className={`flex-row rounded-full p-1 ${tone === 'onBrand' ? 'bg-white/15' : 'bg-line'}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={`h-9 flex-1 items-center justify-center rounded-full ${active ? 'bg-white' : ''}`}
          >
            <Text className={`font-body-bold text-[13.5px] ${active ? 'text-ink' : tone === 'onBrand' ? 'text-white' : 'text-muted'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** On/off switch drawn in the campus primary colour. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${value ? 'bg-loop' : 'bg-line'}`}
    >
      <View className={`h-6 w-6 rounded-full bg-white ${value ? 'self-end' : 'self-start'}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </Pressable>
  );
}

type IconButtonProps = { label: string; onPress: () => void; children: ReactNode; tone?: 'onBrand' | 'light' };

/** 44pt round button for header actions (back, share, settings, close). */
export function IconButton({ label, onPress, children, tone = 'onBrand' }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className={`h-11 w-11 items-center justify-center rounded-full active:opacity-70 ${tone === 'onBrand' ? 'border border-white/30 bg-white/15' : 'bg-white'}`}
      style={tone === 'light' ? { boxShadow: '0 4px 12px rgba(22,14,51,0.14)' } : undefined}
    >
      {children}
    </Pressable>
  );
}
