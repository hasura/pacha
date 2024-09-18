import { Button, Group } from '@mantine/core';

import { HoverPaper } from '../withProps/HoverPaper';
import { AcceptableListItemProps } from './types';

export function AcceptableListItem<ItemType = unknown>({
  item,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
  renderItemDetail,
  acceptLabel,
  declineLabel,
}: AcceptableListItemProps<ItemType>) {
  return (
    <HoverPaper component={Group} p="md" wrap="wrap" justify="space-between">
      {renderItemDetail(item)}
      <Group>
        <Button
          size={'compact-sm'}
          onClick={() => {
            onAccept(item);
          }}
          loading={isAccepting}
          disabled={isDeclining}
          variant="filled"
          data-testid="accept-single-invitation"
        >
          {acceptLabel ?? 'Accept'}
        </Button>
        <Button
          color="gray"
          variant="subtle"
          size={'compact-sm'}
          disabled={isAccepting}
          loading={isDeclining}
          onClick={() => {
            onDecline(item);
          }}
          data-testid="decline-single-invitation"
        >
          {declineLabel ?? 'Decline'}
        </Button>
      </Group>
    </HoverPaper>
  );
}
