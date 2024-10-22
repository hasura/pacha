import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from '@console/ui/common';

import {
  ActionIcon,
  GenericError,
  Grid,
  Group,
  PageShell,
  Popover,
  rem,
  Stack,
  Textarea,
  Tooltip,
  usePageShellContext,
} from '@/ui/core';
import { useDisclosure, useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import Artifacts from './components/Artifacts';
import ChatResponse from './components/ChatResponse';
import PachaChatHistorySidebar from './components/PachaChatHistorySidebar';
import PlaygroundHeaders from './components/PlaygroundHeaders';
import PachaChatProvider from './PachaChat.Provider';
import { usePachaChatContext } from './PachaChatContext';
import usePachaChatV2 from './usePachaChatV2';

const handleTextareaEnterKey =
  (callback: (e: React.KeyboardEvent) => void) =>
  (event: React.KeyboardEvent) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey && // skip shift + Enter
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      callback(event);
    }
  };

const WIDTH_CONFIG = {
  MAX: {
    md: '30rem',
    lg: '35rem',
    xl: '55rem',
    xxl: '50rem',
  },
  SMALL: {
    md: '30rem',
    lg: '35rem',
    xl: '37rem',
    xxl: '50rem',
  },
  MEDIUM: {
    md: '30rem',
    lg: '38rem',
    xl: '45rem',
    xxl: '50rem',
  },
};

export const Chat = () => {
  const {
    data,
    sendMessage,
    loading: isQuestionPending,
    toolCallResponses,
    threads,
    isThreadsLoading,
    artifacts,
    error,
    threadsError,
    threadId,
  } = usePachaChatV2();

  const [message, setMessage] = useState('');
  const { sidebarOpen } = usePageShellContext();
  const [textareaHeight, setTextareaHeight] = useState(100);
  const textareaRef = useRef<HTMLDivElement | null>(null);

  const {
    isMinimized,
    setIsMinimized,
    setHeadersRef,
    headersRef: headers,
  } = usePachaChatContext();
  const [opened, { toggle, close }] = useDisclosure(false);

  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      setTextareaHeight(textareaRef.current.scrollHeight);
    }
  };

  useEffect(() => {
    updateTextareaHeight();
  }, [message]);
  const { bg } = useSchemeColors();

  function handleSendMessage() {
    if (!message) return;

    sendMessage(message, headers?.current ?? {});
    setHeadersRef({});
    setMessage('');
    close(); // Close the popup
  }

  const chatBodyWidthConfig = useMemo(() => {
    if (artifacts?.length > 0 && sidebarOpen) {
      // when you have artifacts, and sidebar is open

      if (isMinimized) {
        // but if user minimized the artifacts section, assign more width to chat body
        return WIDTH_CONFIG.MAX;
      }
      // assign less width to chat body
      return WIDTH_CONFIG.SMALL;
    }

    return WIDTH_CONFIG.MEDIUM;
  }, [artifacts?.length, sidebarOpen, isMinimized]);

  const showWide = !artifacts?.length || isMinimized;

  const canShowHeaders = !data.length && !error && !threadId; // when there is no data, no error and new thread mode

  return (
    <>
      <PachaChatHistorySidebar
        threads={threads}
        isThreadsLoading={isThreadsLoading}
        threadsError={threadsError}
      />
      <PageShell.Main>
        <PageShell.Content>
          {height => (
            <Grid overflow="hidden">
              <Grid.Col
                span={showWide ? 12 : 6}
                style={{
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Stack mah={height} gap={0} flex={1} pos={'relative'}>
                  {/* Main Chat Body: */}
                  <ChatResponse
                    chatBodyWidthConfig={chatBodyWidthConfig}
                    data={data}
                    mah={`calc(${height} - ${textareaHeight - 10}px)`}
                    mih={
                      data?.length
                        ? `calc(${height} - ${textareaHeight - 10}px)`
                        : '500px'
                    }
                    toolCallResponses={toolCallResponses}
                    isQuestionPending={isQuestionPending}
                    error={error}
                  />
                  {/* Message Input: */}
                  <Popover position="top" opened={opened && canShowHeaders}>
                    <Popover.Target>
                      <Stack h={`${textareaHeight + 10}px`} justify="center">
                        <Group
                          w={'100%'}
                          justify="center"
                          p={'md'}
                          ref={textareaRef}
                        >
                          <Textarea
                            mb={'xl'}
                            variant="filled"
                            size="xl"
                            placeholder={
                              isQuestionPending
                                ? 'Generating response...'
                                : 'Act with your data 🙌'
                            }
                            styles={{
                              input: {
                                fontSize: 16,
                                backgroundColor: bg.level1,
                              },
                            }}
                            disabled={isQuestionPending}
                            w="100%"
                            maw={chatBodyWidthConfig}
                            radius="xl"
                            value={isQuestionPending ? '' : message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={handleTextareaEnterKey(() => {
                              handleSendMessage();
                            })}
                            leftSection={
                              canShowHeaders ? (
                                <Tooltip label="Set up your DDN headers and authorization before initiating the conversation. These settings will be applied to all future messages in this thread.">
                                  <ActionIcon
                                    radius={'xl'}
                                    size={'lg'}
                                    variant="transparent"
                                    onClick={toggle}
                                  >
                                    <Icons.Headers size={20} />
                                  </ActionIcon>
                                </Tooltip>
                              ) : null
                            }
                            rightSection={
                              <ActionIcon
                                loading={isQuestionPending}
                                onClick={() => {
                                  handleSendMessage();
                                }}
                                disabled={!message}
                                radius={'xl'}
                                size={'lg'}
                              >
                                <Icons.ArrowUp size={20} />
                              </ActionIcon>
                            }
                            autosize
                            maxRows={6}
                            minRows={1}
                          />
                        </Group>
                      </Stack>
                    </Popover.Target>
                    <Popover.Dropdown
                      maw={{
                        md: '40rem',
                        lg: '50rem',
                        xl: '53rem',
                      }}
                      w={'100%'}
                      style={{
                        zIndex: 200, // keeping it lesser than modal so that the modals would still appear on top
                      }}
                    >
                      <PlaygroundHeaders />
                    </Popover.Dropdown>
                  </Popover>
                </Stack>
              </Grid.Col>
              <Artifacts
                artifacts={artifacts}
                height={height}
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
              />
            </Grid>
          )}
        </PageShell.Content>
      </PageShell.Main>
    </>
  );
};

export const ChatPageShell = ({ mode }: { mode: 'cloud' | 'local' }) => {
  return (
    <PageShell headerHeight={50} sidebarWidth={rem(250)}>
      <ErrorBoundary
        errorHandler={err => <GenericError message={err?.message ?? ''} />}
      >
        <PachaChatProvider mode={mode}>
          <Chat />
        </PachaChatProvider>
      </ErrorBoundary>
    </PageShell>
  );
};

export default ChatPageShell;
