import {
  MantineRadius,
  MantineSpacing,
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  Table as MantineTable,
  Paper,
  StyleProp,
  TableProps,
} from '@mantine/core';
import clsx from 'clsx';

import { useSchemeColors } from '@/ui/hooks';

const defaultProps: TableProps = {
  verticalSpacing: 'sm',
  horizontalSpacing: 'sm',
  withRowBorders: true,
};

const PaperTable = ({
  children,
  paperChildren,
  padding,
  noPaper = false,
  fullWidth = false,
  radius = 'md',
  shadow = false,
  withTableBorder = false,
  headerAccent = true,
  ...props
}: Omit<TableProps, 'withTableBorder'> & {
  paperChildren?: React.ReactNode;
  noPaper?: boolean;
  padding?: StyleProp<MantineSpacing>;
  fullWidth?: boolean;
  radius?: MantineRadius;
  shadow?: boolean;
  withTableBorder?: boolean;
  headerAccent?: boolean;
}) => {
  const { bg } = useSchemeColors();

  const styles = {
    th: headerAccent ? { backgroundColor: bg.level4 } : undefined,
    ...(props.styles ?? {}),
  };

  if (noPaper) {
    return (
      <MantineTable
        {...defaultProps}
        {...props}
        withTableBorder={withTableBorder}
        styles={styles}
        className={clsx(props.className, fullWidth && 'w-full')}
      >
        {children}
      </MantineTable>
    );
  }

  return (
    <Paper
      component="div"
      shadow={shadow ? 'sm' : 'none'}
      p={padding}
      radius={radius}
      className={clsx(props.className, fullWidth && 'w-full')}
      withBorder={withTableBorder}
      style={{ overflow: 'hidden' }}
    >
      {paperChildren}
      <MantineTable
        {...defaultProps}
        {...props}
        className={clsx(fullWidth && 'w-full')}
        styles={styles}
      >
        {children}
      </MantineTable>
    </Paper>
  );
};

// restore object notation of mantine table
export const Table = Object.assign(PaperTable, {
  Header: MantineTable.Thead,
  HeaderCell: MantineTable.Th,
  Row: MantineTable.Tr,
  Cell: MantineTable.Td,
  Body: MantineTable.Tbody,
  Footer: MantineTable.Tfoot,
});
