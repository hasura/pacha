// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { QueryKey } from '@tanstack/react-query';

import { wait } from '../js-utils/js-utils';
import { queryClient } from './queryClient';

export async function waitForFetchingQueries(
  queryKeys: QueryKey[],
  timeout = 5000
) {
  const checkIfAnyFetching = () =>
    queryKeys.some(key => queryClient.isFetching({ queryKey: key }) > 0);

  let isFetching = checkIfAnyFetching();

  let waited = 0;

  while (isFetching && waited <= timeout) {
    isFetching = checkIfAnyFetching();

    if (!isFetching) {
      break;
    } else {
      await wait(100);
      waited += 100;
    }
  }
}
