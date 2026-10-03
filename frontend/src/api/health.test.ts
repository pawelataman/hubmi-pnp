import { describe, expect, it, vi } from 'vitest';

import { fetchHealth, type HealthResponse } from './health';

const health: HealthResponse = {
  status: 'ok',
  service: 'Hubmi API',
  version: '0.1.0',
};

describe('fetchHealth', (): void => {
  it('returns a validated health response', async (): Promise<void> => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(health)));

    await expect(fetchHealth(new AbortController().signal)).resolves.toEqual(health);
  });

  it('rejects unsuccessful HTTP responses', async (): Promise<void> => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(fetchHealth(new AbortController().signal)).rejects.toThrow('HTTP 503');
  });

  it.each([null, {}, { ...health, status: 'error' }, { ...health, service: '' }])(
    'rejects an invalid response: %j',
    async (payload: unknown): Promise<void> => {
      vi.stubGlobal(
        'fetch',
        vi.fn<typeof fetch>().mockResolvedValue(Response.json(payload)),
      );

      await expect(fetchHealth(new AbortController().signal)).rejects.toThrow(
        'unexpected health response',
      );
    },
  );

  it('propagates network failures', async (): Promise<void> => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(fetchHealth(new AbortController().signal)).rejects.toThrow(
      'Failed to fetch',
    );
  });

  it('passes cancellation through to the request', async (): Promise<void> => {
    const controller: AbortController = new AbortController();
    const cancellation: DOMException = new DOMException('Cancelled', 'AbortError');
    controller.abort(cancellation);
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(
        (_input: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
          const signal: AbortSignal | null | undefined = options?.signal;
          expect(signal?.aborted).toBe(true);
          return Promise.reject(cancellation);
        },
      ),
    );

    await expect(fetchHealth(controller.signal)).rejects.toBe(cancellation);
  });
});

