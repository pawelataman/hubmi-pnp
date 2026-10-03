import type { ReactElement } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { ReasonSegment } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { AiBadge } from '../../ui/AiBadge';
import { Skeleton } from '../../ui/Skeleton';
import styles from './ResultsScreen.module.css';

interface MatchReasonProps {
  readonly innovationId: string;
}

export function MatchReason({ innovationId }: MatchReasonProps): ReactElement {
  const api: HubApi = useApi();
  const { state }: AsyncResult<readonly ReasonSegment[]> = useAsync<
    readonly ReasonSegment[]
  >(
    `reason:${innovationId}`,
    (signal: AbortSignal): Promise<readonly ReasonSegment[]> =>
      api.getMatchReason(innovationId, signal),
  );

  if (state.status !== 'ready') {
    return (
      <div className={styles['reason']} role="status" aria-live="polite">
        <span className={styles['reasonPending']}>
          {state.status === 'error'
            ? 'Nie udało się przygotować uzasadnienia.'
            : 'Dlaczego pasuje — piszemy uzasadnienie…'}
        </span>
        {state.status === 'loading' ? (
          <>
            <Skeleton width="90%" height="1.125rem" />
            <Skeleton width="70%" height="1.125rem" />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles['reason']}>
      <div className={styles['reasonHead']}>
        <strong>Dlaczego pasuje</strong>
        <AiBadge />
        <span className={styles['reasonNote']}>
          Sugestia AI, do weryfikacji
        </span>
      </div>
      <p className={styles['reasonText']}>
        {state.data.map(
          (segment: ReasonSegment, index: number): ReactElement =>
            segment.highlight ? (
              <mark key={String(index)} className={styles['highlight']}>
                {segment.text}
              </mark>
            ) : (
              <span key={String(index)}>{segment.text}</span>
            ),
        )}
      </p>
    </div>
  );
}
