import type { ReactElement } from 'react';
import { Link } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import { STATUS_VIEW } from '../../api/status';
import type { CaseSummary, PersonaId } from '../../api/types';
import { useApi, useSession } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { buttonClass } from '../../ui/buttonClass';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { StatusPill } from '../../ui/StatusPill';
import styles from './CasesScreen.module.css';

export function CasesScreen(): ReactElement {
  const api: HubApi = useApi();
  const { persona } = useSession();
  const personaId: PersonaId | null = persona?.id ?? null;
  const { state, retry }: AsyncResult<readonly CaseSummary[]> = useAsync<
    readonly CaseSummary[]
  >(
    `my-cases:${personaId ?? 'none'}`,
    (signal: AbortSignal): Promise<readonly CaseSummary[]> =>
      personaId === null
        ? Promise.resolve([])
        : api.listMyCases(personaId, signal),
  );

  return (
    <main className={styles['main']}>
      <h1 className={styles['title']}>Moje sprawy</h1>
      {state.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['loading']}>
          <span className="visually-hidden">Wczytujemy sprawy…</span>
          <Skeleton height="4rem" />
          <Skeleton height="4rem" />
        </div>
      ) : null}
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <div className={styles['empty']}>
          <p>Nie masz jeszcze żadnych spraw.</p>
          <Link to="/zglos-pomysl" className={buttonClass('secondary')}>
            Zgłoś pomysł
          </Link>
        </div>
      ) : null}
      {state.status === 'ready' && state.data.length > 0 ? (
        <ul className={styles['list']}>
          {state.data.map((item: CaseSummary): ReactElement => (
            <li key={item.id} className={styles['row']}>
              <Link to={`/moje-sprawy/${item.id}`} className={styles['link']}>
                {item.type}: {item.title}
              </Link>
              <StatusPill
                tone={STATUS_VIEW[item.status].tone}
                icon={STATUS_VIEW[item.status].icon}
              >
                {item.status}
              </StatusPill>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
