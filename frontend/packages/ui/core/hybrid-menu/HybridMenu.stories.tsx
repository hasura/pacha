import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { Box, Button, Code, Paper, Text } from '@/ui/core';
import { Icons } from '@/ui/icons';
import { HybridMenu } from './HybridMenu';

export default {
  component: HybridMenu,

  decorators: [
    story => (
      <Paper maw={600} m={'xl'} p={'xl'}>
        <Box mb={'lg'} fz={'sm'}>
          This component is a hybrid between a select and a menu. You can pass a
          list of <Code>options</Code> and <Code>actions</Code>
          <Text>
            Can be used with either the <Code>value</Code> of{' '}
            <Code>defaultValue</Code> prop to use in either a controlled or
            uncontrolled way
          </Text>
        </Box>
        {story()}
      </Paper>
    ),
  ],
} satisfies Meta<typeof HybridMenu>;

const args: StoryObj<typeof HybridMenu>['args'] = {
  actions: [
    {
      label: 'Action',
      onClick: action('Action'),
      color: 'indigo',
      leftSection: <Icons.CloudLightning />,
    },
    {
      label: 'Another Action',
      onClick: action('Another Action'),
      color: 'red',
      leftSection: <Icons.Delete />,
    },
  ],
  options: [
    { label: 'Foo', value: 'one' },
    { label: 'Bar', value: 'two' },
  ],
  target: <Button>Target</Button>,
  defaultValue: 'one',
  onChange: action('onChange'),
};
export const Basic: StoryObj<typeof HybridMenu> = { args };
