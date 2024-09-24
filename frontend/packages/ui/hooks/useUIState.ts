import { useDeferredValue, useState } from 'react';
import { useLocalStorage } from '@mantine/hooks';

/**
 *
 * Provides a state value that can be used in the UI and a deferred value that can be passed to expensive operations or renders.
 *
 * @param defaultValue
 * @returns [uiState, setUIState, deferredValue]
 */
export function useUIState<T>(defaultValue: T) {
  const [uiState, setUIState] = useState<T>(defaultValue);

  const deferredValue = useDeferredValue(uiState);

  return [uiState, setUIState, deferredValue] as const;
}

export type UIState<T> = ReturnType<typeof useUIState<T>>;

/**
 *
 * Provides a state value that can be used in the UI and a deferred value that can be passed to expensive operations or renders.
 * Stores the state value in local storage.
 *
 * @param defaultValue
 * @returns [uiState, setUIState, deferredValue]
 */
export function useStoredUIState<T>(defaultValue: T, key: string) {
  const [uiState, setUIState] = useLocalStorage<T>({
    key,
    defaultValue,
  });

  const deferredValue = useDeferredValue(uiState);

  return [uiState, setUIState, deferredValue] as const;
}
