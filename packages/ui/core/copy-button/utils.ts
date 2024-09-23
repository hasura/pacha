export const codeStyleProps = (isDarkMode: boolean) => ({
  ...(isDarkMode ? { color: 'gray' } : { c: 'gray.9', bg: 'gray.2' }),
  variant: 'light',
  radius: 'sm',
  size: 'sm',
  ff: 'monospace',
  fw: 'normal',
});
