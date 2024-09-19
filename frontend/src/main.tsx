import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { MantineProviders } from '@/ui/mantine';
import App from './App.tsx';

import '@/ui/styles/app-styles';

import { queryClient, QueryClientProvider } from '@/utils/react-query/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProviders>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MantineProviders>
  </StrictMode>
);
