import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useConsoleParams } from '@/routing';
import { ServerEvent } from './data/Api-Types-v3';
import { usePachaLocalChatClient, useThreads } from './data/hooks';
import { usePachaChatContext } from './PachaChatContext';
import { NewAiResponse, ToolCall, ToolCallResponse } from './types';
import { extractModifiedArtifacts, processMessageHistory } from './utils';

const usePachaChatV2 = () => {
  const { threadId } = useConsoleParams();

  const [toolCallResponses, setToolCallResponses] = useState<
    ToolCallResponse[]
  >([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const currentThreadId = useRef<string | undefined>();

  const localChatClient = usePachaLocalChatClient();
  const {
    threads,
    isThreadsLoading,
    threadsError,
    refetchThreads,
    data,
    setRawData,
  } = usePachaChatContext();

  useEffect(() => {
    // when the user navigates to a new thread, load the new thread

    // if threadId is the same as the current threadId, do nothing
    if (threadId === currentThreadId.current) return;

    if (!threadId) {
      // if threadId is undefined, clear the chat history
      // user is at the chat home page
      setRawData([]);
      setLoading(false);
      currentThreadId.current = undefined;
      return;
    }

    if (threadId) {
      // if threadId is defined, reset the chat history
      setRawData([]);
      setLoading(true);
      setError(null);

      currentThreadId.current = threadId;
      // load the chat history for the new thread
      localChatClient
        .getThread({ threadId })
        .then(data => {
          const { history, toolcallResponses } = processMessageHistory(data);
          setRawData(history);
          setToolCallResponses(toolcallResponses);
          return data;
        })
        .catch(err => {
          const error = {
            ...err,
            message: `Error loading chat thread:${threadId}: ${err.message}`,
          };
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [threadId, localChatClient, navigate, refetchThreads]);

  const handleWsEvents = useCallback(
    (event: ServerEvent, lastMessage?: ServerEvent) => {
      if (event.type === 'completion') {
        return;
      }

      // TODO handling full ecents (ignoring chunks/data buffering for now)
      if (event.type === 'assistant_message_response') {
        setRawData(prevData => {
          const newData = {
            message: event?.message_chunk,
            assistant_action_id: event.assistant_action_id,
            type: 'ai',
            tool_calls: [] as ToolCall[],
            threadId: threadId ?? null,
            responseMode: 'stream',
          } as NewAiResponse;
          const newMessages = [...prevData, newData];
          return newMessages;
        });
      }
      if (event.type === 'assistant_code_response') {
        setRawData(prevData => {
          const newMessages = [...prevData];

          // find the assistant message with id
          // const assistantMessageIndex= prevData?.findIndex(prev=>prev.type==='ai' && prev.assistant_action_id===event.assistant_action_id)
          // newMessages[assistantMessageIndex]={

          newMessages[newMessages?.length - 1] = {
            ...prevData[newMessages?.length - 1],
            assistant_action_id: event.assistant_action_id,
            threadId: threadId ?? null,
            type: 'ai',
            tool_calls: [
              {
                call_id: event.code_block_id,
                input: {
                  python_code: event.code_chunk,
                },
              } as ToolCall,
            ],
          };
          return newMessages;
        });
      }
      if (event.type === 'code_output') {
        setToolCallResponses(prev => {
          const newResponses = [...prev];
          const currentToolRespIndex = prev?.findIndex(i => {
            if (i.call_id === event.code_block_id) return true;
          });

          if (currentToolRespIndex >= 0) {
            // partial code output found, need to merge with the existing partial the response
            newResponses[currentToolRespIndex] = {
              call_id: event.code_block_id,
              output: {
                output: `${newResponses[currentToolRespIndex]?.output?.output ?? ''}${event.output_chunk}`,
                error: null,
                sql_statements: [],
                modified_artifacts: [],
              },
            } as ToolCallResponse;
            return newResponses;
          } else {
            // first time code output, create a new tool response entry
            return [
              ...prev,
              {
                call_id: event.code_block_id,
                output: {
                  output: event.output_chunk,
                  error: null,
                  sql_statements: [],
                  modified_artifacts: [],
                },
              },
            ] as ToolCallResponse[];
          }

          return newResponses;
        });
      }
      if (event.type === 'code_error') {
        setToolCallResponses(prev => {
          const newResponses = [...prev];
          const currentToolRespIndex = prev?.findIndex(i => {
            if (i.call_id === event.code_block_id) return true;
          });

          if (currentToolRespIndex >= 0) {
            // partial code output found, need to merge with the existing partial the response
            newResponses[currentToolRespIndex] = {
              call_id: event.code_block_id,
              output: {
                ...newResponses[currentToolRespIndex]?.output,
                error: event.error,
              },
            } as ToolCallResponse;
            return newResponses;
          } else {
            // first time code output, create a new tool response entry
            return [
              ...prev,
              {
                call_id: event.code_block_id,
                output: {
                  output: '',
                  error: event.error,
                  sql_statements: [],
                  modified_artifacts: [],
                },
              },
            ] as ToolCallResponse[];
          }

          return newResponses;
        });
      }
    },
    [threadId, setRawData, setToolCallResponses]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      setLoading(true);
      setError(null);

      setRawData(prevData => {
        const newMessages = [
          ...prevData,
          {
            message,
            type: 'self',
            threadId,
            responseMode: 'stream',
          } as NewAiResponse,
        ];
        return newMessages;
      });

      return await localChatClient.createChatStreamReaderV2({
        threadId: threadId ?? currentThreadId.current ?? '',
        message, // message to send
        onAssistantResponse: handleWsEvents, // function to handle server events
        onThreadIdChange: newThreadId => {
          // to capture new thread id
          currentThreadId.current = newThreadId;
          navigate('../../chat/thread/' + newThreadId, { replace: true });
          refetchThreads();
        },
        onError: err => {
          setError(err);
          setLoading(false);
        },
        onComplete: () => setLoading(false),
      });
    },
    [navigate, threadId, handleWsEvents, refetchThreads, localChatClient]
  );

  const artifacts = useMemo(() => extractModifiedArtifacts(data), [data]);

  return {
    threadId,
    sendMessage,
    data,
    error,
    loading,
    toolCallResponses,
    threads,
    threadsError,
    isThreadsLoading,
    artifacts,
  };
};

export default usePachaChatV2;
