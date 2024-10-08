import React from 'react';

import { DEFAULT_PACHA_ENDPOINT } from './constants';

export const PachaChatContext = React.createContext<{
  isMinimized: boolean;
  setIsMinimized: (b: boolean) => void;
  pachaEndpoint: string;
  setPachaEndpoint: (endpoint: string) => void;
  authToken: string;
  setAuthToken: (token: string) => void;
}>({
  isMinimized: false,
  setIsMinimized: b => {},
  pachaEndpoint: DEFAULT_PACHA_ENDPOINT,
  setPachaEndpoint: endpoint => {},
  authToken: '',
  setAuthToken: token => {},
});
