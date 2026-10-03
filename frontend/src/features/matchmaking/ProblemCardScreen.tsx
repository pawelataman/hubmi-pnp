import type { ReactElement } from 'react';
import { Navigate, useNavigate, type NavigateFunction } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type { ProblemCard } from '../../api/types';
import { useApi, useMatchmaking } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { FlowSteps } from './FlowSteps';
import { ProblemCardEditor } from './ProblemCardEditor';
import styles from './ProblemCardScreen.module.css';

export function ProblemCardScreen(): ReactElement {
  const api: HubApi = useApi();
  const { state, update } = useMatchmaking();
  const navigate: NavigateFunction = useNavigate();
  const { state: load, retry }: AsyncResult<ProblemCard> =
    useAsync<ProblemCard>(
      `summary:${state.description}`,
      (signal: AbortSignal): Promise<ProblemCard> =>
        state.card === null
          ? api.summariseProblem(
              {
                description: state.description,
                municipality: state.municipality,
                onBehalf: state.onBehalf,
              },
              signal,
            )
          : Promise.resolve(state.card),
    );

  if (!state.submitted) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className={styles['main']}>
      <FlowSteps current={3} />
      <h1 className={styles['title']}>Sprawdź, czy dobrze rozumiemy</h1>
      {load.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['loading']}>
          <strong>Przygotowujemy streszczenie…</strong>
          <Skeleton width="94%" height="1.375rem" />
          <Skeleton width="80%" height="1.375rem" />
          <div className={styles['loadingChips']}>
            <Skeleton width="9.375rem" height="2.75rem" />
            <Skeleton width="7.5rem" height="2.75rem" />
            <Skeleton width="10.625rem" height="2.75rem" />
          </div>
        </div>
      ) : null}
      {load.status === 'error' ? (
        <LoadError message={load.message} onRetry={retry} />
      ) : null}
      {load.status === 'ready' ? (
        <ProblemCardEditor
          initial={load.data}
          initialAnswers={state.answers}
          onConfirm={(
            card: ProblemCard,
            answers: Readonly<Record<string, string | null>>,
          ): void => {
            update({ card, answers });
            void navigate('/znajdz/wyniki');
          }}
        />
      ) : null}
    </main>
  );
}
