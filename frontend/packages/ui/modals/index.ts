import { modals as mantineModals } from '@mantine/modals';

import { confirm } from './confirm';
import { modal } from './modal';
import { prompt } from './prompt';

// preserve the same api as mantine modals
export const modals = {
  open: modal,
  close: mantineModals.close,
  confirm,
  prompt,
  closeAll: mantineModals.closeAll,
};
