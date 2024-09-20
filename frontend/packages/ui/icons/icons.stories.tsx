/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import {
  Accordion,
  Button,
  Card,
  CopyButton,
  Group,
  Highlight,
  Paper,
  Popover,
  Select,
  Slider,
  Stack,
  Text,
  TextInput,
} from '../core';
import { useSchemeColors } from '../hooks';
import { staticTheme } from '../mantine';
import * as IconCategories from './Icons';

export default {
  parameters: {
    layout: {
      fullscreen: true,
    },
  },
} satisfies Meta;

const IconComponent = React.memo(
  ({
    Category,
    icon,
    color,
    highlightText,
    size,
  }: {
    Category: string;
    icon: string;
    color: keyof (typeof staticTheme)['colors'] | undefined;
    highlightText: string;
    size: number;
  }) => {
    //@ts-expect-error
    const Icon = IconCategories[Category][icon];
    const fillColor = color ? staticTheme.colors[color][6] : undefined;

    if (!Icon) return null;

    return (
      <Popover position="top">
        <Popover.Target>
          <Card withBorder w={100} style={{ cursor: 'pointer' }}>
            <Stack gap="xs" align="center">
              <Icon size={size} fill={fillColor} />

              <Highlight
                lineClamp={1}
                color="blue"
                highlight={highlightText}
                size="xs"
              >
                {icon}
              </Highlight>
            </Stack>
          </Card>
        </Popover.Target>
        <Popover.Dropdown>
          <CopyButton
            codeStyle
            toCopy={`<Icons.${icon} ${size !== 15 ? `size={${size}}` : ''} ${color ? `fill={staticTheme.colors.${color}[6]}` : ''} />`}
          />
        </Popover.Dropdown>
      </Popover>
    );
  }
);

export const Showcase: StoryObj = {
  render: () => {
    const categories = Object.keys(IconCategories).filter(c => c !== 'Icons');

    const [color, setColor] = React.useState<
      keyof (typeof staticTheme)['colors'] | undefined
    >(undefined);

    const [search, setSearch] = React.useState<string>('');

    const [iconSize, setIconSize] = React.useState<number>(25);

    const { bg } = useSchemeColors();

    return (
      <Stack>
        <Paper
          radius={0}
          style={{
            zIndex: 9,
          }}
          pos={'sticky'}
          top={0}
          px={'lg'}
          py={'md'}
          bg={bg.level2}
        >
          <Group justify="space-between">
            <Text size="xl">Console Icons</Text>
            <Group gap={'xl'}>
              <Slider
                w={300}
                min={1}
                max={50}
                label={iconSize.toString()}
                value={iconSize}
                onChange={setIconSize}
                showLabelOnHover
                marks={[
                  { value: 5, label: '5' },
                  { value: 15, label: '15' },
                  { value: 25, label: '25' },
                  { value: 35, label: '35' },
                  { value: 45, label: '45' },
                ]}
              />
              <Button variant="light" onClick={() => setIconSize(15)}>
                Default Size
              </Button>
              <Select
                label="Color"
                placeholder="Pick value"
                defaultValue={'default'}
                data={['default', ...Object.keys(staticTheme.colors)]}
                onChange={(_value, option) => {
                  if (option.value === 'default') {
                    setColor(undefined);
                  } else {
                    setColor(option.value);
                  }
                }}
              />

              <TextInput
                value={search}
                onTextChange={setSearch}
                label="Search"
                leftSection={<IconCategories.ActionIcons.Search />}
                placeholder="Search icons..."
              />
            </Group>
          </Group>
        </Paper>
        <Accordion multiple defaultValue={categories}>
          {categories.map(Category => {
            const filteredIcons = Object.keys(
              IconCategories[Category as keyof typeof IconCategories]
            ).filter(icon => !search || icon.toLowerCase().includes(search));

            if (filteredIcons.length === 0) return null;

            return (
              <Accordion.Item value={Category}>
                <Accordion.Control>
                  <Text fw={'bold'}>{Category}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Group wrap="wrap" mb={'md'}>
                    {filteredIcons.map(icon => (
                      <IconComponent
                        key={icon}
                        size={iconSize}
                        Category={Category}
                        icon={icon}
                        color={color}
                        highlightText={search}
                      />
                    ))}
                  </Group>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Stack>
    );
  },
};
