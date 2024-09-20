import { useMemo } from 'react';
import { titleize, underscore } from 'inflection';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';

type DynamicTableProps = {
  data: Record<string, unknown>[];
  initialPageSize?: number;
  enableFullScreen?: boolean;
};

// Utility function to sanitize data
const sanitizeData = (
  data: Record<string, unknown>[]
): Record<string, string>[] => {
  return data.map(row => {
    const sanitizedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      sanitizedRow[key] =
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
    }
    return sanitizedRow;
  });
};

const DynamicTableUI = ({
  data,
  initialPageSize,
  enableFullScreen = false,
}: DynamicTableProps) => {
  const columns = useMemo(
    () =>
      Object.keys(data[0]).map(key => ({
        accessorKey: key,
        header: titleize(underscore(key)), // Format headers nicely
      })),
    [data]
  );
  // Sanitize the data
  const sanitizedData = useMemo(() => sanitizeData(data), [data]);
  const table = useMantineReactTable({
    columns,
    data: sanitizedData,
    initialState: {
      density: 'xs',
      pagination: {
        pageSize: initialPageSize ?? 5,
        pageIndex: 0,
      },
    },
    mantinePaperProps: {
      shadow: 'none',
      radius: 'md',
    },
    mantineBottomToolbarProps: {
      p: 'lg',
    },
    enableFullScreenToggle: enableFullScreen,
  });

  if (data.length === 0) {
    return <p>No data available</p>;
  }

  return <MantineReactTable table={table} />;
};

function DynamicTable(props: DynamicTableProps) {
  if (!props.data) return null;
  return <DynamicTableUI {...props} />;
}

export default DynamicTable;
