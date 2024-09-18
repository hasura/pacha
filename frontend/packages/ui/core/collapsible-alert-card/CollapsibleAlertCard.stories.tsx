import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';

import { Icons } from '@/ui/icons';
import { Paper } from '..';
import { CollapsibleAlertCard } from './CollapsibleAlertCard';

const meta = {
  component: CollapsibleAlertCard,
} satisfies Meta<typeof CollapsibleAlertCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'A title',
    children: <Paper p={'lg'}>{faker.lorem.paragraphs(5)}</Paper>,
    subtitle: 'A subtitle',
    icon: <Icons.Envelope size={26} />,
    color: 'indigo',
    radius: 'md',
    withBorder: true,
  },
};
