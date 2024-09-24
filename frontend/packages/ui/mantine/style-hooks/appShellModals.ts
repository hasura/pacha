import { ModalProps } from '@mantine/core';

import { rem } from '@/ui/core';
import { APP_SHELL_HEADER_HEIGHT, APP_SHELL_ID } from '../../constants';

const APP_SHELL_MODAL_CLASS = 'app-shell-modal';

const querySelector = `#${APP_SHELL_ID} #app-shell-modals`;

export function appShellModalProps() {
  return {
    portalProps: {
      target: querySelector,
    },
    className: APP_SHELL_MODAL_CLASS,
    styles: {
      content: {
        height: '100%',
      },
      header: {
        display: 'none',
      },
      body: {
        height: '100%',
        padding: 0,
        paddingTop: 0,
      },
      root: {
        width: '100%',
        height: `calc(100vh - ${rem(APP_SHELL_HEADER_HEIGHT)})`,
        contain: 'content',
      },
    },
    transitionProps: { transition: 'pop' },
    fullScreen: true,
  } satisfies Partial<ModalProps>;
}
