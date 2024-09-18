import { useCallback, useState } from 'react';

import { useLoadingState } from './useLoadingState';

type SetStateNonOptimistic<T, IdType extends string = string> = {
  loadingId?: IdType;
  resolver: (prev: T, current: T) => Promise<T>;
};

type SetStateOptimistic<T, IdType extends string = string> = {
  optimisticValue: T;
  loadingId?: IdType;
  resolver: (prev: T, current: T) => Promise<T | void>;
};

type SetStateOptions<T, IdType extends string = string> =
  | SetStateNonOptimistic<T, IdType>
  | SetStateOptimistic<T, IdType>;

/*
 * A hook that streamlines state that is updated asynchronously.
 *
 * Normal use:
 *
 * ```tsx
 * const [state, setState, { loading }] = useStateWithLoading(0);
 *
 * const increment = async () => {
 *   setState({
 *     // loading is set to true when resolver is called
 *     resolver: async (prev, current) => {
 *
 *       await someOperation();
 *
 *       return prev + 1; // return new state
 *     }
 *   })
 * }
 * ```
 *
 * Optimistic update:
 *
 *
 * ```tsx
 * const [state, setState, { loading }] = useStateWithLoading(0);
 *
 * const increment = async () => {
 *   setState({
 *     resolver: async (prev, current) => {
 *       await someOperation();
 *
 *       // return void since state was provided with `optimisticValue`
 *     },
 *     optimisticValue: state + 1
 *   })
 * }
 * ```
 *
 * With loadingId:
 *  ```tsx
 *
 * // 4th tuple value is the "loadingId" which is a unique identifier for working with lists of items
 * const [state, setState, { loading, loadingId }] = useStateWithLoading(0);
 *
 * const increment = async () => {
 *   setState({
 *     resolver: async (prev, current) => {
 *       await someOperation();
 *
 *       return prev + 1; // return new state
 *     },
 *     loadingId: 'some-unique-id'
 *   })
 * }
 *
 * // You can use the loadingId to determine if a specific item is loading
 * <div data-loading={item.id === loadingId}>Some item in a list</div>
 *
 * ```
 */
export function useAsyncState<T, IdType extends string = string>(
  initialState: T
) {
  const [state, setOriginalState] = useState(initialState);
  const [performAsyncTask, flags] = useLoadingState<IdType>();

  const setStateOptimistic = useCallback(
    (options: SetStateOptimistic<T, IdType>) => {
      const { loadingId, resolver, optimisticValue } = options;
      const previousValue = state;

      setOriginalState(optimisticValue);

      return performAsyncTask({
        loadingId,
        task: async () => {
          try {
            const finalValue = await resolver(previousValue, state);
            if (finalValue !== undefined) {
              setOriginalState(finalValue);
            }
          } catch (e) {
            setOriginalState(previousValue); // Revert state on error
            throw e;
          }
        },
      });
    },
    [state, performAsyncTask]
  );

  const setStateNonOptimistic = useCallback(
    (options: SetStateNonOptimistic<T, IdType>) => {
      const { loadingId, resolver } = options;

      return performAsyncTask({
        loadingId,
        task: async () => {
          const result = await resolver(state, state);
          setOriginalState(result);
        },
      });
    },
    [state, performAsyncTask]
  );

  const setState = useCallback(
    (options: SetStateOptions<T, IdType>) => {
      if ('optimisticValue' in options) {
        return setStateOptimistic(options);
      }

      return setStateNonOptimistic(options);
    },
    [setStateNonOptimistic, setStateOptimistic]
  );

  return [state, setState, flags, setOriginalState] as const;
}
