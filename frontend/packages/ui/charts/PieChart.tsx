import { EChartsInstance, EChartsOption, ReactECharts } from '@/ui/lazy';
import { useSchemeColors } from '../hooks';

export type PieChartProps = {
  name?: string;
  // option: EChartsOption;
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  color?: string;
  style?: React.CSSProperties;
  onChartReady?: (chartInstance: EChartsInstance) => void;
  legend?: EChartsOption['legend'];
  valueFormatter?: (value: number | string) => string;
  title?: string | { text: string; subtext: string };
  showLabel?: boolean;
};

export const PieChart = ({
  name,
  data,
  style,
  showLabel,
  onChartReady,
  legend,
  valueFormatter,
  title,
}: PieChartProps) => {
  const { text: textColor } = useSchemeColors();
  const option = {
    tooltip: {
      trigger: 'item',
      valueFormatter,
      confine: true,
    },
    legend: legend ?? {
      show: false,
    },
    title: {
      left: 'center',
      top: '40%',
      textStyle: {
        fontSize: 30,
        color: textColor.muted,
      },
      subtextStyle: {
        color: textColor.muted,
      },
      ...(typeof title === 'string' ? { text: title } : title),
    },
    series: [
      {
        name: name,
        type: 'pie',
        radius: ['55%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: showLabel,
        },

        labelLine: {
          show: showLabel,
        },
        data: data,
      },
    ],
  };

  return (
    <ReactECharts
      theme={{
        color: [
          '#1f32c4',
          '#8D9FEC',
          '#7b87e9',
          '#d5dafc',
          // '#5362e1',
          // '#2d3fdc',
          // '#0b259c',
          // '#a9b1f1',
          // '#182cb0',
        ],
      }}
      option={option}
      style={style ?? { height: 300, width: '100%' }}
      onChartReady={onChartReady}
    />
  );
};
