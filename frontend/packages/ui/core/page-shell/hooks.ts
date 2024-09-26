import * as React from 'react';
import { rem } from '@mantine/core';

import { APP_SHELL_HEADER_HEIGHT } from '@/ui/constants';
import { MainContext, PageShellContext } from './context';

type PageShellComponent = 'Header' | 'Main' | 'Sidebar' | 'Content' | 'TabBar';

const fullName = (c: PageShellComponent) => `<PageShell.${c} />`;

export const useIsInPageShell = (c: PageShellComponent) => {
  const isInPageShell = React.useContext(PageShellContext);
  if (!isInPageShell) {
    throw new Error(
      `Component ${fullName(c)} was unable to find <PageShell /> in the tree.\n${fullName(c)} should only be used as a child of <PageShell />.`
    );
  }
};

export const useIsInMain = (c: PageShellComponent) => {
  const isInsideMain = React.useContext(MainContext);
  if (!isInsideMain) {
    throw new Error(
      `Component ${fullName(c)} was unable to find <PageShell.Main /> in the tree.\n${fullName(c)} should only be used as a child of <PageShell.Main />.`
    );
  }
};

export function usePageShellContext() {
  const context = React.useContext(PageShellContext);
  if (context === undefined) {
    throw new Error(
      'usePageShellContext must be used within a PageShellContext.Provider'
    );
  }
  return context;
}

export function useMainContext() {
  const context = React.useContext(MainContext);
  if (context === undefined) {
    throw new Error(
      'useMainContext must be used within a MainContext.Provider'
    );
  }
  return context;
}

export function usePageShellContentHeight() {
  const { headerHeight, hasHeader, hasTabBar, tabBarHeight } =
    usePageShellContext();

  return `calc(100vh - ${rem(APP_SHELL_HEADER_HEIGHT)} - ${rem(hasHeader ? headerHeight : 0)} - ${rem(hasTabBar ? tabBarHeight : 0)})`;
}

export function usePageShellSidebarHeight() {
  const { hasTabBar, tabBarHeight } = usePageShellContext();

  return `calc(100vh - ${rem(APP_SHELL_HEADER_HEIGHT)}  - ${rem(hasTabBar ? tabBarHeight : 0)})`;
}
