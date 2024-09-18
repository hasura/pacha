import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { Paper } from '@/ui/core';
import { AcceptableListItem } from './AcceptableListItem';

export default {
  component: AcceptableListItem,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <Paper style={{ width: 600 }} p={'xs'}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof AcceptableListItem>;
type MockItem = {
  id: string;
  label: string;
};
const args: StoryObj<typeof AcceptableListItem<MockItem>>['args'] = {
  item: { id: '1', label: 'Item 1' },
  onAccept: action('onAccept'),
  onDecline: action('onDecline'),
  isAccepting: false,
  isDeclining: false,
  //@ts-ignore
  renderItemDetail: item => {
    return <div>{item.label}</div>;
  },
};

export const Basic: StoryObj = {
  args,
};
