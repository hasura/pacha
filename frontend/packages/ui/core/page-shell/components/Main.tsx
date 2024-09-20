import * as React from 'react';
import { Flex } from '@mantine/core';

import { MainContext } from '../context';
import { useIsInPageShell } from '../hooks';

export const Main = ({ children }: { children: React.ReactNode }) => {
  useIsInPageShell('Main');

  return (
    <MainContext.Provider value={true}>
      <Flex id="page-shell-main" direction={'column'} w={'100%'} flex={1}>
        {children}
      </Flex>
    </MainContext.Provider>
  );
};
