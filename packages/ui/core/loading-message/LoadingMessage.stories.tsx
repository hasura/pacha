import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { LoadingMessage } from './LoadingMessage'; // Adjust the import path as needed

export default {
  component: LoadingMessage,
} as Meta;

export const Loading: StoryObj<{
  children: React.ReactNode;
  type?: 'loading' | 'error';
}> = {
  args: {
    children: 'Loading Something...',
    type: 'loading',
  },
};

export const Error: StoryObj<{
  children: React.ReactNode;
  type?: 'loading' | 'error';
}> = {
  args: {
    children: 'An error occurred!',
    type: 'error',
  },
};
