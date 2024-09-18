import { ClientError } from 'graphql-request';

import { createMutation, CreateMutationOptions } from './createMutation';
import { ExtendedMutationHook } from './types';

// the only thing this does in addition to the custom createMutation is set the error type to the correct ClientError (from graphql-request)
export function createControlPlaneMutation<
  TData = unknown,
  TVariables = void,
  TError = ClientError,
  TContext = unknown,
>(
  defaultOptions: CreateMutationOptions<TData, TVariables, TError, TContext>
): ExtendedMutationHook<TData, TVariables, TError, TContext> {
  return createMutation(defaultOptions);
}
