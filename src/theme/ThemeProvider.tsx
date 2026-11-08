import { vars } from 'nativewind';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { DEFAULT_THEME, findUniversity, type Theme, type University } from '@/theme/universities';

type ThemeContextValue = {
  theme: Theme;
  /** The campus the theme comes from, or null for CampusLoop's default look. */
  university: University | null;
  /**
   * Shows another campus's theme without changing the account, e.g. while picking a
   * university at sign-up. Pass DEFAULT_THEME_ID for the default look, null to stop.
   */
  previewTheme: (universityId: string | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** "#2B1A5A" -> "43 26 90", the form Tailwind's `<alpha-value>` colours expect. */
function channels(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

export function ThemeProvider({ universityId, children }: { universityId: string | null; children: ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  const university = findUniversity(preview ?? universityId);
  const theme = university?.theme ?? DEFAULT_THEME;

  // Drives the themed classes (`bg-brand`, `bg-loop`, `bg-soft`…) in tailwind.config.js.
  const style = useMemo(
    () =>
      vars({
        '--brand': channels(theme.brand),
        '--brand-deep': channels(theme.brandDeep),
        '--accent': channels(theme.accent),
        '--highlight': channels(theme.highlight),
        '--third': channels(theme.third),
        '--soft': channels(theme.soft),
        '--tint': channels(theme.tint),
      }),
    [theme],
  );

  const value = useMemo(() => ({ theme, university, previewTheme: setPreview }), [theme, university]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
