import { NotificationProps } from '@mantine/core';
import {
  notifications as mantineNotifications,
  NotificationData,
} from '@mantine/notifications';

import { checkIcon, exclamationIcon, infoIcon, xIcon } from './Icons';

type ShowNotificationProps = {
  type?: 'error' | 'success' | 'info' | 'warning';
  message?: React.ReactNode;
} & Pick<
  NotificationData,
  'id' | 'onClose' | 'onOpen' | 'autoClose' | 'title' | 'loading'
>;

function buildNotificationStyleByType(
  type: ShowNotificationProps['type']
): NotificationProps {
  switch (type) {
    case 'error':
      return { color: 'red', icon: xIcon };
    case 'success':
      return { color: 'green', icon: checkIcon };
    case 'warning':
      return {
        color: 'orange',
        icon: exclamationIcon,
      };
    default:
      return { color: 'blue', icon: infoIcon };
  }
}
const showNotification = ({
  type = 'info',
  message = '',
  ...rest
}: ShowNotificationProps) => {
  return mantineNotifications.show({
    ...rest,
    message,
    ...buildNotificationStyleByType(type),
  });
};

export const notifications = {
  ...mantineNotifications,
  show: showNotification,
};
