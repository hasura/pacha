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
          console.log("prevData>>>",prevData)
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
        console.log("updating ",event.assistant_action_id)
        
        setRawData(prevData => {
          const newMessages = [...prevData];
          
          // find the assistant message with id
          // const assistantMessageIndex= prevData?.findIndex(prev=>prev.type==='ai' && prev.assistant_action_id===event.assistant_action_id)
          // newMessages[assistantMessageIndex]={
            
          console.log("found ",newMessages[newMessages?.length - 1])
          newMessages[newMessages?.length - 1] = {
            ...prevData[newMessages?.length - 1],
            assistant_action_id: event.assistant_action_id,
            threadId: threadId ?? null,
            type: 'ai',
            tool_calls: [
              {
                call_id: event.assistant_action_id,
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
        const newToolCallResponse = {
          call_id: '',
          output: {
            output: event.output_chunk,
            error: null,
            sql_statements: [],
            modified_artifacts: [],
          },
        } as ToolCallResponse;

        setToolCallResponses(prev => [...prev, newToolCallResponse]);
      }
    },
    [threadId, setRawData, setToolCallResponses]
  );
  const handleServerEvents = useCallback(
    (eventName: string, dataLine: string) => {
      const processMessage = (
        message: string
      ): {
        data: NewAiResponse | null;
        toolcallResponses: ToolCallResponse | null;
      } => {
        const nullResponse = { data: null, toolcallResponses: null };
        if (!message) return nullResponse;

        if (eventName === 'error') {
          const jsonData = JSON.parse(dataLine);

          return {
            data: {
              message: jsonData.error,
              type: 'error',
              responseMode: 'stream',
            },
            toolcallResponses: null,
          };
        }

        // ignore all other events for now
        if (
          eventName !== 'assistant_response' &&
          eventName !== 'user_confirmation' &&
          eventName !== 'tool_response'
        ) {
          return nullResponse;
        }

        if (!dataLine) {
          return nullResponse;
        }

        try {
          const jsonData = JSON.parse(dataLine);

          if (eventName === 'assistant_response') {
            return {
              data: {
                message: jsonData.text,
                type: 'ai',
                tool_calls: jsonData.tool_calls,
                threadId: threadId ?? null,
                responseMode: 'stream',
              },
              toolcallResponses: null,
            };
          } else if (eventName === 'tool_response') {
            return {
              data: {
                message: jsonData.output,
                type: 'toolchain',
                threadId: threadId ?? null,
                responseMode: 'stream',
              },
              toolcallResponses: jsonData,
            };
          } else if (eventName === 'user_confirmation') {
            return {
              data: {
                message: JSON.stringify(jsonData.message),
                confirmation_id: jsonData.confirmation_id,
                type: 'user_confirmation',
                responseMode: 'stream',
                status: 'PENDING',
              },
              toolcallResponses: null,
            };
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return nullResponse;
        }

        return nullResponse;
      };

      const { data: newData, toolcallResponses: newToolCallResponses } =
        processMessage(dataLine);

      if (newData)
        setRawData(prevData => {
          const newMessages = [...prevData, newData];
          return newMessages;
        });

      if (newToolCallResponses)
        setToolCallResponses(prev => [...prev, newToolCallResponses]);
    },
    [threadId]
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
    [navigate, threadId, handleServerEvents, refetchThreads, localChatClient]
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
