import { LoadingOverlay } from '@mantine/core';

import { GenericError } from '@/ui/core';
import { hasMessageProperty } from '@/utils/js-utils';
import { useQuery } from '@/utils/react-query';
import { CodeMirrorModules, loadCodeMirror } from './modules';

export function CodeMirrorProvider({
  children,
}: {
  children: (codeMirror: CodeMirrorModules) => React.ReactNode;
}) {
  const { data, isPending, error, isError } = useQuery({
    queryKey: ['codemirror-modules'],
    queryFn: () => loadCodeMirror(),
  });

  if (isPending) {
    return (
      <LoadingOverlay
        loaderProps={{ type: 'bars', color: 'gray', opacity: 0.5 }}
      />
    );
  }

  if (isError) {
    return (
      <GenericError
        message={
          hasMessageProperty(error)
            ? error.message
            : 'An error occurred loading @codemirror modules.'
        }
      />
    );
  }

  return children(data);
}
