import { MantineColorsTuple, useMantineTheme } from '@mantine/core';

import { ExtendedCustomColors } from '@/types';
import { useColorScheme } from './useColorScheme';

// use this function to create shortcuts for colors that need to change based on the color scheme
export function useSchemeColors() {
  const { isDarkMode } = useColorScheme();
  const { colors } = useMantineTheme();

  return staticSchemeColors(isDarkMode, colors);
}

export const staticSchemeColors = (
  isDarkMode: boolean,
  colors: Record<ExtendedCustomColors, MantineColorsTuple>
) => ({
  bg: {
    level1: 'var(--mantine-color-background-1)',
    level2: 'var(--mantine-color-background-2)',
    level3: 'var(--mantine-color-background-3)',
    level4: 'var(--mantine-color-background-4)',
    monochrome: isDarkMode ? '#000' : '#fff',
    // this approach is modeled after the way the the <Alert /> component uses the bg color
    color: (color: ExtendedCustomColors) =>
      `var(--mantine-color-${color}-light)`,
  },
  text: {
    normal: 'var(--mantine-color-text)',
    muted: isDarkMode ? colors.gray[5] : colors.gray[7],
    gray: isDarkMode ? colors.gray[0] : colors.gray[9],
    dimmed: isDarkMode ? colors.gray[6] : colors.gray[8],
    highContrast: (color: ExtendedCustomColors) =>
      `var(--mantine-color-${color}-${isDarkMode ? 1 : 9})`,
  },
  border: {
    default: 'var(--mantine-color-default-border)',
    color: (color: ExtendedCustomColors) => {
      return `var(--mantine-color-${color}-${isDarkMode ? 8 : 2})`;
    },
  },
  scopeColor: {
    project: 'indigo',
    build: 'violet',
  },
});
