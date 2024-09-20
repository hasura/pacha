import { useState } from 'react';
import { modals } from '@mantine/modals';

import { Button, TextInput } from '@/ui/core';
import { useForm } from '@/ui/forms';
import { ConfirmProps } from '../confirm';

export type PromptFormProps<T = unknown> = {
  onConfirm: (value: string) => Promise<T>;
  field: {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
  };
  confirmProps?: Omit<
    ConfirmProps['confirmProps'],
    'onClick' | 'loading' | 'disabled'
  >;
  confirmLabel?: string;
  modalId: string;
  customValidation?: (value: string) => string | null;
};
// state cannot be shared between parent component and modals.open children,
// so, we need to use internal component state
export function PromptForm({
  onConfirm,
  field: { label, placeholder = '', defaultValue = '', required = true },
  confirmProps,
  confirmLabel = 'Confirm',
  modalId,
  customValidation,
}: PromptFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<{ value: string }>({
    initialValues: {
      value: defaultValue ?? '',
    },
    validate: {
      value: value => {
        if (customValidation) {
          const result = customValidation(value);
          if (result) return result;
        }
        return required && !value.trim() ? 'Value is required' : null;
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(values => {
        setLoading(true);
        onConfirm(values.value).finally(() => {
          setLoading(false);
          modals.close(modalId);
        });
      })}
    >
      <TextInput
        label={label}
        placeholder={placeholder}
        disabled={loading}
        data-autofocus
        withAsterisk={required}
        {...form.getInputProps('value')}
      />
      <Button
        loading={loading}
        disabled={loading}
        fullWidth
        type="submit"
        mt="md"
        {...confirmProps}
      >
        {confirmLabel}
      </Button>
    </form>
  );
}
