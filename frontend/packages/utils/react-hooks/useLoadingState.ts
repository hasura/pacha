import { useCallback, useState } from 'react';

type AsyncTaskOptions<IdType extends string = string> =
  | {
      loadingId?: IdType;
      task: () => Promise<unknown>;
    }
  | (() => Promise<unknown>);

/**
 * `useLoadingState` is a custom React hook that manages loading states for asynchronous tasks.
 * It provides a function to perform an asynchronous task and tracks its loading state.
 * It also provides a function to check if a specific task is loading.
 * @example
 * ```typescript
 *
 * // Example 1: Not using loadingId
 * const SingleElement = () => {
 *   const [performAsyncTask, { loading }] = useLoadingState();
 *
 *   const handleClick = () => {
 *     performAsyncTask(async () => {
 *         const response = await fetch('/api/data');
 *         const data = await response.json();
 *         // Do something with the data
 *       });
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>
 *       {loading ? 'Loading...' : 'Fetch Data'}
 *     </button>
 *   );
 * };
 *
 * // Example 2: Using loadingId to manage loading state of list items
 *
 * const List = () => {
 *   const [performAsyncTask, { isIdLoading }] = useLoadingState();
 *
 *   const listItems = [{ id: '1' }, { id: '2' }, { id: '3' }];
 *
 *   const handleClick = (id) => {
 *     performAsyncTask({
 *       loadingId: id,
 *       task: async () => {
 *         const response = await fetch(`/api/data/${id}`);
 *         const data = await response.json();
 *         // Do something with the data
 *       },
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       {listItems.map(item => (
 *         <ListItem
 *           key={item.id}
 *           id={item.id}
 *           loading={isIdLoading(item.id)}
 *           onClick={() => handleClick(item.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export function useLoadingState<IdType extends string = string>() {
  const [isLoading, setLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<IdType[]>([]);

  const performAsyncTask = useCallback(
    (params: AsyncTaskOptions<IdType>) => {
      const task = typeof params === 'function' ? params : params.task;
      const loadingId =
        typeof params === 'function' ? undefined : params.loadingId;

      setLoading(true);

      if (loadingId) {
        setLoadingIds([...loadingIds, loadingId]);
      }

      return task()
        .catch(e => {
          throw e;
        })
        .finally(() => {
          setLoading(false);
          setLoadingIds(loadingIds.filter(id => id !== loadingId));
        });
    },
    [loadingIds]
  );

  const isIdLoading = useCallback(
    (id: IdType) => loadingIds.includes(id),
    [loadingIds]
  );

  return [performAsyncTask, { isIdLoading, isLoading, loadingIds }] as const;
}
