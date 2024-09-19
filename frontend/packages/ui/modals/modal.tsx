import { modals as mantineModals } from '@mantine/modals';

import { Title } from './components/Title';

type ModalSettings = Parameters<typeof mantineModals.open>[0];
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
