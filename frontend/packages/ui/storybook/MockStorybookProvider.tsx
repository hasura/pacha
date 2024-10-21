import { MetadataMapProvider } from '@console/context/metadata/MetadataMapContext';
import { HistoryProvider } from '@console/routing/history/HistoryContext';
import { BrowserRouter } from 'react-router-dom';

import { ApolloClientProvider } from '@/control-plane-client';
import { LoadingMessageProvider } from '@/ui/core';
import { MantineProviders } from '@/ui/mantine';
import { QueryClient, QueryClientProvider } from '@/utils/react-query';
import {
  MockFeatureContext,
  MockMetadataProvider,
  MockProjectContext,
  MockTourProvider,
  MockUserProvider,
} from './mock-providers';

/**
 *
 * Combines all the mock providers into a single provider for storybook
 *
 */
export function MockStorybookProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <BrowserRouter>
      <HistoryProvider>
        <MantineProviders>
          <LoadingMessageProvider>
            <QueryClientProvider client={queryClient}>
              <ApolloClientProvider>
                <MockUserProvider>
                  <MockTourProvider>
                    <MockFeatureContext>
                      <MockProjectContext>
                        <MockMetadataProvider>
                          <MetadataMapProvider>{children}</MetadataMapProvider>
                        </MockMetadataProvider>
                      </MockProjectContext>
                    </MockFeatureContext>
                  </MockTourProvider>
                </MockUserProvider>
              </ApolloClientProvider>
            </QueryClientProvider>
          </LoadingMessageProvider>
        </MantineProviders>
      </HistoryProvider>
    </BrowserRouter>
  );
}
