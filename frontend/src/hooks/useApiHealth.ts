import { useEffect, useState } from 'react';

import { fetchHealth, type HealthResponse } from '../api/health';

export type ApiHealthState =
  | { readonly status: 'loading' }
  | { readonly status: 'connected'; readonly data: HealthResponse }
  | { readonly status: 'error'; readonly message: string };

interface ApiHealthResult {
  readonly state: ApiHealthState;
  readonly retry: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'The API took too long to respond. Check the backend and try again.';
  }

  if (error instanceof TypeError) {
    return 'Could not reach the API. Check the backend and try again.';
  }

  return error instanceof Error ? error.message : 'An unexpected request error occurred.';
}

export function useApiHealth(): ApiHealthResult {
  const [state, setState] = useState<ApiHealthState>({ status: 'loading' });
  const [attempt, setAttempt] = useState<number>(0);

  useEffect((): (() => void) => {
    const controller: AbortController = new AbortController();

    async function checkHealth(): Promise<void> {
      try {
        const data: HealthResponse = await fetchHealth(controller.signal);
        if (!controller.signal.aborted) {
          setState({ status: 'connected', data });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: getErrorMessage(error) });
        }
      }
    }

    void checkHealth();
    return (): void => { controller.abort(); };
  }, [attempt]);

  function retry(): void {
    setState({ status: 'loading' });
    setAttempt((previous: number): number => previous + 1);
  }

  return { state, retry };
}

