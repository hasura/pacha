import { ArgTypes } from '@storybook/react';

export const mantineSizeControl = {
  control: {
    type: 'inline-radio',
  },
  options: ['xs', 'sm', 'md', 'lg', 'xl', 'none'],
} satisfies ArgTypes[0];
