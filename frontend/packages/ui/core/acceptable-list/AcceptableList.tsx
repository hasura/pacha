import React from 'react';
import {
  Button,
  Center,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';

import { Icons } from '@/ui/icons/Icons';
import { AcceptableListItem } from './AcceptableListItem';
import { AcceptableListProps } from './types';

export function AcceptableList<ItemType = unknown>({
  items,
  onAccept,
  onDecline,
  onAcceptAll,
  acceptingAll,
  acceptAllButton,
  acceptingIds,
  decliningIds,
  getItemId,
  renderItemDetail,
  acceptLabel = 'Accept',
  declineLabel = 'Decline',
}: AcceptableListProps<ItemType>) {
  return (
    <Paper className="!rounded-t-none">
      {onAcceptAll && (
        <>
          <Group justify="flex-end" py={8} px={'sm'}>
            <Button
              rightSection={<Icons.CheckAll />}
              variant="subtle"
              {...acceptAllButton}
              onClick={onAcceptAll}
              // these are not allowed to be customized
              loaderProps={{ type: 'dots' }}
              loading={acceptingAll}
              disabled={items.length === 0 || acceptAllButton?.disabled}
              data-testid="accept-all-invitations"
            >
              {acceptAllButton?.label ?? 'Accept All'}
            </Button>
          </Group>
          <Divider />
        </>
      )}
      <ScrollArea.Autosize type="auto" mah={'35dvh'}>
        <Stack gap={0} mx={'sm'} my={'xs'} pos={'relative'}>
          <LoadingOverlay visible={acceptingAll} />
          {items.length === 0 && (
            <Center my={'lg'}>
              <Text c="dimmed">No items to display</Text>
            </Center>
          )}
          {items.map((item, index) => {
            return (
              <React.Fragment key={getItemId(item)}>
                <AcceptableListItem
                  item={item}
                  isAccepting={acceptingIds.includes(getItemId(item))}
                  isDeclining={decliningIds.includes(getItemId(item))}
                  onAccept={() => onAccept(item)}
                  onDecline={() => onDecline(item)}
                  renderItemDetail={renderItemDetail}
                  acceptLabel={acceptLabel}
                  declineLabel={declineLabel}
                />
                {index < items.length - 1 && <Divider m={6} />}
              </React.Fragment>
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    </Paper>
  );
}
