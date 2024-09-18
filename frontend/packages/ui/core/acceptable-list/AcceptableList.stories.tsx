import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { Paper } from '@/ui/core';
import { AcceptableList } from './AcceptableList';

export default {
  component: AcceptableList,
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
} satisfies Meta<typeof AcceptableList>;

type MockItem = {
  id: string;
  label: string;
};

const args: StoryObj<typeof AcceptableList<MockItem>>['args'] = {
  items: [
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' },
  ],
  onAccept: action('onAccept'),
  onDecline: action('onDecline'),
  acceptLabel: 'Accept',
  declineLabel: 'Decline',
  acceptingAll: false,
  acceptingIds: [],
  decliningIds: [],
  // @ts-ignore
  getItemId: item => item.id,
  acceptAllButton: {
    onClick: action('acceptAll'),
  },
  // @ts-ignore
  renderItemDetail: item => {
    return <div>{item.label}</div>;
  },
};

export const Basic: StoryObj = {
  args,
};
