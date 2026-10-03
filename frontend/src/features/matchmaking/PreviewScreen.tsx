import type { ReactElement } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  type NavigateFunction,
} from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type {
  RedactionResult,
  RedactionSegment,
  Replacement,
} from '../../api/types';
import { useApi, useMatchmaking } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { FlowSteps } from './FlowSteps';
import styles from './PreviewScreen.module.css';

/** Polish plural of "informacja" in the accusative, for the banner. */
function informationWord(count: number): string {
  const lastTwo: number = count % 100;
  const last: number = count % 10;
  if (count === 1) {
    return 'informację';
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return 'informacje';
  }
  return 'informacji';
}

export function PreviewScreen(): ReactElement {
  const api: HubApi = useApi();
  const { state, update } = useMatchmaking();
  const navigate: NavigateFunction = useNavigate();
  const { state: load, retry }: AsyncResult<RedactionResult> =
    useAsync<RedactionResult>(
      `redact:${state.description}`,
      (signal: AbortSignal): Promise<RedactionResult> =>
        api.redactDescription(state.description, signal),
    );

  if (!state.submitted) {
    return <Navigate to="/" replace />;
  }

  function toggle(id: string): void {
    update({
      restored: state.restored.includes(id)
        ? state.restored.filter((item: string): boolean => item !== id)
        : [...state.restored, id],
    });
  }

  function renderSegment(
    data: RedactionResult,
    segment: RedactionSegment,
    index: number,
  ): ReactElement | null {
    if (segment.kind === 'text') {
      return <span key={String(index)}>{segment.text}</span>;
    }
    const replacement: Replacement | undefined = data.replacements.find(
      (item: Replacement): boolean => item.id === segment.replacementId,
    );
    if (replacement === undefined) {
      return null;
    }
    if (state.restored.includes(replacement.id)) {
      return <span key={String(index)}>{replacement.original}</span>;
    }
    return (
      <span
        key={String(index)}
        className={cx(
          styles['mark'],
          !replacement.restorable && styles['markDanger'],
        )}
      >
        {replacement.icon} {replacement.inlineLabel}
      </span>
    );
  }

  return (
    <main className={styles['main']}>
      <FlowSteps current={2} audience={state.audience} />
      <div className={styles['intro']}>
        <h1 className={styles['title']}>Tak zobaczy to system</h1>
        <p className={styles['lead']}>
          Sprawdź, co zamieniliśmy. Jeśli coś jest potrzebne do wyszukania,
          możesz to przywrócić.
        </p>
      </div>
      {load.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['loading']}>
          <strong>Sprawdzamy, czy opis nie zawiera danych osobowych…</strong>
          <Skeleton width="96%" />
          <Skeleton width="88%" />
          <Skeleton width="92%" />
          <Skeleton width="60%" />
        </div>
      ) : null}
      {load.status === 'error' ? (
        <LoadError message={load.message} onRetry={retry} />
      ) : null}
      {load.status === 'ready' ? (
        <>
          <div role="status" className={styles['banner']}>
            <span className={styles['bannerMark']} aria-hidden="true">
              ✓
            </span>
            {load.data.replacements.length === 0
              ? 'Nie znaleźliśmy informacji, które mogą identyfikować osobę.'
              : `Usunęliśmy ${String(
                  load.data.replacements.length - state.restored.length,
                )} ${informationWord(
                  load.data.replacements.length - state.restored.length,
                )}, które mogą identyfikować osobę. Do wyszukiwania nie są potrzebne.`}
          </div>
          <div
            className={cx(
              styles['columns'],
              load.data.replacements.length === 0 && styles['single'],
            )}
          >
            <p className={styles['text']}>
              {load.data.segments.map(
                (
                  segment: RedactionSegment,
                  index: number,
                ): ReactElement | null =>
                  renderSegment(load.data, segment, index),
              )}
            </p>
            {load.data.replacements.length === 0 ? null : (
              <div className={styles['swaps']}>
                <strong className={styles['swapsTitle']}>
                  Zamiany ({String(load.data.replacements.length)})
                </strong>
                <ul className={styles['swapList']}>
                  {load.data.replacements.map(
                    (replacement: Replacement): ReactElement => {
                      const restored: boolean = state.restored.includes(
                        replacement.id,
                      );
                      return (
                        <li key={replacement.id} className={styles['swap']}>
                          <span
                            className={styles['swapIcon']}
                            aria-hidden="true"
                          >
                            {replacement.icon}
                          </span>
                          <div className={styles['swapText']}>
                            <span className={styles['swapTag']}>
                              {replacement.tag}
                            </span>
                            <span className={styles['swapKind']}>
                              {replacement.kind}
                            </span>
                          </div>
                          {replacement.restorable ? (
                            <Button
                              variant="neutral"
                              className={styles['swapButton']}
                              aria-label={
                                restored
                                  ? `Usuń ponownie ${replacement.tag}`
                                  : `Cofnij zamianę ${replacement.tag}`
                              }
                              onClick={(): void => {
                                toggle(replacement.id);
                              }}
                            >
                              {restored ? 'Usuń ponownie' : '↶ Cofnij'}
                            </Button>
                          ) : null}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : null}
      <div className={styles['actions']}>
        <Link to="/" className={buttonClass('secondary', 'lg')}>
          ← Wróć do edycji
        </Link>
        <Button
          size="lg"
          disabled={load.status !== 'ready'}
          onClick={(): void => {
            void navigate('/znajdz/doprecyzowanie');
          }}
        >
          Akceptuję, szukaj dalej →
        </Button>
      </div>
    </main>
  );
}
