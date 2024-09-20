import { useState } from 'react';

import { usePachaLocalChatClient } from './data/hooks';

type Status = 'approved' | 'denied' | 'error' | undefined;

interface UseUserConfirmationReturn {
  update: (
    confirmationId: string,
    threadId: string,
    status: boolean
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
  status: Status;
}

export const useUserConfirmation = (): UseUserConfirmationReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<Status>();

  const localChatClient = usePachaLocalChatClient();

  const update = async (
    confirmationId: string,
    threadId: string,
    confirm: boolean
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await localChatClient.sendUserConfirmation({
        threadId,
        confirmationId,
        confirm,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStatus(confirm ? 'approved' : 'denied');
      // Handle successful response here if needed
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, status };
};

export default useUserConfirmation;
