import React from 'react';
import { PaperProps, Text } from '@mantine/core';
import {
  MRT_Icons,
  type MRT_RowData,
  type MRT_TableOptions,
} from 'mantine-react-table';

import { MantineReactTableIcons } from '../icons';
import { defaultContainerProps } from '../mantine/mantineTheme';
import { useSchemeColors } from './useSchemeColors';

//define re-useable default table options for all tables in your app
export function useMRTDefaultOptions<TData extends MRT_RowData>(props?: {
  maxHeight?: string | number;
  height?: string | number;
  actionsRowSize?: number;
  withTableBorder?: boolean;
  paperProps?: PaperProps;
  grayHeader?: boolean;
  tableTitle?: React.ReactNode;
}): Partial<MRT_TableOptions<TData>> {
  const { bg, text } = useSchemeColors();

  const defaultOptions = React.useMemo(
    () =>
      ({
        mantineBottomToolbarProps: {
          p: 'lg',
        },
        mantinePaperProps: {
          ...defaultContainerProps,
          ...(props?.withTableBorder
            ? { withBorder: props?.withTableBorder }
            : { withBorder: true }),
          ...(props?.paperProps ?? {}),
        },
        displayColumnDefOptions: {
          'mrt-row-actions': {
            header: 'Actions', //change header text
            size: props?.actionsRowSize ?? 100,
          },
        },
        renderTopToolbarCustomActions: props?.tableTitle
          ? () => (
              <Text fw={500} pl={'xs'} pt={'xs'}>
                {props.tableTitle}
              </Text>
            )
          : undefined,
        positionActionsColumn: 'last',

        ...(props?.maxHeight || props?.height
          ? {
              mantineTableContainerProps: {
                style: {
                  maxHeight: props.maxHeight,
                  height: props.height,
                },
              },
            }
          : {}),
        icons: Object.entries(MantineReactTableIcons).reduce<
          Partial<MRT_Icons>
        >((icons, entry) => {
          const [key, Icon] = entry;

          if (!Icon) {
            // some icons are not implemented and are undefined.
            // by ignoring them, we can use the default icons from MRT
            return icons;
          }

          return {
            ...icons,
            [key]: () => {
              // the size prop is either '100%' or nothing so we are ignoring it since that is not a valid size
              return <Icon fill={text.normal} size={20} />;
            },
          };
        }, {}),
      }) satisfies Partial<MRT_TableOptions<TData>>,
    [
      bg.level4,
      props?.actionsRowSize,
      props?.height,
      props?.maxHeight,
      props?.paperProps,
      props?.withTableBorder,
      text.normal,
    ]
  );

  return defaultOptions;
}
