import { Box, Button, rem, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { useColorScheme } from '@/ui/hooks/';
import { testId } from '@/utils/js-utils';
import { CopyIcon } from './components/CopyIcon';
import { CopyButtonProps } from './types';
import { codeStyleProps } from './utils';

export function CopyButton(props: CopyButtonProps) {
  const {
    toCopy,
    children,
    codeStyle = false,
    tooltipPosition = 'bottom',
    tooltipMessage = 'Copied!',
    icon,
    testId: _testId,
    ...buttonProps
  } = props;

  const clipboard = useClipboard();

  const { isDarkMode } = useColorScheme();

  return (
    <Tooltip
      label={tooltipMessage}
      offset={5}
      position={tooltipPosition}
      radius="xl"
      transitionProps={{ duration: 100, transition: 'slide-down' }}
      opened={clipboard.copied}
    >
      <Button
        {...(codeStyle ? codeStyleProps(isDarkMode) : {})}
        {...buttonProps}
        rightSection={
          <Box pl={rem(6)}>
            {icon ?? <CopyIcon copied={clipboard.copied} />}
          </Box>
        }
        onClick={() => {
          clipboard.copy(toCopy);
        }}
        data-testid={testId({
          feature: 'copy-button-component',
          id: _testId ?? 'no-test-id-passed',
        })}
        aria-label="copy code snippet"
      >
        {children ?? toCopy}
      </Button>
    </Tooltip>
  );
}
