import React from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider as MantineModalsProvider } from '@mantine/modals';
import { Notifications as MantineNotificationsProvider } from '@mantine/notifications';

import { mantineTheme } from './mantineTheme';

export const MantineProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <MantineProvider theme={mantineTheme}>
    <MantineNotificationsProvider />
    <MantineModalsProvider
      modalProps={{
        radius: 'lg',
        centered: true,
        padding: 'lg',
      }}
    >
      {children}
    </MantineModalsProvider>
  </MantineProvider>
);
