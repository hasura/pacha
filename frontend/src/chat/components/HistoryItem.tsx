import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { useConsoleParams } from '@/routing';
import {
  Alert,
  CopyActionIcon,
  Group,
  NavLink,
  Stack,
  Text,
  Tooltip,
} from '@/ui/core';
import { Icons } from '@/ui/icons';

export type HistoryItem = {
  title: string;
  threadId: string;
};
export function HistoryGroup({
  timeUnit,
  items,
  onHistoryItemClick,
  error,
}: {
  timeUnit: string;
  items: HistoryItem[];
  error: Error | null;
  onHistoryItemClick?: (threadId: string) => void;
}) {
  return (
    <Stack px={'md'}>
      <Text c={'dimmed'} size="sm" fw={600}>
        {timeUnit}
      </Text>
      <Stack gap={0}>
        {items.map((item, index) => (
          <HistoryItem key={index} item={item} onClick={onHistoryItemClick} />
        ))}
        {error && error.message ? (
          <Alert color="red">Error loading threads</Alert>
        ) : null}
      </Stack>
    </Stack>
  );
}

export function HistoryItem({
  item,
  onClick,
}: {
  item: HistoryItem;
  onClick?: (threadId: string) => void;
}) {
  const { threadId } = useConsoleParams();
  const isActive = threadId === item.threadId;

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [isCopied]);

  return (
    <Tooltip
      label={isCopied ? 'Copied!' : item.title}
      position="right"
      withArrow
      arrowSize={6}
      offset={10}
    >
      <NavLink
        onClick={() => {
          onClick?.(item.threadId);
        }}
        className={clsx('group', 'rounded-[var(--mantine-radius-md)]')}
        active={isActive}
        label={
          <Group gap={1} p={0}>
            <Text w={165} truncate>
              {item.title}
            </Text>
            <CopyActionIcon
              toCopy={`${window.location.origin}/chat/thread/${item.threadId}`}
              variant="subtle"
              color="gray"
              className="opacity-0 group-hover:opacity-100"
              tooltipMessage="Copied!"
              radius={'lg'}
              icon={<Icons.CopyLink />}
            />
          </Group>
        }
      />
    </Tooltip>
  );
}
