import { ActionIconProps, ButtonProps } from '@mantine/core';

type Base = {
  toCopy: string;
  children?: React.ReactNode;
  codeStyle?: boolean;
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
  tooltipMessage?: string;
  icon?: React.ReactNode;
  testId?: string;
};

export type CopyButtonProps = Base &
  Omit<ButtonProps, 'styles' | 'rightSection'>;

export type CopyActionIconProps = Base & Omit<ActionIconProps, 'styles'>;
