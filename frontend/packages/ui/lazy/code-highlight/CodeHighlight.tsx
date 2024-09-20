import React from 'react';
import type { CodeHighlightProps } from '@mantine/code-highlight';

import { LazyLoader } from '@/ui/core';

const CodeHighlightLazy = React.lazy(() =>
  import('@mantine/code-highlight').then(module => ({
    default: module.CodeHighlight,
  }))
);

export function CodeHighlight(props: CodeHighlightProps) {
  return (
    <LazyLoader
      loaderType="contained"
      containerProps={{ pos: 'relative', h: 20, w: 75 }}
      loaderProps={{ type: 'dots' }}
    >
      <CodeHighlightLazy {...props} />
    </LazyLoader>
  );
}
