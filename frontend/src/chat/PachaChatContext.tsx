import React, { Dispatch, SetStateAction, useContext } from 'react';

import { Thread } from './data/api-types';
import { Artifact, NewAiResponse } from './types';

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
      artifacts: Artifact[];
      setArtifacts: Dispatch<SetStateAction<Artifact[]>>;
      threads: Thread[];
      isThreadsLoading: boolean;
      refetchThreads: () => void;
      threadsError: Error | null;
    }
  | undefined
>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const usePachaChatContext = () => {
  const context = useContext(PachaChatContext);
  if (!context) {
    throw Error('PachaChatContext is not provided');
  }

  return context;
};
