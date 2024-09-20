import * as React from 'react';
import { Group, MantineStyleProps, Stack, StyleProp } from '@mantine/core';

import { ExtendedCustomColors } from '@/types';
import {
  APP_SHELL_HEADER_HEIGHT,
  PAGE_SHELL_TAB_BAR_HEIGHT,
} from '@/ui/constants';
import { useDisclosure, useSchemeColors } from '@/ui/hooks';
import { Content } from './components/Content';
import { Header } from './components/Header';
import { Main } from './components/Main';
import { Sidebar } from './components/Sidebar';
import { PageShellTab, TabBar } from './components/TabBar';
import { PageShellContext } from './context';

type PageShellProps = {
  headerHeight?: string | number;
  tabBarHeight?: string | number;
  sidebarWidth?: string | number;
  children: React.ReactNode;
  sideBarHeaderBg?: StyleProp<ExtendedCustomColors>;
  scrollClamp?: boolean;
  height?: MantineStyleProps['h'];
  tabs?: PageShellTab[];
};
export function PageShell({
  headerHeight = APP_SHELL_HEADER_HEIGHT,
  tabBarHeight = PAGE_SHELL_TAB_BAR_HEIGHT,
  children,
  sidebarWidth = '20vw',
  sideBarHeaderBg,
  scrollClamp = false,
  height = '100%',
  tabs = [],
}: PageShellProps) {
  const [sidebarOpen, { toggle }] = useDisclosure(true);
  const { bg } = useSchemeColors();
  const [hasHeader, setHasHeader] = React.useState(false);
  const [hasSidebar, setHasSidebar] = React.useState(false);
  const [hasTabBar, setHasTabBar] = React.useState(false);

  return (
    <PageShellContext.Provider
      value={{
        headerHeight,
        tabBarHeight,
        sidebarWidth,
        toggleSidebar: toggle,
        sidebarOpen: sidebarOpen,
        bg: sideBarHeaderBg ?? bg.level1,
        scrollClamp,
        hasHeader,
        setHasHeader,
        hasSidebar,
        setHasSidebar,
        hasTabBar,
        setHasTabBar,
      }}
    >
      <Stack id="page-shell-root" gap={0} h={height} w={'100%'}>
        {tabs.length > 0 && <TabBar tabs={tabs} />}
        <Group gap={0} align="stretch" flex={1} w={'100%'}>
          {children}
        </Group>
      </Stack>
    </PageShellContext.Provider>
  );
}

PageShell.Sidebar = Sidebar;

PageShell.Main = Main;

PageShell.Header = Header;

PageShell.Content = Content;
