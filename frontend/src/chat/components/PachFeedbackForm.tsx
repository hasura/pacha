import { Button, Group, Textarea } from '@/ui/core';
import { useForm } from '@/ui/forms';
import { modals } from '@/ui/modals';
import { testId } from '@/utils/js-utils';

export function PachaFeedbackForm({
  onSubmit,
}: {
  onSubmit: (values: { feedback: string | null }) => void;
}) {
  const form = useForm<{ feedback: string | null }>({
    initialValues: {
      feedback: null,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(values => {
        onSubmit(values);
        modals.closeAll();
      })}
    >
      <Textarea
        label="Tell us what you think"
        placeholder="Share your thoughts, suggestions, or any feedback you'd like to provide"
        data-autofocus
        minRows={5}
        {...form.getInputProps('feedback')}
      />
      <Group mt="lg" justify="flex-end">
        <Button
          data-testid={testId({ feature: 'promptql-feedback', id: 'skip' })}
          variant="subtle"
          onClick={modals.closeAll}
        >
          Skip
        </Button>
        <Button
          type="submit"
          data-testid={testId({ feature: 'promptql-feedback', id: 'submit' })}
        >
          Submit
        </Button>
      </Group>
    </form>
  );
}
