import React, { useEffect, useMemo, useRef } from 'react';

import { Box, BoxProps, Loader, Paper, ScrollArea, Stack } from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import {
  ErrorResponseType,
  NewAiResponse,
  SelfMessage,
  ToolCallResponse,
} from '../types';
import ActionAuthorizeCard from './ActionAuthorizeCard';
import AssistantResponse from './AssistantResponse';
import PachaChatBanner from './PachaChatBanner';
import PachaFeedback from './PachaFeedback';

export function SelfMessageBox({ data }: { data: SelfMessage }) {
  const { bg } = useSchemeColors();
  return (
    <Paper
      style={{
        alignSelf: 'flex-end',
        whiteSpace: 'pre-wrap',
      }}
      maw={'70%'}
      my={'lg'}
      withBorder
      bg={bg.color('indigo')}
      p={'md'}
    >
      {data?.message}
    </Paper>
  );
}

export function ErrorMessage({ data }: { data: ErrorResponseType }) {
  const { bg } = useSchemeColors();
  return (
    <Paper
      style={{
        whiteSpace: 'pre-wrap',
      }}
      my={'lg'}
      withBorder
      p={'md'}
      bg={bg.color('red')}
    >
      {data?.message ??
        `An unexpected error occurred. The server did not provide specific details, but you can try the following steps:

	•	Check your network connection.
	•	Try refreshing the page or submitting the request again.
	•	If the problem persists, please contact support with the steps that led to this error.`}
    </Paper>
  );
}

const ChatResponse = ({
  data,
  toolCallResponses,
  chatBodyWidthConfig,
  isQuestionPending,
  mih,
  mah,
  error,
}: {
  data: NewAiResponse[];
  toolCallResponses: ToolCallResponse[];
  chatBodyWidthConfig: BoxProps['maw'];
  mah: BoxProps['mah'];
  mih: BoxProps['mih'];
  isQuestionPending: boolean;
  error?: Error | null;
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isLastMessageFromAi = useMemo(() => {
    const lastMessage = data[data.length - 1];
    return lastMessage?.type === 'ai';
  }, [data]);

  useEffect(() => {
    if (scrollAreaRef.current && bodyRef.current) {
      bodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [data]);

  return (
    <ScrollArea.Autosize
      type="hover"
      w={'100%'}
      flex={1}
      mah={mah}
      mih={mih}
      ref={scrollAreaRef}
      style={{ flex: 1, overflow: 'auto' }}
    >
      <Box
        id="chat-body"
        ref={bodyRef}
        maw={chatBodyWidthConfig}
        w={'100%'}
        m={'auto'}
      >
        <Stack gap={0}>
          {data.map((item, index) => {
            const key = `${item.type}-${index}`;
            if (item?.type === 'ai')
              return (
                <AssistantResponse
                  data={item}
                  key={key}
                  toolCallResponses={toolCallResponses}
                />
              );

            if (item?.type === 'self')
              return <SelfMessageBox data={item} key={key} />;
            if (item?.type === 'error')
              return <ErrorMessage data={item} key={key} />;
            if (item?.type === 'user_confirmation')
              return (
                <ActionAuthorizeCard
                  data={item}
                  key={key}
                  hasNextAiMessage={!!data?.[index + 1]}
                />
              );
            return null;
          })}
          {isQuestionPending && <Loader type="dots" />}
          {!isQuestionPending && isLastMessageFromAi && (
            <PachaFeedback data={data} />
          )}
          {data?.length ? null : <PachaChatBanner />}
          {error ? (
            <ErrorMessage
              data={{
                message: error?.message,
                type: 'error',
                responseMode: 'history',
              }}
            />
          ) : null}
        </Stack>
      </Box>
    </ScrollArea.Autosize>
  );
};

export default ChatResponse;
