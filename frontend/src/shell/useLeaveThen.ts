import { useCallback } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';

/**
 * Returns a function that goes to the start page and only then applies a
 * session change. The navigation is flushed first, so a route guard on the
 * page being left never sees the new session and never shows its picker.
 */
export function useLeaveThen(): (change: () => void) => void {
  const navigate: NavigateFunction = useNavigate();
  return useCallback(
    (change: () => void): void => {
      async function leave(): Promise<void> {
        await navigate('/', { flushSync: true });
        change();
      }
      void leave();
    },
    [navigate],
  );
}
