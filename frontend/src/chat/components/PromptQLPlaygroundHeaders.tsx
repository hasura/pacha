import React, { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Table } from '@mantine/core';

import { ActionIcon, ScrollArea, Text, TextInput, Tooltip } from '@/ui/core';
import { Icons } from '@/ui/icons';

export interface PlaygroundHeader {
  id: string;
  name: string;
  value: string;
}

interface PromptQLPlaygroundHeadersProps {
  onChange: (headers: PlaygroundHeader[]) => void;
}

export const PromptQLPlaygroundHeaders: React.FC<
  PromptQLPlaygroundHeadersProps
> = ({ onChange }) => {
  const [headers, setHeaders] = useState<PlaygroundHeader[]>([]);

  const addHeader = () => {
    const newHeader: PlaygroundHeader = {
      id: Date.now().toString(),
      name: '',
      value: '',
    };
    setHeaders([...headers, newHeader]);
    onChange([...headers, newHeader]);
  };

  const updateHeader = (id: string, field: 'name' | 'value', value: string) => {
    const updatedHeaders = headers.map(header =>
      header.id === id ? { ...header, [field]: value } : header
    );
    setHeaders(updatedHeaders);
    onChange(updatedHeaders);
  };

  const removeHeader = (id: string) => {
    const filteredHeaders = headers.filter(header => header.id !== id);
    setHeaders(filteredHeaders);
    onChange(filteredHeaders);
  };

  return (
    <ScrollArea.Autosize mah={200}>
      <Table verticalSpacing="xs" stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th fw="normal">Headers</Table.Th>
            <Table.Th fw="normal">Value</Table.Th>
            <Table.Th style={{ width: '60px' }}>
              <Tooltip label="Add new header">
                <ActionIcon
                  variant="light"
                  onClick={addHeader}
                  data-testid="add-graphiql-header"
                  aria-label="add header"
                >
                  <Icons.Add />
                </ActionIcon>
              </Tooltip>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {headers.map(header => (
            <Table.Tr key={header.id}>
              <Table.Td>
                <TextInput
                  value={header.name}
                  onChange={e =>
                    updateHeader(header.id, 'name', e.target.value)
                  }
                  placeholder="Header name"
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  value={header.value}
                  onChange={e =>
                    updateHeader(header.id, 'value', e.target.value)
                  }
                  placeholder="Header value"
                />
              </Table.Td>
              <Table.Td>
                <Tooltip label="Delete header">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => removeHeader(header.id)}
                  >
                    <Icons.Delete />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {headers.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" mt="md">
          No headers. Click '+' to create one.
        </Text>
      ) : (
        <Text pt={0} size="sm" c="dimmed" ta="center" mt="md" fs="italic">
          Headers will be applied to all messages in this thread.
        </Text>
      )}
    </ScrollArea.Autosize>
  );
};

export default PromptQLPlaygroundHeaders;
