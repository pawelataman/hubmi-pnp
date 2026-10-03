import type { ReactElement } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { LocalStat, LocalStats, StatRow } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import styles from './ResultsScreen.module.css';

interface LocalStatsPanelProps {
  readonly municipality: string;
}

export function LocalStatsPanel({
  municipality,
}: LocalStatsPanelProps): ReactElement {
  const api: HubApi = useApi();
  const { state, retry }: AsyncResult<LocalStats> = useAsync<LocalStats>(
    `local-stats:${municipality}`,
    (signal: AbortSignal): Promise<LocalStats> =>
      api.getLocalStats(municipality, signal),
  );

  return (
    <section className={styles['panel']}>
      <h2 className={styles['panelTitle']}>3. Skala w Twojej gminie</h2>
      {state.status === 'loading' ? (
        <div
          role="status"
          aria-live="polite"
          className={styles['statsLoading']}
        >
          <Skeleton width="70%" />
          <Skeleton />
          <Skeleton />
        </div>
      ) : null}
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : null}
      {state.status === 'ready' ? (
        <>
          {state.data.stats.map((stat: LocalStat): ReactElement => (
            <div key={stat.label} className={styles['stat']}>
              <strong className={styles['statLabel']}>{stat.label}</strong>
              {stat.rows.map((row: StatRow): ReactElement => (
                <div key={row.who} className={styles['statRow']}>
                  <span className={styles['statWho']}>{row.who}</span>
                  <div className={styles['bar']}>
                    <div
                      className={cx(
                        row.primary ? styles['barPrimary'] : styles['barOther'],
                      )}
                      style={{
                        width: `${String((row.value / stat.max) * 100)}%`,
                      }}
                    />
                  </div>
                  <strong className={styles['statValue']}>
                    {`${String(row.value)}%`}
                  </strong>
                </div>
              ))}
            </div>
          ))}
          <span className={styles['statsSource']}>{state.data.source}</span>
        </>
      ) : null}
    </section>
  );
}
