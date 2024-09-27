import * as React from 'react';
import {
  ContainerProps,
  Flex,
  ScrollArea,
  ScrollAreaAutosizeProps,
  StyleProp,
} from '@mantine/core';

import { ExtendedCustomColors } from '@/types';
import { useSchemeColors } from '@/ui/hooks';
import { ContentContainer } from '../../content-container/ContentContainer';
import {
  useIsInMain,
  useIsInPageShell,
  usePageShellContentHeight,
  usePageShellContext,
} from '../hooks';

const Wrapper = ({
  children,
  contentContainer,
  contentContainerProps,
}: {
  children: React.ReactNode;
  contentContainer?: boolean;
  contentContainerProps?: ContainerProps;
}) => {
  if (contentContainer) {
    return (
      <ContentContainer {...contentContainerProps}>{children}</ContentContainer>
    );
  } else return <>{children}</>;
};

export const Content = ({
  children,
  bg,
  scrollAreaProps,
  ...contentProps
}: {
  children: React.ReactNode | ((height: string) => React.ReactNode);
  bg?: StyleProp<ExtendedCustomColors> | undefined;
  scrollAreaProps?: ScrollAreaAutosizeProps;
  contentContainer?: boolean;
  contentContainerProps?: ContainerProps;
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
        <Wrapper {...contentProps}>
          {typeof children === 'function' ? children(height) : children}
        </Wrapper>
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
        <Wrapper {...contentProps}>
          {typeof children === 'function' ? children(height) : children}
        </Wrapper>
      </Flex>
    </ScrollArea.Autosize>
  );
};
