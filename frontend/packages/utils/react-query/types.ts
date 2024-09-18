/* eslint-disable @typescript-eslint/no-restricted-imports */
import { QueryKey } from "@tanstack/react-query";
import { CompatibleError, MutationHook } from "react-query-kit";

export type ExtendedMutationHook<
  TData = unknown,
  TVariables = void,
  TError = CompatibleError,
  TDefaultContext = unknown
> = MutationHook<TData, TVariables, TError, TDefaultContext> & {
  getDependentQueryKeys: () => QueryKey[];
  waitForDependentQueries: (timeout?: number) => Promise<void>;
};
