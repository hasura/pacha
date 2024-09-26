import { useState } from 'react';
import { Paper } from '@mantine/core';
import { Meta } from '@storybook/react';

import { QueryClient, QueryClientProvider } from '@/utils/react-query';
import { HeadersEditor } from './HeadersEditor';
import { GraphiQLHeader } from './types';

export default {
  component: HeadersEditor,
  decorators: [
    Story => {
      return (
        <QueryClientProvider client={new QueryClient()}>
          <Paper bg={'gray.1'} mih={'80vh'} p={'md'}>
            <Story />
          </Paper>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof HeadersEditor>;

const WithHeadersWrapper = () => {
  const [headers, setHeaders] = useState<GraphiQLHeader[]>([
    {
      id: '1234',
      key: 'content-type',
      value: 'application/json',
      enabled: true,
    },
  ]);

  return <HeadersEditor headers={headers} onHeadersUpdate={setHeaders} />;
};

export const WithHeaders = {
  render: () => {
    return <WithHeadersWrapper />;
  },
};
