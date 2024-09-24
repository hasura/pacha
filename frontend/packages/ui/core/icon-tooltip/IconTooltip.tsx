import { ReactNode } from 'react';
import { rem, Text, Tooltip, TooltipProps } from '@mantine/core';

import { Icons } from '@/ui/icons';

export type IconTooltipProps = {
  /**
   * The tooltip icon classes
   */
  className?: string;
  /**
   * tooltip icon other then ?
   */
  icon?: ReactNode;
} & Omit<TooltipProps, 'children'>;

export const IconTooltip = ({
  className,
  icon,
  ...props
}: IconTooltipProps) => {
  if (props.disabled) return null;
  return (
    <Tooltip
      {...props}
      ml={rem(0.5)}
      events={{ hover: true, focus: true, touch: false }}
    >
      <Text
        style={{ cursor: 'pointer' }}
        variant="transparent"
        c={props.color || 'gray'}
        aria-label="tooltip"
      >
        {!icon ? <Icons.Question size={18} /> : icon}
      </Text>
    </Tooltip>
  );
};
