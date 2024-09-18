/* eslint-disable @typescript-eslint/no-restricted-imports */
import { QueryKey } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import {
  CompatibleError,
  MutationHook,
  QueryHookResult,
} from 'react-query-kit';

// convenience type for the result of when a createControlPlaneQuery is called
// uses the correct error type
export type ControlPlaneQueryResult<TData> = QueryHookResult<
  TData,
  ClientError
>;

export type ExtendedMutationHook<
  TData = unknown,
  TVariables = void,
  TError = CompatibleError,
  TDefaultContext = unknown,
> = MutationHook<TData, TVariables, TError, TDefaultContext> & {
  getDependentQueryKeys: () => QueryKey[];
  waitForDependentQueries: (timeout?: number) => Promise<void>;
};
