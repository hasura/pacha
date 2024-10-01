import React, { Dispatch, RefObject, SetStateAction, useContext } from 'react';

import { DEFAULT_PACHA_ENDPOINT } from './constants';
import { Thread } from './data/api-types';
import { usePachaLocalChatClient } from './data/hooks';
import { NewAiResponse, ToolCallResponse } from './types';

export const PachaChatContext = React.createContext<
  | {
      isMinimized: boolean;
      setIsMinimized: (b: boolean) => void;
      pachaEndpoint: string;
      setPachaEndpoint: (endpoint: string) => void;
      authToken: string;
      setAuthToken: (token: string) => void;
      data: NewAiResponse[];
      setRawData: Dispatch<SetStateAction<NewAiResponse[]>>;
      threads: Thread[];
      isThreadsLoading: boolean;
      refetchThreads: () => void;
      threadsError: Error | null;
    }
  | undefined
>(undefined);

export const usePachaChatContext = () => {
  const context = useContext(PachaChatContext);
  if (!context) {
    throw Error('PachaChatContext is not provided');
  }

  return context;
};
