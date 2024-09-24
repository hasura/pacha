import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '@/ui/core';
import { mantineSizeControl } from '@/ui/mantine/';
import { QueryClient, QueryClientProvider } from '@/utils/react-query';

export default {
  component: Table,
  title: 'UI/core/Table',
  args: {
    noPaper: false,
    fullWidth: false,
    radius: 'md',
    shadow: true,
    padding: 'none',
    withTableBorder: false,
    verticalSpacing: 'md',
    horizontalSpacing: 'md',
  },
  argTypes: {
    radius: mantineSizeControl,
    padding: mantineSizeControl,
    verticalSpacing: mantineSizeControl,
    horizontalSpacing: mantineSizeControl,
  },
  decorators: [
    Story => {
      return (
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Playground: StoryObj = {
  render: args => (
    <div className="flex">
      <Table {...args}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Header 1</Table.HeaderCell>
            <Table.HeaderCell>Header 2</Table.HeaderCell>
            <Table.HeaderCell>Header 3</Table.HeaderCell>
            <Table.HeaderCell>Header 4</Table.HeaderCell>
            <Table.HeaderCell>Header 5</Table.HeaderCell>
            <Table.HeaderCell>Header 6</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
            <Table.Cell>Data 3</Table.Cell>
            <Table.Cell>Data 4</Table.Cell>
            <Table.Cell>Data 5</Table.Cell>
            <Table.Cell>Data 6</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
            <Table.Cell>Data 3</Table.Cell>
            <Table.Cell>Data 4</Table.Cell>
            <Table.Cell>Data 5</Table.Cell>
            <Table.Cell>Data 6</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
            <Table.Cell>Data 3</Table.Cell>
            <Table.Cell>Data 4</Table.Cell>
            <Table.Cell>Data 5</Table.Cell>
            <Table.Cell>Data 6</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
            <Table.Cell>Data 3</Table.Cell>
            <Table.Cell>Data 4</Table.Cell>
            <Table.Cell>Data 5</Table.Cell>
            <Table.Cell>Data 6</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  ),
};
