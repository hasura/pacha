import { useRef, useState } from 'react';
import { ModalProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { FormHandlers } from '../types';

// this is a hook that is designed to help handle state for a modal that is presenting a form
// it sets up props for the mantine Modal component to be set appropriately based on the state of the form

// for an example of how to use this hook, see CreateSecretForm.tsx (base form), and SecretsUnderSubgraph.tsx / SecretsUnderSubgraph.tsx (implementations of the form with this hook)
export function useModalForm<
  FormSchema,
  FormComponentProps = Record<string, unknown>,
>(handlers: FormHandlers<FormSchema>) {
  const [opened, { open, close }] = useDisclosure(false);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  const [initialValues, setInitialValues] = useState<FormSchema>();

  const [modalTitle, setModalTitle] = useState<string>('');

  // this is a hook level onSuccess that will be called after the hook prop level onSuccess
  const onSuccessViaOpen = useRef<(() => void) | undefined>();

  const [formComponentProps, setFormComponentProps] = useState<
    Partial<FormComponentProps> | undefined
  >();

  const openWithInitialValues = ({
    initialValues,
    modalTitle,
    onSuccess,
    componentProps,
  }: {
    initialValues: FormSchema;
    modalTitle: string;
    onSuccess?: () => void;
    componentProps?: Partial<FormComponentProps>;
  }) => {
    if (!initialValues) {
      throw new Error('initial values must be provided');
    }
    setInitialValues(initialValues);
    setModalTitle(modalTitle);
    onSuccessViaOpen.current = onSuccess;
    setFormComponentProps(componentProps);
    open();
  };

  const modalProps = {
    opened,
    onClose: close,
    closeButtonProps: {
      disabled: formIsSubmitting,
      'aria-label': 'close-modal',
    },
    closeOnClickOutside: !formIsSubmitting,
    title: modalTitle,
    closeOnEscape: !formIsSubmitting,
  } satisfies Partial<ModalProps>;

  // props to be applied to the form component
  const formProps: FormHandlers<FormSchema> & { initialValues: FormSchema } = {
    onSubmit: (values: FormSchema) => {
      setFormIsSubmitting(true);
      handlers.onSubmit?.(values);
    },
    onSuccess: () => {
      setFormIsSubmitting(false);
      close();
      // hook props onSuccess
      handlers.onSuccess?.();
      // openWithInitialValues onSuccess
      onSuccessViaOpen.current?.();
    },
    onError: (error: unknown) => {
      setFormIsSubmitting(false);
      handlers.onError?.(error);
    },
    // we can cast here because the openWithInitialValues function will always set the initialValues
    // or throw an error
    initialValues: initialValues as FormSchema,
    ...(formComponentProps ?? {}),
  };

  return {
    openForm: openWithInitialValues,
    modalProps,
    formProps,
  };
}
