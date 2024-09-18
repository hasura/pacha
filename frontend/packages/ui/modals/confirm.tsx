import { ReactNode } from 'react';
import { modals as mantineModals } from '@mantine/modals';
import { OpenConfirmModal } from '@mantine/modals/lib/context';
import clsx from 'clsx';

import { Text } from '@/ui/core';

import './confirm.css';

export type ConfirmProps = Omit<
  OpenConfirmModal,
  'labels' | 'title' | 'children'
> & {
  labels?: { confirm?: ReactNode; cancel?: ReactNode };
  title: string;
  children: ReactNode;
  destructive?: boolean;
  hideCancelButton?: boolean;
};
// This is a wrapper around the mantine confirm modal that sets some defaults
// And makes the API a bit simpler with defaults that support consistent styling
// but can be overridden if needed.
export const confirm = (payload: ConfirmProps) => {
  const { labels, title, children, ...rest } = payload;
  mantineModals.openConfirmModal({
    cancelProps: { color: 'gray', variant: 'light' },
    confirmProps: payload.destructive === true ? { color: 'red' } : undefined,
    // always pass the title string to an xl <Text> component
    title: (
      <Text size="lg" fw={500}>
        {payload.title}
      </Text>
    ),
    // by default, render in a medium <Text> component, but allow the caller to override
    // with a ReactNode
    children:
      typeof payload.children === 'string' ? (
        <Text mb={'lg'}>{payload.children}</Text>
      ) : (
        payload.children
      ),
    classNames: {
      root: clsx(payload.hideCancelButton && 'hide-cancel-button'),
      // add a class to the body that makes it easier to specify styles
      body: 'confirm-body',
    },
    labels: {
      confirm: labels?.confirm ?? 'Confirm',
      cancel: labels?.cancel ?? 'Cancel',
    },
    ...rest,
  });
};
