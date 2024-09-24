import { Flex, TabsListProps, TabsPanelProps, TabsProps } from '@mantine/core';

import { useSchemeColors } from '@/ui/hooks';

export function useFullScreenTabsProps() {
  const { bg } = useSchemeColors();
  return {
    TabsProps: {
      variant: 'default',
      defaultValue: 'visualization',
      display: 'flex',
      flex: 1,
      style: { flexDirection: 'column' },
      radius: 'md',
    } satisfies TabsProps,
    TabListProps: {
      px: 'sm',
      pt: 'sm',
      bg: bg.level1,
    } satisfies Omit<TabsListProps, 'children'>,
    TabsPanelProps: {
      component: Flex,
      flex: 1,
    } satisfies Omit<TabsPanelProps, 'children' | 'value'> & { component: any },
  };
}
