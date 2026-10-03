import type { ReactElement } from 'react';

import type { HubApi } from '../../api/HubApi';
import type {
  AreaTrend,
  DistrictTile,
  Gap,
  LabelledValue,
  Trends,
} from '../../api/types';
import { useApi, useToast } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import styles from './TrendsScreen.module.css';
import { tileLevel, topDistricts, trendDelta, type TrendDelta } from './trends';

const BAR_MAX: number = 40;
const TILE_SKELETONS: readonly number[] = Array.from(
  { length: 21 },
  (_: unknown, index: number): number => index,
);
const LEGEND: readonly { readonly label: string; readonly level: string }[] = [
  { label: '0–9', level: 'swatch1' },
  { label: '10–19', level: 'swatch2' },
  { label: '20–29', level: 'swatch3' },
  { label: '30+', level: 'swatch4' },
];

export function TrendsScreen(): ReactElement {
  const api: HubApi = useApi();
  const { stub } = useToast();
  const { state, retry }: AsyncResult<Trends> = useAsync<Trends>(
    'trends',
    (signal: AbortSignal): Promise<Trends> => api.getTrends(signal),
  );

  return (
    <main className={styles['main']}>
      <div className={styles['top']}>
        <div className={styles['heading']}>
          <h1 className={styles['title']}>Trendy potrzeb</h1>
          <span className={styles['subtitle']}>
            Dane zagregowane do powiatu · widoczne tylko dla administratorów ·
            dane przykładowe
          </span>
        </div>
        <div className={styles['filters']}>
          <button
            type="button"
            className={styles['filterButton']}
            onClick={stub}
          >
            Ostatnie 6 miesięcy ▾
          </button>
          <button
            type="button"
            className={styles['filterButton']}
            onClick={stub}
          >
            Wszystkie obszary ▾
          </button>
        </div>
      </div>
      {state.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['skeletons']}>
          <div className={styles['skeletonCard']}>
            <strong className={styles['muted']}>Liczymy zgłoszenia…</strong>
            <Skeleton height="1.875rem" />
            <Skeleton height="1.875rem" />
            <Skeleton height="1.875rem" />
            <Skeleton height="1.875rem" />
          </div>
          <div className={styles['skeletonTiles']}>
            {TILE_SKELETONS.map((key: number): ReactElement => (
              <Skeleton key={key} height="3.5rem" />
            ))}
          </div>
        </div>
      ) : null}
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : null}
      {state.status === 'ready' ? (
        <>
          <div className={styles['columns']}>
            <section className={styles['card']}>
              <div className={styles['cardHead']}>
                <h2 className={styles['cardTitle']}>
                  Zgłoszone potrzeby według obszaru
                </h2>
                <span className={styles['cardNote']}>
                  Liczba zgłoszeń w miesiącu, IV–IX 2026
                </span>
              </div>
              <div className={styles['trendGrid']}>
                <span />
                <div className={styles['months']}>
                  {state.data.months.map((month: string): ReactElement => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
                <span className={styles['columnHead']}>
                  {state.data.months.at(-1)}
                </span>
                <span className={styles['columnHead']}>Zmiana</span>
                {state.data.areas.map((area: AreaTrend): ReactElement => {
                  const delta: TrendDelta = trendDelta(area.values);
                  return (
                    <div key={area.area} className={styles['trendRow']}>
                      <span className={styles['areaName']}>{area.area}</span>
                      <div className={styles['bars']}>
                        {area.values.map(
                          (value: number, index: number): ReactElement => (
                            <div
                              key={state.data.months[index] ?? String(index)}
                              title={String(value)}
                              className={
                                index === area.values.length - 1
                                  ? styles['barLast']
                                  : styles['bar']
                              }
                              style={{
                                height: `${String((value / BAR_MAX) * 100)}%`,
                              }}
                            />
                          ),
                        )}
                      </div>
                      <strong className={styles['last']}>
                        {area.values.at(-1)}
                      </strong>
                      <span
                        className={
                          delta.rising ? styles['rising'] : styles['falling']
                        }
                      >
                        {delta.text}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="link"
                className={styles['textButton']}
                onClick={stub}
              >
                Pokaż jako tabelę
              </Button>
            </section>
            <section className={styles['card']}>
              <div className={styles['cardHead']}>
                <h2 className={styles['cardTitle']}>
                  Zgłoszenia według powiatów
                </h2>
                <span className={styles['cardNote']}>
                  Kartogram, układ uproszczony · IV–IX 2026
                </span>
              </div>
              <div className={styles['map']}>
                {state.data.districts.map(
                  (tile: DistrictTile): ReactElement => (
                    <div
                      key={tile.name}
                      title={`${tile.name}: ${String(tile.value)}`}
                      className={
                        styles[`level${String(tileLevel(tile.value))}`]
                      }
                      style={{ gridRow: tile.row, gridColumn: tile.col }}
                    >
                      <span className={styles['abbr']}>{tile.abbr}</span>
                      <strong className={styles['count']}>{tile.value}</strong>
                    </div>
                  ),
                )}
              </div>
              <div className={styles['legend']}>
                {LEGEND.map(
                  (item: {
                    readonly label: string;
                    readonly level: string;
                  }): ReactElement => (
                    <span key={item.label} className={styles['legendItem']}>
                      <span className={styles[item.level]} aria-hidden="true" />
                      {item.label}
                    </span>
                  ),
                )}
                <span className={styles['legendNote']}>
                  Liczba w każdym polu
                </span>
              </div>
              <table className={styles['topTable']}>
                <caption className={styles['topCaption']}>
                  Tabela alternatywna · najwięcej zgłoszeń
                </caption>
                <tbody>
                  {topDistricts(state.data.districts, 4).map(
                    (item: LabelledValue): ReactElement => (
                      <tr key={item.label}>
                        <th scope="row">{item.label}</th>
                        <td>
                          <strong>{item.value}</strong>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
              <Button
                variant="link"
                className={styles['textButton']}
                onClick={stub}
              >
                Pokaż wszystkie 22 powiaty
              </Button>
            </section>
          </div>
          <section className={styles['card']}>
            <div className={styles['gapsHead']}>
              <h2 className={styles['cardTitle']}>
                Luki: potrzeby bez dopasowanej innowacji
              </h2>
              <span className={styles['cardNote']}>
                Klastry podobnych zgłoszeń
              </span>
            </div>
            {state.data.gaps.map((gap: Gap): ReactElement => (
              <div key={gap.title} className={styles['gap']}>
                <span className={styles['gapBadge']}>◇ Luka</span>
                <div className={styles['gapText']}>
                  <strong className={styles['gapTitle']}>{gap.title}</strong>
                  <span className={styles['gapMeta']}>
                    {`${String(gap.count)} zgłoszeń · ${String(gap.districts)} powiatów · ostatnie ${gap.last}`}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles['gapButton']}
                  onClick={stub}
                >
                  Przekształć w wyzwanie do naboru
                </button>
              </div>
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
