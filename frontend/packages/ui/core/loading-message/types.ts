import React from 'react';

export type VisibilityStatus =
  | 'waiting-to-show'
  | 'show'
  | 'hide'
  | 'waiting-to-hide';

export type LoadingMessageProps = {
  visibilityStatus: VisibilityStatus;
  message: React.ReactNode;
};
export type LoadingContextProps = LoadingMessageProps & {
  showLoading: (message: React.ReactNode) => void;
  hide: () => void;
};
