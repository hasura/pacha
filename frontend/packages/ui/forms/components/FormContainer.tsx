import { LoadingOverlay, Paper } from '@mantine/core';

import { FormStyle } from '../types';

export function FormContainer({
  noPadding = true,
  noShadow = true,
  loading,
  onSubmit,
  children,
}: FormStyle & {
  loading: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return (
    <Paper p={noPadding ? 0 : 'lg'} shadow={noShadow ? 'none' : 'sm'}>
      <form autoComplete="off" onSubmit={onSubmit}>
        <LoadingOverlay visible={loading} />
        {children}
      </form>
    </Paper>
  );
}
