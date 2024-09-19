// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useParams } from 'react-router-dom';

export const SUBROUTE_PARAMS = Object.freeze({
  threadId: ':threadId',
});

export type SubRouteParams = keyof typeof SUBROUTE_PARAMS;

type SubrouteParams = Partial<Record<SubRouteParams, string>>;

// Custom hook that extends useParams functionality
export function useConsoleParams() {
  return useParams() as SubrouteParams;
}
