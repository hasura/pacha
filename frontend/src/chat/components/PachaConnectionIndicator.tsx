import { useEffect, useRef } from 'react';

import { Loader, ThemeIcon, Tooltip } from '@/ui/core';
import { Icons } from '@/ui/icons';
import { notifications } from '@/ui/notifications';
import { usePachaConnectionStatus } from '../data/hooks';
import { usePachaChatContext } from '../PachaChatContext';

const PachaConnectionIndicator = ({ onClick }: { onClick?: () => void }) => {
  const { pachaEndpoint, authToken } = usePachaChatContext();
  const { data, isError, isPending } = usePachaConnectionStatus(
    pachaEndpoint,
    authToken
  );
  const prevErrorRef = useRef(false);

  useEffect(() => {
    const isConnected = data == 'OK' && !isError;

    if (!isConnected && !prevErrorRef.current && !isPending) {
      notifications.show({
        type: 'error',
        title: 'Unable to connect to Pacha',
        message: 'Check your network and Pacha settings.',
      });
      prevErrorRef.current = true;
    } else if (isConnected) {
      prevErrorRef.current = false;
    }
  }, [data, isError, isPending]);

  const isConnected = data == 'OK' && !isError;
  if (isPending) return <Loader w={50} color="gray" type="dots" size={'sm'} />;

  return (
    <Tooltip
      multiline
      label={
        isConnected
          ? 'Connected to Pacha'
          : 'Unable to Connect.\n Check your network and Pacha settings.'
      }
    >
      <ThemeIcon
        variant="transparent"
        color={isConnected ? 'green' : 'red'}
        onClick={onClick}
      >
        {isConnected ? (
          <Icons.PachaConnected size="lg" />
        ) : (
          <Icons.PachaUnableToConnect size="lg" />
        )}
      </ThemeIcon>
    </Tooltip>
  );
};

export default PachaConnectionIndicator;
