import clsx from 'clsx';

import { ArrowIcons } from './Icons';
import { IconProps } from './types';

export const AnimatedChevron = ({
  opened,
  ...iconProps
}: { opened: boolean } & IconProps) => {
  return (
    <ArrowIcons.ChevronDown
      className={clsx('transition-all', opened && 'rotate-180')}
      {...iconProps}
    />
  );
};
