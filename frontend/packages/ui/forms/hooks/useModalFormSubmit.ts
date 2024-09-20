import { useCallback, useState } from 'react';

import { FormHandlers } from '../types';

export function useModalFormSubmit<Schema, SubmitResponse = unknown>(
  handlers: FormHandlers<Schema>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onSubmit, onError, onSuccess } = handlers;

  const handleSubmit = useCallback(
    ({
      values,
      submitAction,
    }: {
      values: Schema;
      submitAction: () => Promise<SubmitResponse>;
    }) => {
      setLoading(true);

      setError(null);

      // 1. Call this first
      onSubmit?.(values);

      submitAction()
        .then(() => {
          onSuccess?.();
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          onError?.(err);
          setLoading(false);
        });
    },
    [onSubmit, onError, onSuccess]
  );

  return {
    loading,
    error,
    handleSubmit,
  };
}
