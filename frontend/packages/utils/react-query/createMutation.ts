/* eslint-disable @typescript-eslint/no-restricted-imports */

import { QueryKey } from '@tanstack/react-query';
import {
  CompatibleError,
  CreateMutationOptions as CreateMutationOptions_og,
  createMutation as creatMutation_og,
} from 'react-query-kit';

import { queryClient } from './queryClient';
import { ExtendedMutationHook } from './types';
import { waitForFetchingQueries } from './waitForFetchingQueries';

export type CreateMutationOptions<
  TData = unknown,
  TVariables = void,
  TError = CompatibleError,
  TContext = unknown,
> = Omit<
  // while the react-query-kit accepts defaults for these options, we do not want to support a pattern of
  // setting them at the creation step. These handlers can be used when the hook is implemented.
  // so, removing them from the type here.
  CreateMutationOptions_og<TData, TVariables, TError, TContext>,
  'onSuccess' | 'onError' | 'onSettled'
> & {
  dependentQueries?: QueryKey[];
};

// wrapper around createMutation that adds the dependant queries feature
export function createMutation<
  TData = unknown,
  TVariables = void,
  TError = CompatibleError,
  TContext = unknown,
>(
  defaultOptions: CreateMutationOptions<TData, TVariables, TError, TContext>
): ExtendedMutationHook<TData, TVariables, TError, TContext> {
  // create the original mutation hook
  const vanilla = creatMutation_og(defaultOptions);

  // wrap the call to the original mutation hook with the dependent query invalidation
  const withSprinkles: ExtendedMutationHook<
    TData,
    TVariables,
    TError,
    TContext
  > = (options, queryClientPassed) => {
    return vanilla(
      {
        ...options,
        onSuccess: (data, variables, ctx) => {
          // Invalidate dependent queries
          if (defaultOptions.dependentQueries) {
            defaultOptions.dependentQueries.forEach(queryKey => {
              queryClient.invalidateQueries({ queryKey });
            });
          }

          // If the user passed onSuccess, execute it after the dependent queries are invalidated
          if (options?.onSuccess) {
            options.onSuccess(data, variables, ctx);
          }
        },
      },
      queryClientPassed
    );
  };

  // copy over the helper properties
  withSprinkles.getKey = vanilla.getKey;
  withSprinkles.getOptions = vanilla.getOptions;
  withSprinkles.mutationFn = vanilla.mutationFn;

  // a few extra helper functions

  // returns the dependent query keys
  withSprinkles.getDependentQueryKeys = () =>
    defaultOptions.dependentQueries ?? [];

  // waits for the dependent queries to finish fetching
  withSprinkles.waitForDependentQueries = async (timeout = 5000) => {
    await waitForFetchingQueries(
      defaultOptions.dependentQueries ?? [],
      timeout
    );
  };

  // return the mutation hook object with sprinkles 🧁
  return withSprinkles;
}
