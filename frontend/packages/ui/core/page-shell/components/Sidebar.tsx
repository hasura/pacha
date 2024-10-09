import * as React from 'react';
import {
  ActionIcon,
  Box,
  Flex,
  ScrollArea,
  ScrollAreaAutosizeProps,
  StyleProp,
} from '@mantine/core';
import clsx from 'clsx';

import { ExtendedCustomColors } from '@/types';
import { Icons } from '@/ui/icons';
import {
  useIsInPageShell,
  usePageShellContext,
  usePageShellSidebarHeight,
} from '../hooks';

export const Sidebar = ({
  children,
  bg: bgProp,
  scrollAreaProps,
}: {
  children: React.ReactNode | ((height: string) => React.ReactNode);
  bg?: StyleProp<ExtendedCustomColors> | undefined;
  scrollAreaProps?: ScrollAreaAutosizeProps;
}) => {
  useIsInPageShell('Sidebar');

  const { setHasSidebar, sidebarWidth, toggleSidebar, sidebarOpen, bg } =
    usePageShellContext();

  React.useLayoutEffect(() => {
    // this lets other components know that the header is present
    setHasSidebar(true);
    return () => {
      setHasSidebar(false);
    };
  }, []);

  const height = usePageShellSidebarHeight();
  return (
    <Box
      pos={'relative'}
      w={sidebarOpen ? sidebarWidth : 0}
      maw={sidebarWidth}
      bg={bgProp ?? bg}
      className=" transition-all duration-300 ease-in-out"
      style={{
        borderRight: `solid 1px var(--app-shell-border-color)`,
        borderRightWidth: sidebarOpen ? 1 : 0,
      }}
    >
      <Box
        w={sidebarOpen ? sidebarWidth : 0}
        className=" transition-all duration-300 ease-in-out"
        style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        opacity={sidebarOpen ? 1 : 0}
      >
        <ScrollArea.Autosize
          mah={height}
          type="auto"
          scrollbars="y"
          {...scrollAreaProps}
          className="!overflow-x-hidden"
        >
          <Flex direction={'column'} flex={1} mih={height}>
            {typeof children === 'function' ? children(height) : children}
          </Flex>
        </ScrollArea.Autosize>
      </Box>
      <ActionIcon
        pos={'absolute'}
        top={'50%'}
        left={sidebarOpen ? sidebarWidth : 0}
        style={{ transform: 'translate(-50%, -50%)', zIndex: 110 }}
        size={'lg'}
        variant="default"
        radius={'md'}
        onClick={() => toggleSidebar()}
        className="transition-all duration-300 ease-in-out"
        aria-label="toggle-side-bar"
      >
        <Icons.ChevronDoubleLeft
          className={clsx(
            'transition-all duration-700 ease-in-out',
            sidebarOpen ? 'rotate-0' : 'rotate-180'
          )}
          size={22}
        />
      </ActionIcon>
    </Box>
  );
};
