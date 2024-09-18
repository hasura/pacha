// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { UseQueryResult } from '@tanstack/react-query';

type MultipleQueryResults = UseQueryResult<unknown, unknown>[];

//this is a utility we used in v2 console that helps with multiple query results
export const queryTool = {
  status: (results: MultipleQueryResults): UseQueryResult['status'] => {
    const statuses = results.map(r => r.status);

    // prioritize error. if any statuses are error, then status is error
    if (statuses.some(s => s === 'error')) return 'error';

    // next, prioritize pending. if any are pending, then status is pending
    if (statuses.some(s => s === 'pending')) return 'pending';

    // if we got here, then all statuses are success!
    return 'success';
  },
  isError: (results: MultipleQueryResults): boolean => {
    return results.some(r => r.isError);
  },
  isRefetching: (results: MultipleQueryResults): boolean => {
    return results.some(r => r.isRefetching);
  },
  isFetching: (results: MultipleQueryResults): boolean => {
    return results.some(r => r.isFetching);
  },
  isPending: (results: MultipleQueryResults): boolean => {
    return results.some(r => r.isPending);
  },
  isLoading: (results: MultipleQueryResults): boolean => {
    return results.some(r => r.isLoading);
  },
  isSuccess: (results: MultipleQueryResults): boolean => {
    return results.every(r => r.isSuccess);
  },
  firstError: (results: MultipleQueryResults): Partial<Error> | undefined => {
    if (results.length === 0) return undefined;
    if (results.length === 1)
      return results[0].isError
        ? (results[0].error as Partial<Error>)
        : undefined;

    return results.find(r => r.isError)?.error as Partial<Error>;
  },
  allErrors: (
    results: MultipleQueryResults
  ): (Partial<Error> | undefined)[] => {
    return results.filter(r => r.isError).map(r => r.error) as (
      | Partial<Error>
      | undefined
    )[];
  },
  // return both status and isFetching flag
  fullStatus: (results: MultipleQueryResults) => {
    const status = queryTool.status(results);

    return {
      status,
      isPending: queryTool.isPending(results),
      isError: queryTool.isError(results),
      isFetching: queryTool.isFetching(results),
      isLoading: queryTool.isLoading(results),
      isSuccess: queryTool.isSuccess(results),
      firstError: queryTool.firstError(results),
      allErrors: queryTool.allErrors(results),
    };
  },
};
