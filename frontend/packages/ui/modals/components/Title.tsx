import { ReactNode } from 'react';

import { Text } from '@/ui/core';

export const Title = ({ children }: { children: ReactNode }) => (
  <Text size="xl" fw={'bold'} c={'gray'}>
    {children}
  </Text>
);
