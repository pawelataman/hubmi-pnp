import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAsync, type AsyncResult } from './useAsync';

describe('useAsync', (): void => {
  it('goes from loading to ready', async (): Promise<void> => {
    const { result } = renderHook((): AsyncResult<string> =>
      useAsync<string>('a', (): Promise<string> => Promise.resolve('ok')),
    );
    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'ok' });
    });
  });

  it('reports an error and recovers on retry', async (): Promise<void> => {
    let calls: number = 0;
    function load(): Promise<string> {
      calls += 1;
      return calls === 1
        ? Promise.reject(new Error('Nie udało się.'))
        : Promise.resolve('ok');
    }
    const { result } = renderHook((): AsyncResult<string> =>
      useAsync<string>('a', load),
    );
    await waitFor((): void => {
      expect(result.current.state).toEqual({
        status: 'error',
        message: 'Nie udało się.',
      });
    });
    act((): void => {
      result.current.retry();
    });
    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'ok' });
    });
  });

  it('reloads when the key changes', async (): Promise<void> => {
    const { result, rerender } = renderHook(
      ({ id }: { id: string }): AsyncResult<string> =>
        useAsync<string>(id, (): Promise<string> => Promise.resolve(id)),
      { initialProps: { id: 'first' } },
    );
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'first' });
    });
    rerender({ id: 'second' });
    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'second' });
    });
  });

  it('aborts the request on unmount', (): void => {
    const signals: AbortSignal[] = [];
    const { unmount } = renderHook((): AsyncResult<string> =>
      useAsync<string>('a', (signal: AbortSignal): Promise<string> => {
        signals.push(signal);
        return new Promise<string>((): void => undefined);
      }),
    );
    unmount();
    expect(signals.at(-1)?.aborted).toBe(true);
  });
});
