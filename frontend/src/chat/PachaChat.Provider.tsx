import React, { useCallback, useRef, useState } from 'react';
import { useProjectContext } from '@console/context/hooks';
import { useLocation, useNavigate } from 'react-router-dom';

import { endpoints } from '@/data/globals';
import { getRoutes } from '@/routing';
import { useLocalStorage } from '@/ui/hooks';
import {
  DEFAULT_PROMPTQL_PLAYGROUND_ENDPOINT,
  PROMPTQL_PLAYGROUND_CONFIG_LOCAL_STORAGE_KEY,
} from './constants';
import { useThreads } from './data/hooks';
import { PachaChatContext } from './PachaChatContext';
import { Artifact, NewAiResponse } from './types';

type PachaChatConfig = {
  pachaEndpoint: string;
  authToken?: string;
};

const PachaChatProvider = ({
  mode,
  children,
}: {
  mode: 'cloud' | 'local';
  children: React.ReactNode;
}) => {
  const [pachaChatConfig, setPachaChatConfig] =
    useLocalStorage<PachaChatConfig>({
      key: PROMPTQL_PLAYGROUND_CONFIG_LOCAL_STORAGE_KEY,
      defaultValue: {
        pachaEndpoint: DEFAULT_PROMPTQL_PLAYGROUND_ENDPOINT,
        authToken: '',
      },
    });
  const location = useLocation();
  const navigate = useNavigate();

  const [isMinimized, setIsMinimized_] = useState(false);
  const [pachaEndpointLocal, setPachaEndpoint_] = useState<string>(
    mode === 'cloud'
      ? endpoints?.promptQlPlaygroundHost
      : pachaChatConfig.pachaEndpoint
  );

  const pachaEndpoint =
    mode === 'cloud' ? endpoints?.promptQlPlaygroundHost : pachaEndpointLocal;

  const headers = useRef<Record<string, string>>({});

  const setHeadersRef = useCallback((h: Record<string, string>) => {
    // calling it explicitly Ref to let developers know that it is a Ref and no re-render will be triggered
    headers.current = h;
  }, []);

  const [authToken, setAuthToken_] = useState<string | undefined>(
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
    (authToken?: string) => {
      if (mode === 'cloud')
        throw new Error('Cannot set authToken in cloud mode');
      setPachaChatConfig(prev => ({ ...prev, authToken }));
      setAuthToken_(authToken);
    },
    [setPachaChatConfig, setAuthToken_, mode]
  );

  const setIsMinimized = useCallback(
    (b: boolean) => {
      if (b == true) navigate(location.pathname, { replace: true }); // make URL in sync with the minimized state
      setIsMinimized_(b);
    },
    [setIsMinimized_, navigate, location.pathname]
  );
  const [data, setRawData] = useState<NewAiResponse[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const { projectName, projectId, buildVersion, scope } = useProjectContext();

  const {
    data: threads = [],
    isPending: isThreadsLoading,
    refetch: refetchThreads,
    error: threadsError,
  } = useThreads(
    pachaEndpoint,
    mode === 'local' ? authToken : undefined,
    projectId
  );

  const routes = {
    newChat:
      mode == 'local'
        ? getRoutes().localDev.chat()
        : getRoutes(projectName).chatTab({ buildVersion, scope }),
    chatThreadLink: (threadId: string) => {
      return mode == 'local'
        ? getRoutes().localDev.chatThreadLink(threadId)
        : getRoutes(projectName).chatThreadLink({
            buildVersion,
            scope,
            threadId,
          });
    },
  };

  return (
    <PachaChatContext.Provider
      value={{
        isMinimized,
        setIsMinimized,
        pachaEndpoint,
        setPachaEndpoint,
        authToken: mode === 'local' ? authToken : undefined,
        setAuthToken,
        data,
        setRawData,
        threads,
        isThreadsLoading,
        refetchThreads,
        threadsError,
        artifacts,
        setArtifacts,
        mode,
        routes,
        setHeadersRef,
        headersRef: headers,
      }}
    >
      {children}
    </PachaChatContext.Provider>
  );
};

export default PachaChatProvider;
