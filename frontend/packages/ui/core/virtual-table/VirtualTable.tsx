import React from 'react';
import { Virtualizer } from '@tanstack/react-virtual';

import { cn } from '@/ui/utils';
import { Table } from '../table';

type TableRootElement = React.ElementRef<'div'>;

// meant to be used directly above `VirtualTable`
// See SelectableList for an example of usage
export const VirtualTableHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'w-full overflow-auto rounded-lg !rounded-b-none border !border-b-0 dark:border-muted'
      )}
    >
      <Table shadow={false} withTableBorder={false} verticalSpacing={'sm'}>
        <Table.Header>{children}</Table.Header>
      </Table>
    </div>
  );
};

export const VirtualTable = React.forwardRef<
  TableRootElement,
  {
    children: React.ReactNode;
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    maxHeight?: string;
  }
>(({ children, virtualizer, maxHeight = '20vh' }, forwardedRef) => {
  return (
    <>
      <div
        ref={forwardedRef}
        className={cn(
          'no-top-radius w-full overflow-auto rounded-lg !rounded-t-none border !border-t-0 dark:border-muted'
        )}
        style={{ maxHeight: maxHeight, overflow: 'auto' }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
          <Table shadow={false} withTableBorder={false} verticalSpacing={'sm'}>
            <Table.Body>{children}</Table.Body>
          </Table>
        </div>
      </div>
    </>
  );
});

VirtualTable.displayName = 'Table';
