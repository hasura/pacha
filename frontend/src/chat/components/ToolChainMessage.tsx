import { useEffect, useMemo, useState } from 'react';

import {
  Accordion,
  Button,
  Group,
  Paper,
  Tabs,
  Text,
  ThemeIcon,
} from '@/ui/core';
import { useSchemeColors } from '@/ui/hooks';
import { Icons } from '@/ui/icons';
import { CodeHighlight, CodeMirrorProvider, ReactCodeMirror } from '@/ui/lazy';
import { ToolCall, ToolCallResponse } from '../types';

const RetryingToolCall = ({ hasError }: { hasError: boolean }) => {
  if (!hasError) return null;
  return (
    <Group style={{ color: 'var(--mantine-color-yellow-filled)' }}>
      <ThemeIcon
        variant="transparent"
        color="var(--mantine-color-yellow-filled)"
      >
        <Icons.Warning />
      </ThemeIcon>
      There was an error in the output. Initiating retry...
    </Group>
  );
};

const ACCORDION_VALUE = 'content';

export const ToolChainMessage = ({
  data,
  toolCallResponses,
}: {
  data: ToolCall;
  toolCallResponses: ToolCallResponse[];
}) => {
  const response = useMemo(
    () => toolCallResponses?.find(i => i.call_id === data.call_id) ?? {},
    [data, toolCallResponses]
  ) as ToolCallResponse;

  const [active, setActive] = useState<string | null>('code');
  const [accordionValue, setAccordionValue] = useState<string | null>(null);
  const { bg, text } = useSchemeColors();

  useEffect(() => {
    // show output section if it exists, otherwise it would be code section by default (initially)
    if (
      (response?.output?.output && response?.output?.output !== '') ||
      (response?.output?.error && response?.output?.error !== '')
    )
      setActive('output');
  }, [response?.output, setActive]);

  const isOutputUndefined = response?.output === undefined;

  if (data?.name !== 'execute_python') return null;
  let output: string | undefined;
  let hasError = false;

  if (response?.output?.output && response?.output?.output !== '') {
    output = response?.output?.output ?? '';
  }

  if (response?.output?.error && response?.output?.error !== '') {
    output = `${output ?? ''}

    ${response?.output?.error}`;

    hasError = true;
  }
  if (isOutputUndefined && !data?.input?.python_code) {
    return null;
  }

  return (
    <>
      <Paper withBorder radius="md" mt="xs">
        <Accordion
          value={accordionValue}
          onChange={setAccordionValue}
          variant="filled"
          disableChevronRotation
          chevron={<></>}
        >
          <Accordion.Item value={ACCORDION_VALUE}>
            <Accordion.Control
              icon={
                isOutputUndefined ? (
                  <ThemeIcon
                    variant="transparent"
                    className="animate-pulse duration-75"
                  >
                    <Icons.Executing />
                  </ThemeIcon>
                ) : (
                  <ThemeIcon variant="transparent">
                    <Icons.ToolCallExecuted />
                  </ThemeIcon>
                )
              }
            >
              <Group justify="space-between">
                {isOutputUndefined ? 'Executing' : 'Code Executed'}
                <Group c={text.highContrast('indigo')}>
                  {accordionValue === null ? (
                    <Button
                      variant="subtle"
                      rightSection={<Icons.ArrowRight />}
                    >
                      Show Details
                    </Button>
                  ) : (
                    <Button variant="subtle" rightSection={<Icons.ArrowUp />}>
                      Collapse
                    </Button>
                  )}
                </Group>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Tabs
                value={active}
                onChange={setActive}
                defaultValue="code"
                variant="outline"
              >
                <Tabs.List>
                  <Tabs.Tab value="code">Code</Tabs.Tab>
                  <Tabs.Tab disabled={!output} value="output">
                    Output
                  </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="code">
                  <CodeMirrorProvider>
                    {({ language, pythonModes }) => (
                      <ReactCodeMirror
                        className="size-full border border-slate-300 dark:border-secondary-500"
                        value={data?.input?.python_code}
                        readOnly
                        extensions={[
                          language.StreamLanguage.define(pythonModes.python),
                        ]}
                      />
                    )}
                  </CodeMirrorProvider>
                </Tabs.Panel>
                <Tabs.Panel value="output">
                  <Text mt="sm" c="dimmed" size="sm">
                    <CodeHighlight
                      code={output ?? ''}
                      language="text"
                      bg={hasError ? bg.color('red') : bg.color('green')}
                    />
                  </Text>
                </Tabs.Panel>
              </Tabs>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
      <RetryingToolCall hasError={hasError} />
    </>
  );
};
export default ToolChainMessage;
