// Use a tree-shakable echarts object
// https://echarts.apache.org/handbook/en/basics/import/
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import type { EChartsReactProps } from 'echarts-for-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {
  BarChart as EChartBarChart,
  GraphChart as EChartGraphChart,
  LineChart as EChartLineChart,
  PieChart as EChartPieChart,
} from 'echarts/charts';
import {
  GridSimpleComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// Register the required components
echarts.use([
  EChartGraphChart,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
  CanvasRenderer,
  LegendComponent,
  EChartLineChart,
  GridSimpleComponent,
  EChartPieChart,
  EChartBarChart,
  ToolboxComponent,
  MarkLineComponent,
]);

function ReactECharts(props: EChartsReactProps) {
  return <ReactEChartsCore echarts={echarts} {...props} />;
}

export default ReactECharts;
