import React from 'react';

import { LazyLoader } from '@/ui/core';
import type { JSONEditorProps } from './JSONEditor.Base';

const JSONEditorLazy = React.lazy(() => import('./JSONEditor.Base'));

export function JSONEditor(props: JSONEditorProps) {
  return (
    <LazyLoader loaderType="overlay">
      <JSONEditorLazy {...props} />
    </LazyLoader>
  );
}
