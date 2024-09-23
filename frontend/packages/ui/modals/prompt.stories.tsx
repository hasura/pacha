import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Alert, Button, Container, Group, Stack, Text, Title } from '@/ui/core';
import { modals } from '@/ui/modals';

export default {
  title: 'UI/Modals/Prompt',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export const Showcase: StoryObj = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [lastPromptValue, setLastPromptValue] = useState('');
    return (
      <Container>
        <Title m={'sm'}>A simple story that demos the prompt modal</Title>
        <Stack gap={'sm'} m={'sm'} align="center">
          <Alert>
            <Group>
              <div>Last Prompt Value:</div>{' '}
              <div>{lastPromptValue || '[empty value]'}</div>
            </Group>
          </Alert>
          <Text c="dimmed" m={'md'}>
            Try keyboard controls, too!
          </Text>
          <Button
            onClick={() =>
              modals.prompt({
                title: 'Hello',
                onConfirm: value => {
                  return new Promise(resolve => {
                    setTimeout(() => {
                      setLastPromptValue(value);
                      resolve(value);
                    }, 2000);
                  });
                },
                field: {
                  label: 'A prompt',
                },
              })
            }
          >
            Prompt w/ Async Confirm
          </Button>
          <Button
            onClick={() =>
              modals.prompt({
                title: 'Hello',
                onConfirm: async value => {
                  setLastPromptValue(value);
                },
                field: {
                  label: 'A prompt',
                },
              })
            }
          >
            Prompt Instant Confirm
          </Button>
          <Button
            onClick={() =>
              modals.prompt({
                title: 'Hello',
                onConfirm: async value => {
                  setLastPromptValue(value);
                },
                field: {
                  label: 'A prompt',
                  required: false,
                },
              })
            }
          >
            Prompt With Optional Value
          </Button>
          <Button
            onClick={() =>
              modals.prompt({
                title: 'Hello',
                onConfirm: async value => {
                  setLastPromptValue(value);
                },
                field: {
                  label: 'A prompt',
                  defaultValue: 'default value',
                },
              })
            }
          >
            Prompt With Default Value
          </Button>
          <Button
            onClick={() =>
              modals.prompt({
                title: 'Hello',
                onConfirm: async value => {
                  setLastPromptValue(value);
                },
                field: {
                  label: 'A prompt',
                  placeholder: 'placeholder',
                },
              })
            }
          >
            Prompt With Placeholder
          </Button>
        </Stack>
      </Container>
    );
  },
};
