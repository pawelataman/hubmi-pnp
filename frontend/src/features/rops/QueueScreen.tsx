import { useState, type KeyboardEvent, type ReactElement } from 'react';
import { Link } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import { STATUS_VIEW } from '../../api/status';
import type { CaseType, QueuePage, QueueRow } from '../../api/types';
import { useApi, useToast } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { ChoiceChip } from '../../ui/ChoiceChip';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { StatusPill } from '../../ui/StatusPill';
import { TYPE_ICONS } from './caseTypes';
import styles from './QueueScreen.module.css';

const TYPE_FILTERS: readonly {
  readonly label: string;
  readonly type: CaseType | null;
}[] = [
  { label: 'Wszystkie typy', type: null },
  { label: 'Potrzeba', type: 'Potrzeba' },
  { label: 'Pomysł', type: 'Pomysł' },
  { label: 'Opinia', type: 'Opinia' },
  { label: 'Do testów', type: 'Do testów' },
  { label: 'Zapytanie do autora', type: 'Zapytanie' },
];

const SKELETON_ROWS: readonly number[] = [1, 2, 3, 4, 5, 6];
const PAGES: readonly number[] = [1, 2, 3];
const MENU_FILTERS: readonly string[] = ['Status ▾', 'Obszar ▾', 'Powiat ▾'];

