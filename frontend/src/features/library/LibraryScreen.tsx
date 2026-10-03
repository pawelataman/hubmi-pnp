import {
  useRef,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
} from 'react';
import { Link } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type { InnovationSummary } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import {
  countByArea,
  filterInnovations,
  resultLabel,
  sortInnovations,
} from './filterInnovations';
import { InnovationTile } from './InnovationTile';
import { LibraryFilters } from './LibraryFilters';
import {
  EMPTY_QUERY,
  hasFilters,
  SORT_OPTIONS,
  type LibrarySort,
  type Option,
} from './libraryQuery';
import styles from './LibraryScreen.module.css';
import { useLibraryQuery, type LibraryQueryState } from './useLibraryQuery';

const SKELETON_TILES: readonly number[] = [1, 2, 3, 4, 5, 6];

export function LibraryScreen(): ReactElement {
  const api: HubApi = useApi();
  const { query, setQuery }: LibraryQueryState = useLibraryQuery();
  const searchRef: RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement | null>(null);
  const { state, retry }: AsyncResult<readonly InnovationSummary[]> = useAsync<
    readonly InnovationSummary[]
  >('library', (signal: AbortSignal): Promise<readonly InnovationSummary[]> =>
    api.listInnovations(signal),
  );
  const all: readonly InnovationSummary[] =
    state.status === 'ready' ? state.data : [];
  const shown: readonly InnovationSummary[] = sortInnovations(
    filterInnovations(all, query),
    query.sort,
  );

  function clear(): void {
    setQuery({ ...EMPTY_QUERY, sort: query.sort });
    searchRef.current?.focus();
  }

  return (
    <main className={styles['main']}>
      <div className={styles['header']}>
        <h1 className={styles['title']}>Biblioteka innowacji</h1>
        <p className={styles['lead']}>
          Sprawdzone rozwiązania społeczne z Małopolski. Wyszukaj je po nazwie
          albo zawęź listę filtrami.
        </p>
      </div>
      <LibraryFilters
        query={query}
        areaCounts={state.status === 'ready' ? countByArea(all, query) : null}
        onChange={setQuery}
        searchRef={searchRef}
      />
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : null}
      {state.status === 'loading' ? (
        <>
          <p role="status" className={styles['loading']}>
            Wczytujemy bibliotekę…
          </p>
          <div className={styles['grid']}>
            {SKELETON_TILES.map((key: number): ReactElement => (
              <div key={key} className={styles['skeletonTile']}>
                <Skeleton width="45%" height="1rem" />
                <Skeleton width="80%" height="1.75rem" />
                <Skeleton height="3rem" />
                <Skeleton width="60%" height="1.5rem" />
              </div>
            ))}
          </div>
        </>
      ) : null}
      {state.status === 'ready' ? (
        <>
          <div className={styles['bar']}>
            <p aria-live="polite" className={styles['count']}>
              {resultLabel(shown.length, all.length)}
            </p>
            {hasFilters(query) && shown.length > 0 ? (
              <Button variant="link" onClick={clear}>
                Wyczyść filtry
              </Button>
            ) : null}
            <label className={styles['sort']}>
              <span className={styles['sortLabel']}>Sortuj</span>
              <select
                className={styles['select']}
                value={query.sort}
                onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                  const next: Option<LibrarySort> | undefined =
                    SORT_OPTIONS.find(
                      (option: Option<LibrarySort>): boolean =>
                        option.value === event.target.value,
                    );
                  if (next !== undefined) {
                    setQuery({ ...query, sort: next.value });
                  }
                }}
              >
                {SORT_OPTIONS.map(
                  (option: Option<LibrarySort>): ReactElement => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
          {shown.length === 0 ? (
            <div className={styles['empty']}>
              <h2 className={styles['emptyTitle']}>
                Żadna innowacja nie pasuje do tych filtrów
              </h2>
              <p className={styles['emptyText']}>
                Zmień filtry albo opisz własne rozwiązanie.
              </p>
              <div className={styles['emptyActions']}>
                <Button variant="secondary" onClick={clear}>
                  Wyczyść filtry
                </Button>
                <Link to="/zglos-pomysl" className={buttonClass('link')}>
                  Zgłoś pomysł
                </Link>
              </div>
            </div>
          ) : (
            <ul aria-label="Innowacje" className={styles['grid']}>
              {shown.map((innovation: InnovationSummary): ReactElement => (
                <InnovationTile key={innovation.id} innovation={innovation} />
              ))}
            </ul>
          )}
        </>
      ) : null}
    </main>
  );
}
