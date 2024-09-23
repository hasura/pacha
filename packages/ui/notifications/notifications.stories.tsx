import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/ui/core';
import { notifications } from './notifications';

export default {
  title: 'UI/Notifications',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;
const triggerAll = () => {
  notifications.show({
    title: 'Success!',
    type: 'success',
    message: 'A message in your notification',
    autoClose: false,
  });
  notifications.show({
    title: 'Error!',
    type: 'error',
    message: 'A message in your notification',
    autoClose: false,
  });
  notifications.show({
    title: 'Warning!',
    type: 'warning',
    message: 'A message in your notification',
    autoClose: false,
  });
  notifications.show({
    title: 'Info!',
    type: 'info',
    message: 'A message in your notification',
    autoClose: false,
  });
  notifications.show({
    title: 'Loading...',
    loading: true,
    message: 'This notification is loading something...',
    autoClose: false,
  });
};
export const Showcase: StoryObj = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      triggerAll();
      return () => {
        notifications.clean();
      };
    }, []);

    return (
      <div className="h-screen w-screen bg-slate-50 p-4">
        A simple story that showcases the different types of notifications
        <div className="flex flex-col items-start justify-start gap-2">
          <Button onClick={() => notifications.clean()}>Close All</Button>
          <Button onClick={triggerAll}>Reset</Button>
        </div>
      </div>
    );
  },
};
