import React from 'react';
import type { InlineCodeHighlightProps } from '@mantine/code-highlight';

import { LazyLoader } from '@/ui/core';

const InlineCodeHighlightLazy = React.lazy(() =>
  import('@mantine/code-highlight').then(module => ({
    default: module.InlineCodeHighlight,
  }))
);

export function InlineCodeHighlight(props: InlineCodeHighlightProps) {
  return (
    <LazyLoader
      loaderType="contained"
      containerProps={{ pos: 'relative', h: 20, w: 75 }}
      loaderProps={{ type: 'dots' }}
    >
      <InlineCodeHighlightLazy {...props} />
    </LazyLoader>
  );
}
