import { useContext } from 'react';

import { LoadingMessageContext } from './LoadingMessageContext';

export function useLoadingMessage() {
  const context = useContext(LoadingMessageContext);

  if (!context) {
    throw new Error(
      'useLoadingMessage must be used within a LoadingMessageProvider'
    );
  }

  return context;
}
