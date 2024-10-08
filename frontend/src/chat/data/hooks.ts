import { useMemo } from 'react';

import { createQuery } from '@/utils/react-query';
import { usePachaChatContext } from '../PachaChatContext';
import { ChatClient } from './client';

export const getLocalChatClient = (baseUrl: string, authToken: string) =>
  new ChatClient({
    baseUrl,
    authToken,
  });

export const usePachaLocalChatClient = () => {
  const { pachaEndpoint, authToken } = usePachaChatContext();
  return useMemo(() => {
    return new ChatClient({
      baseUrl: pachaEndpoint,
      authToken: authToken,
    });
  }, [pachaEndpoint, authToken]);
};

export const useThreads = (baseURL: string, authToken: string) => {
  return createQuery({
    queryKey: ['chat-threads', baseURL, authToken],
    fetcher: () => getLocalChatClient(baseURL, authToken).getThreads(),
  })({
    select: data => {
      const reversed = [...data];
      reversed.reverse();
      return reversed;
    },
  });
};

export const usePachaConnectionStatus = (
  baseURL: string,
  authToken: string
) => {
  return createQuery({
    queryKey: ['pacha-connection-health', baseURL, authToken],
    fetcher: () =>
      getLocalChatClient(baseURL, authToken).getPachaConnectionConfigCheck(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    networkMode: 'always',
  })();
};
