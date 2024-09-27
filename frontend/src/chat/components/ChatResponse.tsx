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
      maw={'70%'}
      my={'lg'}
      withBorder
      style={{
        whiteSpace: 'pre-wrap',
      }}
      bg={bg.color('red')}
    >
      {data?.message}
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
}: {
  data: NewAiResponse[];
  toolCallResponses: ToolCallResponse[];
  chatBodyWidthConfig: BoxProps['maw'];
  mah: BoxProps['mah'];
  mih: BoxProps['mih'];
  isQuestionPending: boolean;
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
            if (item?.type === 'ai')
              return (
                <AssistantResponse
                  data={item}
                  toolCallResponses={toolCallResponses}
                />
              );

            if (item?.type === 'self') return <SelfMessageBox data={item} />;
            if (item?.type === 'error') return <ErrorMessage data={item} />;
            if (item?.type === 'user_confirmation')
              return (
                <ActionAuthorizeCard
                  data={item}
                  hasNextAiMessage={!!data?.[index + 1]}
                />
              );
            return null;
          })}
          {isQuestionPending && <Loader type="dots" />}
          {!isQuestionPending && isLastMessageFromAi && <PachaFeedback />}
          {data?.length ? null : <PachaChatBanner />}
        </Stack>
      </Box>
    </ScrollArea.Autosize>
  );
};

export default ChatResponse;
