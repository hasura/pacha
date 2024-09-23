import * as React from 'react';
import {
  Flex,
  ScrollArea,
  ScrollAreaAutosizeProps,
  StyleProp,
} from '@mantine/core';

import { ExtendedCustomColors } from '@/types';
import { useSchemeColors } from '@/ui/hooks';
import {
  useIsInMain,
  useIsInPageShell,
  usePageShellContentHeight,
  usePageShellContext,
} from '../hooks';

export const Content = ({
  children,
  bg,
  scrollAreaProps,
}: {
  children: React.ReactNode | ((height: string) => React.ReactNode);
  bg?: StyleProp<ExtendedCustomColors> | undefined;
  scrollAreaProps?: ScrollAreaAutosizeProps;
}) => {
  useIsInMain('Content');
  useIsInPageShell('Content');

  const { bg: schemeBg } = useSchemeColors();
  const { scrollClamp } = usePageShellContext();

  const height = usePageShellContentHeight();

  if (scrollClamp) {
    return (
      <Flex
        bg={bg ?? schemeBg.level3}
        direction={'column'}
        flex={1}
        mih={height}
        h={height}
        mah={height}
        style={{ overflow: 'hidden' }}
      >
        {typeof children === 'function' ? children(height) : children}
      </Flex>
    );
  }

  return (
    <ScrollArea.Autosize
      mah={height}
      bg={bg ?? schemeBg.level3}
      {...scrollAreaProps}
    >
      <Flex direction={'column'} flex={1} mih={height}>
        {typeof children === 'function' ? children(height) : children}
      </Flex>
    </ScrollArea.Autosize>
  );
};
