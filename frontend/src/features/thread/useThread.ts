import { useState } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { CaseThread, PersonaId } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncState } from '../../app/useAsync';

export interface ThreadResult {
  readonly state: AsyncState<CaseThread>;
  readonly retry: () => void;
  readonly send: (from: PersonaId, text: string) => Promise<void>;
}

/** Loads a case thread and keeps the copy returned by the last send. */
export function useThread(caseId: string): ThreadResult {
  const api: HubApi = useApi();
  const [sent, setSent] = useState<CaseThread | null>(null);
  const { state, retry } = useAsync<CaseThread>(
    `case:${caseId}`,
    (signal: AbortSignal): Promise<CaseThread> => api.getCase(caseId, signal),
  );

  async function send(from: PersonaId, text: string): Promise<void> {
    setSent(await api.sendMessage(caseId, from, text));
  }

  const current: AsyncState<CaseThread> =
    state.status === 'ready' && sent !== null && sent.id === caseId
      ? { status: 'ready', data: sent }
      : state;

  return { state: current, retry, send };
}
