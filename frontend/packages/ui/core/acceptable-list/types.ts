import { ButtonProps } from '@mantine/core';

type Common<ItemType = unknown> = {
  onAccept: (item: ItemType) => void;
  onDecline: (item: ItemType) => void;
  acceptLabel?: string;
  declineLabel?: string;
  renderItemDetail: (item: ItemType) => React.ReactNode;
};

export type AcceptableListItemProps<ItemType = unknown> = {
  item: ItemType;
  isAccepting: boolean;
  isDeclining: boolean;
} & Common<ItemType>;

export type AcceptableListProps<ItemType = unknown> = {
  items: ItemType[];
  acceptingAll: boolean;
  // do not allow loader customization, but otherwise allow customization
  acceptAllButton?: Omit<ButtonProps, 'loading' | 'loaderProps'> & {
    onClick: () => void;
    label?: string;
  };
  acceptingIds: string[];
  decliningIds: string[];
  getItemId: (item: ItemType) => string;
} & Common<ItemType>;
