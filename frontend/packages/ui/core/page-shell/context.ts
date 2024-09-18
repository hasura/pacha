import * as React from 'react';
import { StyleProp } from '@mantine/core';

import { ExtendedCustomColors } from '@/types';

export const PageShellContext = React.createContext<
  | {
      headerHeight: string | number;
      tabBarHeight: string | number;
      sidebarWidth: string | number;
      toggleSidebar: () => void;
      sidebarOpen: boolean;
      bg: StyleProp<ExtendedCustomColors>;
      scrollClamp: boolean;
      hasSidebar: boolean;
      setHasSidebar: (x: boolean) => void;
      hasHeader: boolean;
      setHasHeader: (x: boolean) => void;
      hasTabBar: boolean;
      setHasTabBar: (x: boolean) => void;
    }
  | undefined
>(undefined);

export const MainContext = React.createContext<boolean | undefined>(undefined);
