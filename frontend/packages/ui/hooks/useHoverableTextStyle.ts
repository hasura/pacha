import { TextProps } from '@mantine/core';

import { useSchemeColors } from './useSchemeColors';

export const useHoverableTextStyle = (props?: { disabled?: boolean }) => {
  const { disabled = false } = props ?? {};
  const { text } = useSchemeColors();

  if (disabled) return {};

  return {
    borderColor: text.dimmed,
    display: 'inline-block',
    borderBottomWidth: 2,
    borderBottomStyle: 'dotted',
    cursor: 'pointer',
  } satisfies TextProps['style'];
};
