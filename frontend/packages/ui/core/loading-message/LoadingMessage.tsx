import React, { useEffect } from 'react';

import { useLoadingMessage } from './useLoadingMessage';

export function LoadingMessage({ children }: { children: React.ReactNode }) {
  const { showLoading, hide } = useLoadingMessage();

  useEffect(() => {
    // onMount
    showLoading(children);

    return () => {
      //onUnmount
      hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
