import * as React from 'react';
import { Group, MantineStyleProps, StyleProp } from '@mantine/core';

import { ExtendedCustomColors } from '@/types';
import { useIsInMain, useIsInPageShell, usePageShellContext } from '../hooks';

export const Header = ({
  children,
  bg: bgProp,
  ...rest
}: {
  children: React.ReactNode;
  bg?: StyleProp<ExtendedCustomColors> | undefined;
} & Omit<MantineStyleProps, 'bg' | 'style' | 'h'>) => {
  useIsInMain('Header');
  useIsInPageShell('Header');

  const { headerHeight, bg, setHasHeader } = usePageShellContext();

  React.useLayoutEffect(() => {
    // this lets other components know that the header is present
    setHasHeader(true);
    return () => {
      setHasHeader(false);
    };
  }, []);

  return (
    <Group
      bg={bgProp ?? bg}
      style={{ borderBottom: `1px solid var(--app-shell-border-color)` }}
      h={headerHeight}
      {...rest}
    >
      {children}
    </Group>
  );
};
