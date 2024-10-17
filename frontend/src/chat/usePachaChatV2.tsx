import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useConsoleParams } from '@/routing';
import { ArtifactUpdate, CodeOutput, ServerEvent } from './data/Api-Types-v3';
import { usePachaLocalChatClient } from './data/hooks';
import { WebSocketClient } from './data/WebSocketClient';
import { usePachaChatContext } from './PachaChatContext';
import {
  Artifact,
  NewAiResponse,
  ToolCall,
  ToolCallResponse,
  UserConfirmationType,
} from './types';
import { processMessageHistory } from './utils';

const updateToolCallResponses =
  (event: CodeOutput) => (prev: ToolCallResponse[]) => {
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
        responseMode: 'stream',
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
          responseMode: 'stream',
        },
      ] as ToolCallResponse[];
    }
  };

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
    artifacts,
    setArtifacts,
  } = usePachaChatContext();

  const resetState = useCallback(() => {
    setRawData([]);
    setToolCallResponses([]);
    setArtifacts([]);
    setError(null);
    setLoading(false);
  }, [setRawData, setToolCallResponses, setArtifacts, setError, setLoading]);

  useEffect(() => {
    // when the user navigates to a new thread, load the new thread

    // if threadId is the same as the current threadId, do nothing
    if (threadId === currentThreadId.current) return;

    if (!threadId) {
      // if threadId is undefined, clear the chat history
      // user is at the chat home page
      resetState();
      currentThreadId.current = undefined;
      return;
    }

    if (threadId) {
      // if threadId is defined, reset the chat history
      resetState();
      setLoading(true);

      currentThreadId.current = threadId;
      // load the chat history for the new thread
      localChatClient
        .getThread({ threadId })
        .then(data => {
          const { history, toolcallResponses, artifacts } =
            processMessageHistory(data);
          setRawData(history);
          setToolCallResponses(toolcallResponses);
          setArtifacts(artifacts);
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
  }, [
    threadId,
    localChatClient,
    navigate,
    refetchThreads,
    resetState,
    setRawData,
    setToolCallResponses,
    setArtifacts,
  ]);

  const handleWsEvents = useCallback(
    (event: ServerEvent, client: WebSocketClient) => {
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
          const assistantMessageIndex = prevData?.findIndex(
            prev =>
              prev.type === 'ai' &&
              prev.assistant_action_id === event.assistant_action_id
          );
          newMessages[assistantMessageIndex] = {
            // newMessages[newMessages?.length - 1] = {
            ...prevData[newMessages?.length - 1],
            assistant_action_id: event.assistant_action_id,
            threadId: threadId ?? null,
            type: 'ai',
            responseMode: 'stream',
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
      if (event.type === 'user_confirmation_request') {
        setRawData(prevData => {
          const newUserRequest: UserConfirmationType = {
            type: 'user_confirmation',
            message: event.message,
            confirmation_id: event.confirmation_request_id,
            fromHistory: false,
            status: 'PENDING',
            responseMode: 'stream',
            client,
          };
          return [...prevData, newUserRequest];
        });
      }
      if (event.type === 'code_output') {
        setToolCallResponses(updateToolCallResponses(event));
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
                responseMode: 'stream',
              },
            ] as ToolCallResponse[];
          }
        });
      }
      if (event.type === 'artifact_update') {
        setArtifacts(updateArtifacts(event));
      }
      if (event.type === 'server_error') {
        setRawData(prevData => {
          const newMessages = [
            ...prevData,
            {
              message: event.message,
              type: 'error',
              threadId: threadId ?? null,
              responseMode: 'stream',
            } as NewAiResponse,
          ];
          return newMessages;
        });
      }
    },
    [threadId, setRawData, setToolCallResponses, setArtifacts]
  );

  const sendMessage = useCallback(
    async (
      message: string,
      headers?: Record<string, string>
    ): Promise<{
      sendMessage: (message: string) => void;
      disconnect: () => void;
    }> => {
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

      return await localChatClient
        .createChatStreamReaderV2({
          threadId: threadId ?? currentThreadId.current ?? '',
          message, // message to send
          headers, // headers to send on client init
          onAssistantResponse: handleWsEvents, // function to handle server events
          onThreadIdChange: newThreadId => {
            // to capture new thread id
            currentThreadId.current = newThreadId;
            navigate('../../promptql-playground/thread/' + newThreadId, {
              replace: true,
            });
            refetchThreads();
          },
          onError: err => {
            setError(err);
            setLoading(false);
          },
          onComplete: () => setLoading(false),
        })
        .catch(err => {
          setError(err);
          setLoading(false);
          return {
            sendMessage,
            disconnect: () => {},
          };
        });
    },
    [
      navigate,
      threadId,
      handleWsEvents,
      refetchThreads,
      localChatClient,
      setRawData,
    ]
  );

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

const updateArtifacts = (event: ArtifactUpdate) => (prev: Artifact[]) => {
  const newArtifacts: Artifact[] = [...prev];
  const currentArtifactIndex = prev?.findIndex(i => {
    if (i.identifier === event?.artifact?.identifier) return true;
  });

  if (currentArtifactIndex >= 0) {
    // partial code output found, need to merge with the existing partial the response
    newArtifacts[currentArtifactIndex] = {
      identifier: event?.artifact?.identifier,
      artifact_type: 'table',
      title: event?.artifact?.title,
      data: event?.artifact?.data,
      responseMode: 'stream',
    } as Artifact;
    return newArtifacts;
  } else {
    // new artifact push to artifact list
    return [
      ...prev,
      {
        identifier: event?.artifact?.identifier,
        artifact_type: 'table',
        title: event?.artifact?.title,
        data: event?.artifact?.data,
        responseMode: 'stream',
      } as Artifact,
    ];
  }
};
export default usePachaChatV2;
