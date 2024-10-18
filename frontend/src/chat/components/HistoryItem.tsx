import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';

import { useConsoleParams } from '@/routing';
import {
  ActionIcon,
  Alert,
  Group,
  NavLink,
  Stack,
  Text,
  Tooltip,
} from '@/ui/core';
import { Icons } from '@/ui/icons';
import { modals } from '@/ui/modals';
import { usePachaLocalChatClient } from '../data/hooks';
import { usePachaChatContext } from '../PachaChatContext';

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
  const { refetchThreads } = usePachaChatContext();
  const client = usePachaLocalChatClient();
  const [deleting, setDeleting] = useState(false);

  const deleteThread = useCallback(
    ({ threadId, title }: HistoryItem) => {
      modals.confirm({
        title: 'Delete Chat Thread?',
        children: `Are you sure you want to delete this chat thread ${title}?`,
        onConfirm: () => {
          setDeleting(true);
          client
            ?.deleteThread({ threadId })
            .then(() => {
              refetchThreads();
              setDeleting(false);
            })
            .catch(() => {
              setDeleting(false);
            });
        },
      });
    },
    [client, refetchThreads]
  );

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

            <ActionIcon
              size="sm"
              variant="subtle"
              className="opacity-0 group-hover:opacity-100"
              loading={deleting}
              onClick={e => {
                e.stopPropagation();
                deleteThread(item);
              }}
            >
              <Icons.Delete />
            </ActionIcon>
          </Group>
        }
      />
    </Tooltip>
  );
}
