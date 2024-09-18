import generatePicker from 'antd/es/date-picker/generatePicker';
import { isSameDay } from 'date-fns';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';

// Create a custom RangePicker using date-fns
const CustomDatePicker = generatePicker<Date>(dateFnsGenerateConfig);

export function RangePicker({
  date,
  setDate,
  minDate,
  maxDate,
  timeFormat = 'daily',
  valueFormat = 'MMM d, HH:mm',
  withTime = true,
}: {
  date: [Date | null, Date | null];
  setDate: (date: [Date | null, Date | null]) => void;
  minDate: Date | null;
  maxDate: Date | null;
  timeFormat?: 'daily' | 'hourly';
  valueFormat?: string;
  withTime?: boolean;
}) {
  const handleRangeChange = (dates: [Date | null, Date | null] | null) => {
    if (!dates) {
      setDate([null, null]);
      return;
    }

    const [firstDate, secondDate] = dates;

    setDate([firstDate, secondDate]);
  };

  return (
    <CustomDatePicker.RangePicker
      showTime={
        withTime
          ? {
              format: 'HH:mm',
            }
          : false
      }
      disabledDate={(current, { from }) => {
        // If format is hourly, make sure users can select a range of time within the same day
        if (timeFormat === 'hourly' && from) {
          return !isSameDay(current, from);
        }
        return false;
      }}
      minDate={minDate ?? undefined}
      maxDate={maxDate ?? undefined}
      format={withTime ? valueFormat : valueFormat.split(',')[0]}
      value={date}
      onChange={dates => handleRangeChange(dates)}
      allowClear={false}
    />
  );
}
