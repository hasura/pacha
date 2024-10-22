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
import { testId } from '@/utils/js-utils';
import { Thread } from '../data/api-types';
import { usePachaChatContext } from '../PachaChatContext';
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

  const {
    pachaEndpoint,
    setPachaEndpoint,
    authToken,
    setAuthToken,
    mode,
    routes,
  } = usePachaChatContext();

  const handleOpenPachaSettings = () => {
    modals.open({
      id: 'pacha-settings',
      title: 'PromptQL Playground Settings',
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
          {mode === 'local' ? (
            <Group pl={'md'} py={'md'}>
              <Text size="sm" fw={600}>
                PromptQl Playground
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
          ) : null}
          <Divider />
          <Group justify="center" mt={'md'}>
            <Button
              leftSection={<ChatIcons.NewChat />}
              variant="light"
              w="100%"
              mx="md"
              onClick={() => {
                navigate({
                  pathname: routes.newChat,
                  search: createSearchParams({}).toString(), // to clear the search params
                });
              }}
              data-testid={testId({
                feature: 'promptql-history-sidebar',
                id: 'start-new-chat',
              })}
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
                  const pathname = routes.chatThreadLink(threadId);
                  navigate(
                    {
                      pathname,
                      search: createSearchParams({}).toString(),
                    },
                    { replace: true }
                  );
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
