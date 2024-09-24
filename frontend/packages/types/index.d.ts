// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type ExtendedCustomColors = 'slate' | 'ruby' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
