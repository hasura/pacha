import React, { useEffect } from 'react';
import { GraphiQLHeaders } from '@console/features/api-explorer/components/GraphiQLHeaders/GraphiQLHeaders';
import { useGraphiQLContext } from '@console/features/api-explorer/components/useGraphiQLContext';
import { ErrorBoundary } from '@console/ui/common';

import { Alert, Box, Text, Title } from '@/ui/core';
import { usePachaChatContext } from '../PachaChatContext';

const GraphiQLProjectProvider = React.lazy(
  () => import('@console/features/api-explorer/GraphiQLPage.Provider')
);

// Infer the type from the GraphiQLHeaders component
type GraphiQLHeadersProps = React.ComponentProps<typeof GraphiQLHeaders>;

type ActiveTab = GraphiQLHeadersProps['activeTab'];
type Headers = GraphiQLHeadersProps['headers'];

type HeadersObject = Record<string, string>;

const createHeadersObject = (headers: Headers | undefined): HeadersObject => {
  return (
    headers?.reduce<HeadersObject>((acc: HeadersObject, { name, value }) => {
      if (name && value) {
        acc[name] = value;
      }
      return acc;
    }, {}) ?? {}
  );
};

const HeadersSection = () => {
  const [headers, setHeaders] = React.useState<Headers>([]);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('headers');
  const { setHeadersRef } = usePachaChatContext();
  const { graphQLEndpoint, authConfig, buildToUseForGraphiQL } =
    useGraphiQLContext();

  useEffect(() => {
    setHeadersRef(createHeadersObject(headers));
  }, [
    headers, // to make sure any UI changes are updated
    buildToUseForGraphiQL, // to make sure headers are updated when build changes
    graphQLEndpoint, // to make sure headers are updated when endpoint changes
    authConfig, // to make sure headers are updated when authConfig changes
    setHeadersRef,
  ]);

  return (
    <Box p="md">
      <Title order={5} p="xs">
        Configure Hasura DDN Headers
      </Title>
      <GraphiQLHeaders
        buildId={buildToUseForGraphiQL?.id ?? ''}
        headers={headers}
        key={graphQLEndpoint}
        onChange={setHeaders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        authConfig={authConfig}
      />
      <Text p="sm">
        Set up your DDN headers and authorization before initiating the
        conversation. These settings will be applied to all future messages in
        this thread.
      </Text>
    </Box>
  );
};

const PlaygroundHeaders = () => {
  const { mode } = usePachaChatContext();
  if (mode === 'cloud')
    return (
      <ErrorBoundary
        errorHandler={err => (
          <Alert title="Error Loading Headers Section">
            {err?.message ?? ''}
          </Alert>
        )}
      >
        <GraphiQLProjectProvider>
          <HeadersSection />
        </GraphiQLProjectProvider>
      </ErrorBoundary>
    );
  else return null; // TODO implement for local mode once we have covered cloud mode
};
export default PlaygroundHeaders;
