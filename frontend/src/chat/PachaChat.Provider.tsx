import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useLocalStorage } from '@/ui/hooks';
import {
  DEFAULT_PACHA_ENDPOINT,
  PACHA_CHAT_CONFIG_LOCAL_STORAGE_KEY,
} from './constants';
import { PachaChatContext } from './PachaChatContext';

type PachaChatConfig = {
  pachaEndpoint: string;
  authToken: string;
};

const PachaChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [pachaChatConfig, setPachaChatConfig] =
    useLocalStorage<PachaChatConfig>({
      key: PACHA_CHAT_CONFIG_LOCAL_STORAGE_KEY,
      defaultValue: {
        pachaEndpoint: DEFAULT_PACHA_ENDPOINT,
        authToken: '',
      },
    });
  const location = useLocation();
  const navigate = useNavigate();

  const [isMinimized, setIsMinimized_] = useState(false);
  const [pachaEndpoint, setPachaEndpoint_] = useState<string>(
    pachaChatConfig.pachaEndpoint
  );

  const [authToken, setAuthToken_] = useState<string>(
    pachaChatConfig.authToken
  );

  const setPachaEndpoint = useCallback(
    (pachaEndpoint: string) => {
      setPachaChatConfig(prev => ({ ...prev, pachaEndpoint }));
      setPachaEndpoint_(pachaEndpoint);
    },
    [setPachaChatConfig, setPachaEndpoint_]
  );

  const setAuthToken = useCallback(
    (authToken: string) => {
      setPachaChatConfig(prev => ({ ...prev, authToken }));
      setAuthToken_(authToken);
    },
    [setPachaChatConfig, setAuthToken_]
  );

  const setIsMinimized = useCallback(
    (b: boolean) => {
      if (b == true) navigate(location.pathname, { replace: true }); // make URL in sync with the minimized state
      setIsMinimized_(b);
    },
    [setIsMinimized_, navigate, location.pathname]
  );

  return (
    <PachaChatContext.Provider
      value={{
        isMinimized,
        setIsMinimized,
        pachaEndpoint,
        setPachaEndpoint,
        authToken,
        setAuthToken,
      }}
    >
      {children}
    </PachaChatContext.Provider>
  );
};

export default PachaChatProvider;
