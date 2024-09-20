import { ActionIcon, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { useColorScheme } from '@/ui/hooks/';
import { CopyIcon } from './components/CopyIcon';
import { CopyActionIconProps } from './types';
import { codeStyleProps } from './utils';

export function CopyActionIcon(props: CopyActionIconProps) {
  const {
    toCopy,
    children,
    codeStyle = false,
    tooltipPosition = 'bottom',
    tooltipMessage = 'Copied!',
    icon,
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
      <ActionIcon
        {...buttonProps}
        {...(codeStyle ? codeStyleProps(isDarkMode) : {})}
        onClick={e => {
          e.stopPropagation();
          clipboard.copy(toCopy);
        }}
        aria-label="copy text"
        data-testid="copy-api-endpoint"
      >
        {icon ?? <CopyIcon copied={clipboard.copied} />}
      </ActionIcon>
    </Tooltip>
  );
}
