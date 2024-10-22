import React, { useMemo, useState } from 'react';
import {
  Badge,
  BadgeProps,
  Button,
  Center,
  Flex,
  Group,
  Highlight,
  Loader,
  Menu,
  MenuProps,
  rem,
  ScrollArea,
  ScrollAreaProps,
  Text,
  useMantineTheme,
} from '@mantine/core';

import { useColorScheme, useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import { filterObjects, testId } from '@/utils/js-utils';
import { TextInput } from '../text-input/';

export type SearchableMenuProps<ItemType extends Record<string, unknown>> = {
  menuTrigger: React.ReactNode;
  title: string;
  titleIcon?: React.ReactNode;
  onViewAllClick?: () => void;
  isSelectedItem: (item: ItemType) => boolean;
  showItemBadge: (item: ItemType) => boolean;
  itemBadgeColor?: (item: ItemType) => BadgeProps['color'];
  itemBadgeText: ((item: ItemType) => string) | string;
  onItemClick: (item: ItemType) => void;
  items: ItemType[];
  itemTitle: (item: ItemType) => string;
  itemSubtitle?: (item: ItemType, filterKeyword?: string) => React.ReactNode;
  hideTitleBar?: boolean;
  filterKey?: string | string[];
  toolbar?: React.ReactNode;
  loading?: boolean;
  isItemPinned?: (item: ItemType) => boolean;
  position?: MenuProps['position'];
  transitionProps?: MenuProps['transitionProps'];
  scrollAreaProps?: ScrollAreaProps;
};

export function SearchableMenu<ItemType extends Record<string, unknown>>({
  menuTrigger,
  title,
  titleIcon,
  onViewAllClick,
  items: unSortedItems,
  onItemClick,
  isSelectedItem,
  itemBadgeText,
  itemTitle,
  itemSubtitle,
  hideTitleBar,
  showItemBadge,
  itemBadgeColor,
  filterKey = 'name',
  toolbar,
  loading,
  isItemPinned,
  position = 'bottom-start',
  transitionProps,
  scrollAreaProps,
}: SearchableMenuProps<ItemType>) {
  const items = useMemo(() => {
    if (!isItemPinned) return unSortedItems;

    const pinnedItems = unSortedItems.filter(item => isItemPinned?.(item));
    const unpinnedItems = unSortedItems.filter(item => !isItemPinned?.(item));

    return [...pinnedItems, ...unpinnedItems];
  }, [isItemPinned, unSortedItems]);

  const [filterKeyword, setFilterKeyword] = useState<string>('');

  const filteredItems = filterObjects({
    objects: items || [],
    keys: filterKey,
    filterString: filterKeyword,
  });
  const { colors } = useMantineTheme();
  const { isDarkMode } = useColorScheme();
  const { scopeColor } = useSchemeColors();
  const [opened, setOpened] = useState(false);
  //const { bg } = useSchemeColors();
  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      shadow="lg"
      radius={'md'}
      width={'28rem'}
      position={position}
      portalProps={{ style: { zIndex: 9999 } }}
      transitionProps={{
        duration: 100,
        timingFunction: 'ease',
        transition: 'pop-top-left',
        ...transitionProps,
      }}
    >
      <Menu.Target>{menuTrigger}</Menu.Target>
      <Menu.Dropdown p={'sm'}>
        {toolbar}
        {hideTitleBar !== true && (
          <Flex px={4} py={4} align={'center'} justify={'space-between'}>
            <Center fz={'sm'} style={{ gap: 8 }}>
              {titleIcon}
              <Text>{title}</Text>
            </Center>
            <Button
              data-testid={testId({
                feature: `searchable-menu-${title.toLowerCase()}`,
                id: 'view-all',
              })}
              onClick={() => {
                onViewAllClick?.();
                setOpened(false);
              }}
              variant="subtle"
              fz={'sm'}
              rightSection={<Icons.ArrowRight />}
            >
              View All
            </Button>
          </Flex>
        )}
        <TextInput
          my={8}
          value={filterKeyword}
          disabled={loading}
          onTextChange={text => setFilterKeyword(text)}
          placeholder={`Search ${title}...`}
          leftSection={<Icons.Search />}
        />
        <ScrollArea.Autosize
          scrollbars="y"
          pos={'relative'}
          type="always"
          mah={'70dvh'}
          {...scrollAreaProps}
        >
          {loading && (
            <Center>
              <Loader my={'md'} />
            </Center>
          )}
          {filteredItems.map((project, index) => (
            <Menu.Item
              data-testid={`menu-item-${index}`}
              key={`${itemTitle(project)}-${index}`}
              onClick={() => {
                onItemClick(project);
              }}
              rightSection={
                <Text c={'gray'}>
                  <Icons.ChevronRight />
                </Text>
              }
              bg={
                isSelectedItem(project)
                  ? isDarkMode
                    ? colors[scopeColor.build][9]
                    : colors[scopeColor.build][0]
                  : undefined
              }
              mb={4}
            >
              <Group gap={'xs'}>
                {isItemPinned?.(project) && <Icons.Pin />}
                <Flex
                  justify={'space-between'}
                  mih={rem('30px')}
                  align={'center'}
                  flex={1}
                >
                  <Flex direction={'column'}>
                    {itemTitle(project) && (
                      <Highlight
                        truncate="end"
                        maw={'16rem'}
                        title={itemTitle(project)}
                        fw={500}
                        highlight={filterKeyword}
                        color={'blue'}
                      >
                        {itemTitle(project)}
                      </Highlight>
                    )}

                    {itemSubtitle?.(project, filterKeyword) && (
                      <Text size="sm" c={isDarkMode ? 'gray.5' : 'gray.8'}>
                        {itemSubtitle?.(project, filterKeyword) || '---'}
                      </Text>
                    )}
                  </Flex>
                  {showItemBadge(project) && (
                    <Badge color={itemBadgeColor?.(project)}>
                      {typeof itemBadgeText === 'string'
                        ? itemBadgeText
                        : itemBadgeText(project)}
                    </Badge>
                  )}
                </Flex>
              </Group>
            </Menu.Item>
          ))}

          {items.length === 0 && !loading && (
            <Menu.Label>
              <Text c={'gray'}>{`No ${title.toLowerCase()}.`}</Text>
            </Menu.Label>
          )}
          {filteredItems.length === 0 && items.length > 0 && (
            <Menu.Label>
              <Text c={'gray'}>{`No ${title.toLowerCase()} found.`}</Text>
            </Menu.Label>
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
