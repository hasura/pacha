import { rem } from '@mantine/core';

import { Icons } from '@/ui/icons';

export const CopyIcon = ({ copied }: { copied: boolean }) => (
  <>
    {copied ? (
      <Icons.Check style={{ width: rem(18), height: rem(18) }} />
    ) : (
      <Icons.Copy style={{ width: rem(18), height: rem(18) }} />
    )}
  </>
);
