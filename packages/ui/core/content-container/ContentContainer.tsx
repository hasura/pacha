import { Container } from '@mantine/core';

import {
  CONTENT_MARGIN,
  CONTENT_PADDING,
  MAX_CONTENT_WIDTH,
} from '@/ui/constants';

export const ContentContainer = Container.withProps({
  m: CONTENT_MARGIN,
  mx: 'auto',
  w: '100%',
  p: CONTENT_PADDING,
  fluid: true,
  maw: MAX_CONTENT_WIDTH,
});
