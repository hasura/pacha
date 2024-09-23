import React from 'react';
import { Tabs, TabsProps, useMantineTheme } from '@mantine/core';
import { To, useNavigate } from 'react-router-dom';

import { Icons } from '@/ui/icons';
import { useIsInPageShell, usePageShellContext } from '../hooks';

export type PageShellTab = {
  title: string;
  icon?: keyof typeof Icons;
  isActive: boolean;

  // optionall handle click
  onClick?: () => void;
  // optionally pass navigation
  to?: To;
} & ({ onClick: () => void } | { to: To }); // require either onClick or to

export type PageShellTabBarProps = {
  tabs: PageShellTab[];
  color?: TabsProps['color'];
  radius?: TabsProps['radius'];
};
export const TabBar = ({ tabs, ...rest }: PageShellTabBarProps) => {
  useIsInPageShell('TabBar');

  const { primaryColor } = useMantineTheme();
  const { setHasTabBar, tabBarHeight } = usePageShellContext();

  React.useLayoutEffect(() => {
    // this lets other components know that the header is present
    setHasTabBar(true);
    return () => {
      setHasTabBar(false);
    };
  }, []);

  const navigate = useNavigate();

  return (
    <Tabs
      variant="default"
      value={tabs.find(t => t.isActive)?.title}
      radius={0}
      {...rest}
    >
      <Tabs.List h={tabBarHeight} bg={`var(--mantine-color-background-2)`}>
        {tabs.map(tab => {
          const Icon = tab.icon ? Icons[tab.icon] : null;
          return (
            <Tabs.Tab
              key={tab.title}
              value={tab.title}
              fz={'md'}
              fw={tab.isActive ? 500 : 400}
              c={tab.isActive ? primaryColor : undefined}
              leftSection={Icon && <Icon />}
              onClick={() => {
                // always navigate if to is present
                if (tab.to) {
                  navigate(tab.to);
                }

                // always call onClick if present
                tab.onClick?.();
              }}
            >
              {tab.title}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Tabs>
  );
};
