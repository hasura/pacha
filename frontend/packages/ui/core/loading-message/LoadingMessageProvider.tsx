import React from 'react';

import { LoadingMessageContext } from './LoadingMessageContext';
import { LoadingMessageUI } from './LoadingMessageUI';
import { VisibilityStatus } from './types';

// we use a slight delay when hiding the message to avoid flickering
const HideDelay = 300;

export const LoadingMessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visibilityStatus, setVisibilityStatus] =
    React.useState<VisibilityStatus>('hide');
  const [message, setMessage] = React.useState<React.ReactNode>('');

  const waitThenHide = React.useCallback(() => {
    if (visibilityStatus === 'waiting-to-show') {
      setVisibilityStatus('hide');
      return;
    }
    setVisibilityStatus('waiting-to-hide');
    setTimeout(() => {
      setVisibilityStatus(status => {
        if (status === 'waiting-to-hide') {
          return 'hide';
        } else {
          return status;
        }
      });
    }, HideDelay);
  }, [visibilityStatus]);

  const showLoading = React.useCallback((message: React.ReactNode) => {
    setMessage(message);
    setVisibilityStatus('show');
  }, []);

  const hide = React.useCallback(() => {
    waitThenHide();
  }, [waitThenHide]);

  return (
    <LoadingMessageContext.Provider
      value={{ showLoading, hide, visibilityStatus, message }}
    >
      <LoadingMessageUI />
      {children}
    </LoadingMessageContext.Provider>
  );
};
