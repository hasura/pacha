import React from 'react';
import { useMantineColorScheme, type MantineColorScheme } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

const COLOR_SCHEME_STORAGE_KEY = 'darkMode';

export const useStoredColorScheme = () => {
  const stateTuple = useLocalStorage<MantineColorScheme>({
    key: COLOR_SCHEME_STORAGE_KEY,
    defaultValue: 'light',
  });

  return stateTuple;
};

export const setColorSchemeClasses = (scheme: MantineColorScheme) => {
  if (scheme === 'dark') {
    // add class "dark" to <html> element https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
    document.querySelector('html')?.classList.add('dark');
  } else {
    // remove class "dark" to <html> element https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
    document.querySelector('html')?.classList.remove('dark');
  }
};

export const useColorScheme = () => {
  const { setColorScheme } = useMantineColorScheme();
  const [colorSchemeStored, setColorSchemeStored] = useStoredColorScheme();

  const isDarkMode = colorSchemeStored === 'dark';
  const isLightMode = colorSchemeStored === 'light';

  const toggleColorScheme = React.useCallback(
    (manualValue?: 'dark' | 'light' | boolean) => {
      let newValue: MantineColorScheme =
        colorSchemeStored === 'light' ? 'dark' : 'light';

      if (typeof manualValue !== 'undefined') {
        if (typeof manualValue === 'boolean') {
          // support an "isDarkMode" boolean
          newValue = manualValue ? 'dark' : 'light';
        } else {
          // support a manual string value
          newValue = manualValue;
        }
      }

      setColorSchemeStored(newValue);
      setColorScheme(newValue);

      setColorSchemeClasses(newValue);
    },
    [colorSchemeStored, setColorScheme, setColorSchemeStored]
  );

  return {
    isDarkMode,
    isLightMode,
    colorScheme: colorSchemeStored ?? 'light',
    toggleColorScheme,
  };
};