export function QueueScreen(): ReactElement {
  const api: HubApi = useApi();
  const { stub } = useToast();
  const [type, setType] = useState<CaseType | null>(null);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const { state, retry }: AsyncResult<QueuePage> = useAsync<QueuePage>(
    `queue:${type ?? 'all'}`,
    (signal: AbortSignal): Promise<QueuePage> =>
      api.listQueue({ type }, signal),
  );
  const rows: readonly QueueRow[] =
    state.status === 'ready' ? state.data.rows : [];
  const allSelected: boolean =
    rows.length > 0 && selected.length === rows.length;
  const someSelected: boolean = selected.length > 0 && !allSelected;

  function filter(next: CaseType | null): void {
    setType(next);
    setSelected([]);
  }

  function toggle(id: string): void {
    setSelected((current: readonly string[]): readonly string[] =>
      current.includes(id)
        ? current.filter((item: string): boolean => item !== id)
        : [...current, id],
    );
  }

  function toggleAll(): void {
    setSelected(allSelected ? [] : rows.map((row: QueueRow): string => row.id));
  }

  return (
    <main className={styles['main']}>
      <div className={styles['top']}>
        <div className={styles['heading']}>
          <h1 className={styles['title']}>Kolejka zgłoszeń</h1>
          {state.status === 'ready' ? (
            <span className={styles['totals']}>
              {`${String(state.data.open)} otwartych · ${String(state.data.fresh)} nowych · ${String(state.data.overdue)} bez odpowiedzi ponad 48 h`}
            </span>
          ) : null}
        </div>
        <input
          type="text"
          className={styles['search']}
          aria-label="Szukaj w zgłoszeniach"
          placeholder="Szukaj w zgłoszeniach…"
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>): void => {
            if (event.key === 'Enter') {
              stub();
            }
          }}
        />
      </div>
      <div className={styles['filters']}>
        <div
          role="group"
          aria-label="Typ zgłoszenia"
          className={styles['chips']}
        >
          {TYPE_FILTERS.map(
            (item: {
              readonly label: string;
              readonly type: CaseType | null;
            }): ReactElement => (
              <ChoiceChip
                key={item.label}
                label={item.label}
                selected={item.type === type}
                onToggle={(): void => {
                  filter(item.type);
                }}
              />
            ),
          )}
        </div>
        <span className={styles['separator']} aria-hidden="true" />
        {MENU_FILTERS.map((label: string): ReactElement => (
          <button
            key={label}
            type="button"
            className={styles['filterButton']}
            onClick={stub}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={cx(styles['filterButton'], styles['review'])}
          onClick={stub}
        >
          ⚑ Sprawdź redakcję (3)
        </button>
      </div>
      {selected.length > 0 ? (
        <div className={styles['selection']}>
          <strong>{`Zaznaczono ${String(selected.length)}`}</strong>
          <button type="button" className={styles['bulk']} onClick={stub}>
            Przypisz eksperta ▾
          </button>
          <button type="button" className={styles['bulk']} onClick={stub}>
            Zmień status ▾
          </button>
          <button
            type="button"
            className={styles['clear']}
            onClick={(): void => {
              setSelected([]);
            }}
          >
            Odznacz
          </button>
        </div>
      ) : null}
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : (
        <div className={styles['tableCard']}>
          {state.status === 'loading' ? (
            <div role="status" aria-live="polite" className={styles['loading']}>
              Wczytujemy zgłoszenia…
            </div>
          ) : null}
          <table className={styles['table']}>
            <colgroup>
              <col className={styles['colCheck']} />
              <col className={styles['colType']} />
              <col />
              <col className={styles['colArea']} />
              <col className={styles['colPlace']} />
              <col className={styles['colDate']} />
              <col className={styles['colStatus']} />
              <col className={styles['colExpert']} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={styles['checkCell']}>
                  <label className={styles['checkLabel']}>
                    <input
                      type="checkbox"
                      className={styles['checkbox']}
                      aria-label="Zaznacz wszystkie"
                      checked={allSelected}
                      disabled={state.status !== 'ready'}
                      ref={(input: HTMLInputElement | null): void => {
                        if (input !== null) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={toggleAll}
                    />
                  </label>
                </th>
                <th scope="col">Typ</th>
                <th scope="col">Tytuł</th>
                <th scope="col">Obszar</th>
                <th scope="col">Gmina / powiat</th>
                <th scope="col">Data ↓</th>
                <th scope="col">Status</th>
                <th scope="col">Ekspert</th>
              </tr>
            </thead>
            <tbody>
              {state.status === 'loading'
                ? SKELETON_ROWS.map((key: number): ReactElement => (
                    <tr key={key} className={styles['skeletonRow']}>
                      <td className={styles['checkCell']}>
                        <Skeleton width="1.375rem" height="1.375rem" />
                      </td>
                      <td>
                        <Skeleton height="1rem" />
                      </td>
                      <td>
                        <Skeleton width="80%" height="1rem" />
                      </td>
                      <td>
                        <Skeleton height="1rem" />
                      </td>
                      <td>
                        <Skeleton height="1rem" />
                      </td>
                      <td>
                        <Skeleton height="1rem" />
                      </td>
                      <td>
                        <Skeleton height="1.75rem" />
                      </td>
                      <td>
                        <Skeleton height="1rem" />
                      </td>
                    </tr>
                  ))
                : null}
              {rows.map((row: QueueRow): ReactElement => {
                const isSelected: boolean = selected.includes(row.id);
                const view: (typeof STATUS_VIEW)[QueueRow['status']] =
                  STATUS_VIEW[row.status];
                return (
                  <tr
                    key={row.id}
                    className={cx(isSelected && styles['picked'])}
                  >
                    <td className={styles['checkCell']}>
                      <label className={styles['checkLabel']}>
                        <input
                          type="checkbox"
                          className={styles['checkbox']}
                          aria-label={`Zaznacz: ${row.title}`}
                          checked={isSelected}
                          onChange={(): void => {
                            toggle(row.id);
                          }}
                        />
                      </label>
                    </td>
                    <td className={styles['type']}>
                      {TYPE_ICONS[row.type]} {row.type}
                    </td>
                    <td>
                      <div className={styles['titleCell']}>
                        <Link
                          to={`/rops/kolejka/${row.id}`}
                          className={styles['link']}
                        >
                          {row.title}
                        </Link>
                        {row.flagged ? (
                          <span className={styles['flag']}>
                            ⚑ Sprawdź redakcję — usunięto informacje o zdrowiu
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>{row.area}</td>
                    <td>{row.place}</td>
                    <td className={styles['date']}>{row.date}</td>
                    <td className={styles['statusCell']}>
                      <StatusPill tone={view.tone} icon={view.icon}>
                        {row.status}
                      </StatusPill>
                    </td>
                    <td className={cx(row.expert === null && styles['muted'])}>
                      {row.expert ?? 'Nieprzypisany'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {state.status === 'ready' ? (
        <div className={styles['footer']}>
          <span>{`Wyniki 1–${String(rows.length)} z ${String(state.data.total)} · dane przykładowe`}</span>
          <nav aria-label="Strony wyników" className={styles['pages']}>
            {PAGES.map((page: number): ReactElement => (
              <button
                key={page}
                type="button"
                className={cx(
                  styles['page'],
                  page === 1 && styles['currentPage'],
                )}
                aria-current={page === 1 ? 'page' : undefined}
                onClick={stub}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      ) : null}
    </main>
  );
}
