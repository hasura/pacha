import {
  useLocalStorage as useMantineLocalStorage,
  useSessionStorage as useMantineSessionStorage,
} from '@mantine/hooks';

// derive the parameter type from the original function
type PropsType<T = string> = Parameters<typeof useMantineLocalStorage<T>>[0];

// omit the getInitialValueInEffect parameter from the original type
export type StorageHookProps<T> = Omit<PropsType<T>, 'getInitialValueInEffect'>;

// creating wrappers that hard code the getInitialValueInEffect to false as this
// setting is a source of bugs when enabled, and it's enabled by default in the source

export function useLocalStorage<T = string>(props: StorageHookProps<T>) {
  return useMantineLocalStorage<T>({
    ...props,
    getInitialValueInEffect: false,
  });
}

export function useSessionStorage<T = string>(props: StorageHookProps<T>) {
  return useMantineSessionStorage<T>({
    ...props,
    getInitialValueInEffect: false,
  });
}
