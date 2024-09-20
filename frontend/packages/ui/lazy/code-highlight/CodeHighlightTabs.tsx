import React from 'react';
import type { CodeHighlightTabsProps } from '@mantine/code-highlight';

import { LazyLoader } from '@/ui/core';

const CodeHighlightTabsLazy = React.lazy(() =>
  import('@mantine/code-highlight').then(module => ({
    default: module.CodeHighlightTabs,
  }))
);

export function CodeHighlightTabs(props: CodeHighlightTabsProps) {
  return (
    <LazyLoader
      loaderType="contained"
      containerProps={{ pos: 'relative', h: 20, w: 75 }}
      loaderProps={{ type: 'dots' }}
    >
      <CodeHighlightTabsLazy {...props} />
    </LazyLoader>
  );
}
