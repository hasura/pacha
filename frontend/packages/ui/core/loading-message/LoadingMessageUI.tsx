/* eslint-disable no-console */
import React, { Suspense, useEffect } from 'react';
import {
  Badge,
  BoxProps,
  LoadingOverlay,
  Overlay,
  Paper,
  Stack,
} from '@mantine/core';

import { useColorScheme } from '@/ui/hooks';
import hasuraLogoDarkModeAnimation from './assets/loading_dark.json';
import hasuraLogoLightModeAnimation from './assets/loading.json';
import { useLoadingMessage } from './useLoadingMessage';

const Lottie = React.lazy(() => import('lottie-react'));

export const LoadingMessageUI = () => {
  const { message, visibilityStatus } = useLoadingMessage();

  const { isDarkMode } = useColorScheme();

  const isVisible =
    visibilityStatus === 'show' || visibilityStatus === 'waiting-to-hide';

  const commonStyle = {
    zIndex: 100,
    pointerEvents: 'none',
    opacity: isVisible ? 100 : 0,
    transition: 'opacity 300ms ease-in-out',
  } satisfies BoxProps['style'];

  useEffect(() => {
    if (import.meta.env.DEV && !!message) {
      console.time('Time Spent Loading:');
    }
    return () => {
      if (!!message && import.meta.env.DEV) {
        console.group(message);
        console.timeEnd('Time Spent Loading:');
        console.info('Message:', message);
        console.groupEnd();
      }
    };
  }, [message]);

  return (
    <Stack
      id="loading-message-container"
      style={commonStyle}
      align="center"
      justify="center"
      pos={'fixed'}
      h={'100dvh'}
      w={'100dvw'}
      gap={'0px'}
    >
      <Paper radius={'lg'} mt={'-40dvh'} bg={'transparent'}>
        <Overlay
          color={
            isDarkMode
              ? 'var(--mantine-color-default)'
              : 'var(--mantine-color-gray-1)'
          }
          backgroundOpacity={0.75}
          blur={4}
          pos={'relative'}
          radius={'lg'}
        >
          <Suspense fallback={<LoadingOverlay visible />}>
            <Lottie
              style={{
                transform: 'scale(1.5)',
                width: 100,
                height: 100,
                zIndex: 102,
              }}
              animationData={
                isDarkMode
                  ? hasuraLogoDarkModeAnimation
                  : hasuraLogoLightModeAnimation
              }
            />
          </Suspense>
          {/* Show this span to see details about what's loading */}
        </Overlay>
      </Paper>
      {import.meta.env.DEV && !!message && (
        <Badge size="lg" color="pink" radius={'xs'} mt={'sm'}>
          <strong>Debug</strong>: {message}
        </Badge>
      )}
    </Stack>
  );
};
