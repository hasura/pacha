import uniqueId from 'lodash/uniqueId';

import { PromptForm, PromptFormProps } from './components/PromptForm';
// import { PromptForm, PromptFormProps } from './components/PromptForm';
import { ConfirmProps } from './confirm';
import { modal } from './modal';

// 1. omit props we plan to override
// 2. omit modalId so we can set it ourselves
type PromptProps = Omit<ConfirmProps, 'onConfirm' | 'children' | 'modalId'> &
  Omit<PromptFormProps, 'modalId'>;

export const prompt = async (payload: PromptProps) => {
  const {
    labels,
    title,
    onConfirm: onPromptConfirm,
    field,
    confirmLabel,
    confirmProps,
    customValidation,
    ...rest
  } = payload;

  const modalId = uniqueId();

  // we want to use the custom modal function here, not the one from mantine
  modal({
    title: payload.title,
    modalId,
    children: (
      //children state in these functional modals needs to be self-contained
      <PromptForm
        onConfirm={onPromptConfirm}
        field={field}
        confirmProps={confirmProps}
        confirmLabel={confirmLabel}
        modalId={modalId}
        customValidation={customValidation}
      />
    ),
    closeOnClickOutside: false,
    ...rest,
  });
};
