import { rem } from '@mantine/core';

import { Icons } from '../icons';

const iconSize = 20;
const iconStyle = { width: rem(iconSize), height: rem(iconSize) };
export const xIcon = <Icons.Close style={iconStyle} />;
export const checkIcon = <Icons.Check style={iconStyle} />;
export const infoIcon = <Icons.Info style={iconStyle} />;
export const exclamationIcon = <Icons.Warning style={iconStyle} />;
