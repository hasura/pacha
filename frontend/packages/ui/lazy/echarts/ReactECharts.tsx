import React from 'react';
import type { EChartsReactProps } from 'echarts-for-react';

import { LazyLoader } from '@/ui/core';

const ReactEChartsLazy = React.lazy(() => import('./ReactECharts.Base'));

export function ReactECharts(props: EChartsReactProps) {
  return (
    <LazyLoader loaderType="overlay">
      <ReactEChartsLazy {...props} />
    </LazyLoader>
  );
}
