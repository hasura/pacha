import React from 'react';

import { LoadingContextProps } from './types';

export const LoadingMessageContext = React.createContext<LoadingContextProps>({
  visibilityStatus: 'hide',
  message: '',
  showLoading: () => {
    //initial value
  },
  hide: () => {
    //initial value
  },
});
