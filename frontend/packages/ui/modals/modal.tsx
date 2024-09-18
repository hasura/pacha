import { modals as mantineModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';

import { Title } from './components/Title';

export const modal = (
  payload: Omit<ModalSettings, 'title'> & { title: string }
) => {
  const { title, ...rest } = payload;
  mantineModals.open({
    title: <Title>{title}</Title>,
    closeButtonProps: {
      'aria-label': 'close-modal',
    },
    ...rest,
  });
};
