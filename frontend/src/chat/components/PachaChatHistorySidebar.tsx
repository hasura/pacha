import { useContext } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';

import {
  ActionIcon,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  PageShell,
  ScrollArea,
  Stack,
  Text,
} from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import { ChatIcons, Icons } from '@/ui/icons';
import { modals } from '@/ui/modals';
import { Thread } from '../data/api-types';
import { PachaChatContext } from '../PachaChatContext';
import { HistoryGroup } from './HistoryItem';
import { PachaChatSettingsForm } from './PachaChatSettingsForm';
import PachaConnectionIndicator from './PachaConnectionIndicator';

const PachaChatHistorySidebar = ({
  threads,
  isThreadsLoading,
  threadsError,
}: {
  threads: Thread[];
  isThreadsLoading: boolean;
  threadsError: Error | null;
}) => {
  const navigate = useNavigate();
  const { bg } = useSchemeColors();

  const { pachaEndpoint, setPachaEndpoint, authToken, setAuthToken } =
    useContext(PachaChatContext);

  const handleOpenPachaSettings = () => {
    modals.open({
      id: 'pacha-settings',
      title: 'Pacha Settings',
      children: (
        <PachaChatSettingsForm
          pachaEndpoint={pachaEndpoint}
          setPachaEndpoint={setPachaEndpoint}
          authToken={authToken}
          setAuthToken={setAuthToken}
        />
      ),
    });
  };

  return (
    <PageShell.Sidebar bg={bg.level1}>
      {contentHeight => (
        <ScrollArea.Autosize mah={contentHeight}>
          <Group pl={'md'} py={'md'}>
            <Text size="sm" fw={600}>
              Pacha Chat
            </Text>
            <ActionIcon
              variant="subtle"
              size="xs"
              color="dimmed"
              onClick={handleOpenPachaSettings}
            >
              <Icons.Settings />
            </ActionIcon>
            <PachaConnectionIndicator onClick={handleOpenPachaSettings} />
          </Group>
          <Divider />
          <Group justify="center" mt={'md'}>
            <Button
              leftSection={<ChatIcons.NewChat />}
              variant="light"
              w="100%"
              mx="md"
              onClick={() => {
                navigate({
                  pathname: '/chat',
                  search: createSearchParams({}).toString(), // to clear the search params
                });
              }}
            >
              Start New Chat
            </Button>
          </Group>
          <Stack gap={'xl'} py={'md'} pos={'relative'}>
            {isThreadsLoading && <LoadingOverlay />}
            {!isThreadsLoading && (
              <HistoryGroup
                timeUnit={'History'}
                onHistoryItemClick={threadId => {
                  navigate({
                    pathname: `/chat/thread/${threadId}`,
                    search: createSearchParams({}).toString(),
                  });
                }}
                items={(threads ?? [])
                  .map(thread => ({
                    title: thread.title,
                    threadId: thread.thread_id,
                  }))
                  ?.reverse()}
                error={threadsError}
              />
            )}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </PageShell.Sidebar>
  );
};

export default PachaChatHistorySidebar;
