import { useEffect, useEffectEvent, useState } from 'react';

export type AsyncState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: T }
  | { readonly status: 'error'; readonly message: string };

export interface AsyncResult<T> {
  readonly state: AsyncState<T>;
  readonly retry: () => void;
}

interface Settled<T> {
  readonly token: string;
  readonly state: AsyncState<T>;
}

const DEFAULT_MESSAGE: string = 'Nie udało się wczytać danych.';

function toMessage(error: unknown): string {
  return error instanceof Error && error.message !== ''
    ? error.message
    : DEFAULT_MESSAGE;
}

/**
 * Loads data for `key`. The state is derived from the last settled request,
 * so a new key or a retry shows `loading` without a state update in the
 * effect body.
 */
export function useAsync<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
): AsyncResult<T> {
  const [attempt, setAttempt] = useState<number>(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const token: string = `${key}#${String(attempt)}`;
  const run: (signal: AbortSignal) => Promise<T> = useEffectEvent(
    (signal: AbortSignal): Promise<T> => load(signal),
  );

  useEffect((): (() => void) => {
    const controller: AbortController = new AbortController();
    run(controller.signal).then(
      (data: T): void => {
        if (!controller.signal.aborted) {
          setSettled({ token, state: { status: 'ready', data } });
        }
      },
      (error: unknown): void => {
        if (!controller.signal.aborted) {
          setSettled({
            token,
            state: { status: 'error', message: toMessage(error) },
          });
        }
      },
    );
    return (): void => {
      controller.abort();
    };
  }, [token]);

  const state: AsyncState<T> =
    settled !== null && settled.token === token
      ? settled.state
      : { status: 'loading' };

  function retry(): void {
    setAttempt((previous: number): number => previous + 1);
  }

  return { state, retry };
}
