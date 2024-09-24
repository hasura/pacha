import React from 'react';

import { LazyLoader } from '@/ui/core';
import type { ReactCodeMirrorProps } from './CodeMirror.Base';

const CodeMirrorLazy = React.lazy(() => import('./CodeMirror.Base'));

export function ReactCodeMirror(props: ReactCodeMirrorProps) {
  return (
    <LazyLoader loaderType="overlay">
      <CodeMirrorLazy {...props} />
    </LazyLoader>
  );
}
