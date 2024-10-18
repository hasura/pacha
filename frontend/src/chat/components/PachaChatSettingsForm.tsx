import { useState } from 'react';

import { Button, TextInput } from '@/ui/core';
import { useForm } from '@/ui/forms';
import { modals } from '@/ui/modals';
import { testId } from '@/utils/js-utils';

export function PachaChatSettingsForm({
  pachaEndpoint,
  setPachaEndpoint,
  authToken,
  setAuthToken,
}: {
  pachaEndpoint: string;
  setPachaEndpoint: (pachaEndpoint: string) => void;
  authToken?: string;
  setAuthToken: (authToken?: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<{ pachaUrl: string; pachaAuthToken?: string }>({
    initialValues: {
      pachaUrl: pachaEndpoint,
      pachaAuthToken: authToken,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(values => {
        setLoading(true);
        // remove trailing slash safely before saving
        setPachaEndpoint(values.pachaUrl?.replace(/\/$/, '') ?? '');
        setAuthToken(values.pachaAuthToken);
        setLoading(false);
        modals.closeAll();
      })}
    >
      <TextInput
        label="PromptQL Playground URL"
        placeholder="http://localhost:5000"
        disabled={loading}
        description="Leave empty if you are running PromptQL playground server on the same domain"
        value={pachaEndpoint}
        data-autofocus
        {...form.getInputProps('pachaUrl')}
      />
      {/* <TextInput
        label="Pacha Auth Token"
        // placeholder="1234567890"
        disabled={loading}
        data-autofocus
        withAsterisk
        {...form.getInputProps('pachaAuthToken')}
      /> */}
      <Button
        loading={loading}
        disabled={loading}
        fullWidth
        type="submit"
        mt="md"
        data-testid={testId({
          feature: 'promptql-settings',
          id: 'save',
        })}
      >
        Save
      </Button>
    </form>
  );
}
