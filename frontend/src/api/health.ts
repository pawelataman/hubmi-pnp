export interface HealthResponse {
  readonly status: 'ok';
  readonly service: string;
  readonly version: string;
}

function isHealthResponse(value: unknown): value is HealthResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    value.status === 'ok' &&
    'service' in value &&
    typeof value.service === 'string' &&
    value.service.trim().length > 0 &&
    'version' in value &&
    typeof value.version === 'string' &&
    value.version.trim().length > 0
  );
}

export async function fetchHealth(signal: AbortSignal): Promise<HealthResponse> {
  const requestSignal: AbortSignal = AbortSignal.any([
    signal,
    AbortSignal.timeout(10_000),
  ]);
  const response: Response = await fetch('/api/v1/health', {
    headers: { Accept: 'application/json' },
    signal: requestSignal,
  });

  if (!response.ok) {
    throw new Error(`The API returned HTTP ${String(response.status)}.`);
  }

  const data: unknown = await response.json();

  if (!isHealthResponse(data)) {
    throw new Error('The API returned an unexpected health response.');
  }

  return data;
}

