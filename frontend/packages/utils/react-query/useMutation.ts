// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
  DefaultError,
  useMutation as originalUseMutation,
  UseMutationOptions as OriginalUseMutationOptions,
  QueryKey,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

export interface UseMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> extends OriginalUseMutationOptions<TData, TError, TVariables, TContext> {
  dependentQueries?: QueryKey[];
}

// custom wrapper that adds a dependentQueries option to the original useMutation and
// invalidates the queries when the mutation is successful
export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

  return originalUseMutation({
    ...options,
    onSuccess: (data: TData, variables: TVariables, ctx: TContext) => {
      // Invalidate dependent queries
      if (options.dependentQueries) {
        options.dependentQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Call the original onSuccess, if it exists
      if (options.onSuccess) {
        options.onSuccess(data, variables, ctx);
      }
    },
  });
}

//equivalent to queryOptions but for mutations
export function mutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>) {
  return options;
}
