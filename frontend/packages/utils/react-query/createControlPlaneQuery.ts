/* eslint-disable @typescript-eslint/no-restricted-imports */
import { QueryKey } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { underscore } from 'inflection';
import {
  CreateQueryOptions,
  createQuery as creatQuery_og,
  QueryHook,
} from 'react-query-kit';

import {
  controlPlaneClient,
  ControlPlaneClientKeys,
  ControlPlaneClientProperties,
  getControlPlaneFunctionName,
} from '@/data/control-plane-client';

type QueryKeyType =
  | {
      // as an alternative to queryKey, you can provide a keyof the controlPlaneClient. This will be converted to underscore-case and uppercase and used as the queryKey base
      queryKeyFromControlPlaneKey: ControlPlaneClientKeys;
      queryKey?: never;
      inferQueryKey?: never;
    }
  | {
      queryKey: QueryKey;
      queryKeyFromControlPlaneKey?: never;
      inferQueryKey?: never;
    }
  | {
      // if you want to infer the queryKey from the controlPlaneClient.functionName, set this to true.
      inferQueryKey: true;
      queryKey?: never;
      queryKeyFromControlPlaneKey?: never;
    };

type ControlPlaneFetcher<TFnData, TVariables = void> = (
  variables: TVariables,
  headers?: HeadersInit
) => TFnData | Promise<TFnData>;

type CreateControlPlaneQueryOptions<
  TFnData,
  TVariables = void,
  TError = ClientError,
> = Omit<
  CreateQueryOptions<TFnData, TVariables, TError>,
  'fetcher' | 'queryKey'
> & {
  fetcher: ControlPlaneFetcher<TFnData, TVariables>;
  headers?: (variables: TVariables) => HeadersInit;
} & QueryKeyType;

// just sets the error type to ClientError for
export function createControlPlaneQuery<
  TFnData,
  TVariables = void,
  TError = ClientError,
>({
  fetcher,
  headers,
  ...options
}: CreateControlPlaneQueryOptions<TFnData, TVariables, TError>): QueryHook<
  TFnData,
  TVariables,
  TError
> {
  // Deteminer Query Key:
  let queryKey: QueryKey | undefined;

  if (
    ('inferQueryKey' satisfies keyof QueryKeyType) in options &&
    options.inferQueryKey === true
  ) {
    try {
      const name = getControlPlaneFunctionName(
        controlPlaneClient,
        fetcher as ControlPlaneClientProperties
      );

      queryKey = [underscore(name).toUpperCase()];
    } catch (e) {
      throw new Error(
        `Could not infer queryKey from controlPlaneFetcher. Please provide a queryKey or controlPlaneKey.\n\nOriginal error:\n\n${e}`
      );
    }
  }

  if (
    ('queryKeyFromControlPlaneKey' satisfies keyof QueryKeyType) in options &&
    options.queryKeyFromControlPlaneKey
  ) {
    queryKey = [underscore(options.queryKeyFromControlPlaneKey).toUpperCase()];
  }

  if (
    ('queryKey' satisfies keyof QueryKeyType) in options &&
    options.queryKey
  ) {
    queryKey = options.queryKey;
  }

  if (!queryKey) {
    throw new Error(
      'unable to assign queryKey in createControlPlaneQuery. Please provide a queryKey or controlPlaneKey or set inferKeyFromFetcher to true.'
    );
  }

  // call orignal createQuery
  return creatQuery_og({
    fetcher: async (variables: TVariables) => {
      return fetcher(variables, headers?.(variables));
    },
    ...options,
    queryKey,
  });
}
