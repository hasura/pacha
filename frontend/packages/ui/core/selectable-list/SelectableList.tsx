import React, { ReactNode, useMemo, useState } from 'react';
import { Badge, Button, Checkbox } from '@mantine/core';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

import { Table } from '../table';
import { TextInput } from '../text-input';
import { VirtualTable, VirtualTableHeader } from '../virtual-table';

type SelectableItemProps = {
  key: string;
  label: string;
  displayElement?: string | ReactNode;
};

type SelectableListProps<T> = {
  items: T[];
  onSelect: (selectedItems: T[]) => void;
  getItemProps: (item: T) => SelectableItemProps;
  noItemsMessage?: string;
  headerItem?: ReactNode;
  maxHeight?: string;
};

export function generateVirtualTableRowStyle(
  virtualRow: VirtualItem,
  index: number
) {
  return {
    height: `${virtualRow.size}px`,
    transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
  };
}

const checkCellProps = () => ({ width: 10 });

export const SelectableList = <T extends Record<string, unknown>>({
  items: unfilteredItems,
  onSelect,
  getItemProps,
  noItemsMessage = 'No items.',
  maxHeight,
  headerItem,
}: SelectableListProps<T>) => {
  const [selectedKeyMap, setSelectedKeyMap] = useState(new Map<string, true>());

  const [filter, setFilter] = useState('');

  const items = useMemo(
    () =>
      unfilteredItems.filter(f => {
        const { label } = getItemProps(f);
        return label.toLowerCase().includes(filter.toLowerCase());
      }),
    [unfilteredItems, getItemProps, filter]
  );

  const handleItemClick = (itemKey: string) => {
    // Copy the current selectedKeyMap
    const updatedKeyMap = new Map(selectedKeyMap);

    if (updatedKeyMap.has(itemKey)) {
      updatedKeyMap.delete(itemKey);
    } else {
      updatedKeyMap.set(itemKey, true);
    }

    setSelectedKeyMap(updatedKeyMap);

    const selectedItems = items.filter(item =>
      updatedKeyMap.has(getItemProps(item).key)
    );
    onSelect(selectedItems);
  };

  const allItemsSelected = React.useMemo(() => {
    return items.length > 0 && items.length === selectedKeyMap.size;
  }, [items, selectedKeyMap]);

  const handleSelectAllClick = () => {
    if (!allItemsSelected) {
      // Select all items
      const newMap = new Map<string, true>();
      items.forEach(item => {
        newMap.set(getItemProps(item).key, true);
      });
      setSelectedKeyMap(newMap);
      onSelect(items);
    } else {
      // Deselect all items
      setSelectedKeyMap(new Map());
      onSelect([]);
    }
  };

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 20,
  });

  if (unfilteredItems.length === 0) {
    return (
      <div className="text-sm text-secondary-500 dark:text-secondary-400">
        {noItemsMessage}
      </div>
    );
  }

  return (
    <>
      <VirtualTableHeader>
        <Table.Row>
          <Table.HeaderCell {...checkCellProps()}>
            <Checkbox
              checked={allItemsSelected}
              onClick={handleSelectAllClick}
            />
          </Table.HeaderCell>
          <Table.HeaderCell>
            <div className="ml-3">
              Object Name <Badge>{items.length}</Badge>
            </div>
          </Table.HeaderCell>
          <Table.HeaderCell align={'right'}>{headerItem}</Table.HeaderCell>
          <Table.HeaderCell>
            <TextInput
              placeholder="Search..."
              className="font-normal"
              onTextChange={setFilter}
            />
          </Table.HeaderCell>
        </Table.Row>
      </VirtualTableHeader>
      <VirtualTable
        ref={parentRef}
        virtualizer={virtualizer}
        maxHeight={maxHeight}
      >
        {virtualizer.getVirtualItems().map((virtualRow, index) => {
          const item = items[virtualRow.index];
          const { key, label, displayElement } = getItemProps(item);
          return (
            <Table.Row
              key={key}
              style={generateVirtualTableRowStyle(virtualRow, index)}
            >
              <Table.Cell {...checkCellProps()}>
                <div className="flex h-full items-center">
                  <Checkbox
                    checked={selectedKeyMap.has(key)}
                    onChange={() => handleItemClick(key)}
                  />
                </div>
              </Table.Cell>
              <Table.Cell colSpan={2}>
                <Button variant="subtle" onClick={() => handleItemClick(key)}>
                  {displayElement ? displayElement : label}
                </Button>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </VirtualTable>
    </>
  );
};
