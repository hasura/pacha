import { AppShell, Group, rem } from '@mantine/core';

import { PROJECT_APP_SHELL_NAVBAR_WIDTH } from '@/ui/constants';
import { Icons } from '@/ui/icons';
import { ChatPageShell } from './chat/ChatV2';
import PachaChatProvider from './chat/PachaChat.Provider';

export const ChatAppShell = () => {
  return (
    <PachaChatProvider>
      <AppShell
        navbar={{
          width: 0,
          breakpoint: 0,
        }}
      >
        <AppShell.Header bg={'var(--mantine-color-background-2)'}>
          <Group w={'100%'} h={'100%'} pl={0} pr={'sm'}>
            <Group
              w={PROJECT_APP_SHELL_NAVBAR_WIDTH}
              h={'100%'}
              justify="center"
            >
              <Icons.Hasura />
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main>
          <ChatPageShell />
        </AppShell.Main>
      </AppShell>
    </PachaChatProvider>
  );
};
