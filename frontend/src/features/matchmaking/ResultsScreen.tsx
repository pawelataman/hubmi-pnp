import { useState, type ReactElement } from 'react';
import { Link, Navigate } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type {
  FitTag,
  MatchBand,
  MatchCard,
  MatchResults,
  ProblemCard,
  SimilarProblem,
} from '../../api/types';
import { useApi, useMatchmaking, useToast } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { Switch } from '../../ui/Switch';
import { LocalStatsPanel } from './LocalStatsPanel';
import { MatchReason } from './MatchReason';
import styles from './ResultsScreen.module.css';

type Feedback = 'useful' | 'useless';

function innovationsNoun(count: number): string {
  if (count === 1) {
    return 'innowację';
  }
  const lastTwo: number = count % 100;
  const last: number = count % 10;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)
    ? 'innowacje'
    : 'innowacji';
}

const BANDS: Readonly<
  Record<MatchBand, { readonly label: string; readonly dots: string }>
> = {
  strong: { label: 'Silne dopasowanie', dots: '●●●' },
  medium: { label: 'Średnie dopasowanie', dots: '●●○' },
  weak: { label: 'Słabe dopasowanie', dots: '●○○' },
};

export function ResultsScreen(): ReactElement {
  const api: HubApi = useApi();
  const { state } = useMatchmaking();
  const { stub } = useToast();
  const [feedback, setFeedback] = useState<Readonly<Record<string, Feedback>>>(
    {},
  );
  // Ids of the cards whose "why it fits" text has arrived (or failed).
  const [settled, setSettled] = useState<readonly string[]>([]);
  const card: ProblemCard | null = state.card;
  const { state: load, retry }: AsyncResult<MatchResults> =
    useAsync<MatchResults>(
      `matches:${state.description}`,
      (signal: AbortSignal): Promise<MatchResults> =>
        card === null
          ? Promise.reject(new Error('Brak karty problemu.'))
          : api.findMatches(card, signal),
    );

  if (!state.submitted) {
    return <Navigate to="/" replace />;
  }
  if (card === null) {
    return <Navigate to="/znajdz/doprecyzowanie" replace />;
  }

  function reasonSettled(innovationId: string): void {
    setSettled((current: readonly string[]): readonly string[] =>
      current.includes(innovationId) ? current : [...current, innovationId],
    );
  }

  const reasonsPending: boolean =
    load.status === 'ready' &&
    load.data.cards.some(
      (match: MatchCard): boolean => !settled.includes(match.innovationId),
    );

  function rate(innovationId: string, value: Feedback): void {
    setFeedback(
      (
        current: Readonly<Record<string, Feedback>>,
      ): Readonly<Record<string, Feedback>> => {
        const { [innovationId]: previous, ...rest } = current;
        return previous === value ? rest : { ...rest, [innovationId]: value };
      },
    );
  }

  return (
    <main className={styles['main']}>
      <div className={styles['header']}>
        <div className={styles['headerText']}>
          <h1 className={styles['title']}>Rozwiązania dla Twojego problemu</h1>
          <div className={styles['terms']}>
            <span className={styles['termsLabel']}>Szukamy dla:</span>
            {load.status === 'ready'
              ? load.data.searchTerms.map((term: string): ReactElement => (
                  <span key={term} className={styles['term']}>
                    {term}
                  </span>
                ))
              : null}
            <Link to="/" className={styles['change']}>
              Zmień opis
            </Link>
          </div>
        </div>
        <div className={styles['switchSlot']}>
          <Switch checked={false} onChange={stub}>
            Pokaż, jak system dopasował
          </Switch>
        </div>
      </div>
      <div className={styles['columns']}>
        <section className={styles['results']}>
          <div className={styles['resultsHead']}>
            <h2 className={styles['resultsTitle']}>
              1. Innowacje, które mogą pomóc
            </h2>
            {load.status === 'ready' ? (
              <span className={styles['count']}>
                {String(load.data.cards.length)} wyniki
              </span>
            ) : null}
          </div>
          {load.status === 'loading' ? (
            <>
              <div
                role="status"
                aria-live="polite"
                className={styles['loadingNote']}
              >
                Szukamy innowacji…
              </div>
              {[0, 1, 2].map((index: number): ReactElement => (
                <div key={String(index)} className={styles['skeletonCard']}>
                  <Skeleton
                    width={index === 0 ? '60%' : '50%'}
                    height="1.75rem"
                  />
                  <div className={styles['skeletonTags']}>
                    <Skeleton width="6.875rem" height="2.125rem" />
                    <Skeleton width="7.5rem" height="2.125rem" />
                  </div>
                  <div className={styles['skeletonBody']} />
                </div>
              ))}
            </>
          ) : null}
          {load.status === 'error' ? (
            <LoadError message={load.message} onRetry={retry} />
          ) : null}
          {load.status === 'ready' && reasonsPending ? (
            <div
              role="status"
              aria-live="polite"
              className={styles['loadingNote']}
            >
              {`Mamy ${String(load.data.cards.length)} ${innovationsNoun(load.data.cards.length)}. Uzasadnienia pojawiają się po kolei…`}
            </div>
          ) : null}
          {load.status === 'ready'
            ? load.data.cards.map((match: MatchCard): ReactElement => {
                const band: { readonly label: string; readonly dots: string } =
                  BANDS[match.band];
                const current: Feedback | undefined =
                  feedback[match.innovationId];
                return (
                  <article key={match.innovationId} className={styles['card']}>
                    <div className={styles['cardHead']}>
                      <div className={styles['cardTitle']}>
                        <span className={styles['category']}>
                          {match.category}
                        </span>
                        <h3 className={styles['name']}>{match.name}</h3>
                      </div>
                      <span
                        className={cx(
                          styles['band'],
                          match.band === 'weak' && styles['bandWeak'],
                        )}
                      >
                        <span className={styles['dots']}>{band.dots}</span>
                        {band.label}
                      </span>
                    </div>
                    <div className={styles['fit']}>
                      {match.fit.map((tag: FitTag): ReactElement => (
                        <span
                          key={tag.label}
                          className={cx(
                            styles['fitTag'],
                            !tag.ok && styles['fitNo'],
                          )}
                        >
                          {tag.ok ? '✓' : '✗'} {tag.label}
                        </span>
                      ))}
                    </div>
                    <MatchReason
                      innovationId={match.innovationId}
                      onSettled={reasonSettled}
                    />
                    <div className={styles['cardFoot']}>
                      <span className={styles['verified']}>
                        ✓ Zweryfikowano {match.verified}
                      </span>
                      <span>
                        Koszt:{' '}
                        <strong className={styles['cost']}>{match.cost}</strong>
                      </span>
                      <div className={styles['cardActions']}>
                        <Button
                          variant="neutral"
                          className={styles['feedback']}
                          aria-label={`Przydatne: ${match.name}`}
                          aria-pressed={current === 'useful'}
                          onClick={(): void => {
                            rate(match.innovationId, 'useful');
                          }}
                        >
                          ✓ Przydatne
                        </Button>
                        <Button
                          variant="neutral"
                          className={styles['feedback']}
                          aria-label={`Nieprzydatne: ${match.name}`}
                          aria-pressed={current === 'useless'}
                          onClick={(): void => {
                            rate(match.innovationId, 'useless');
                          }}
                        >
                          ✕ Nieprzydatne
                        </Button>
                        <Link
                          to={`/innowacje/${match.innovationId}`}
                          aria-label={`Zobacz szczegóły: ${match.name}`}
                          className={cx(
                            buttonClass('primary'),
                            styles['details'],
                          )}
                        >
                          Zobacz szczegóły →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            : null}
          <div className={styles['handoff']}>
            <div className={styles['handoffText']}>
              <strong className={styles['handoffTitle']}>
                Żadne nie pasuje?
              </strong>
              <span className={styles['handoffLead']}>
                Kurator ROPS przejrzy problem i odpowie w ciągu 7 dni.
              </span>
            </div>
            <Button
              variant="secondary"
              className={styles['handoffButton']}
              onClick={stub}
            >
              Przekaż problem do Hubu
            </Button>
          </div>
        </section>
        <aside className={styles['aside']}>
          <div className={styles['urgent']}>
            <span className={styles['urgentMark']} aria-hidden="true">
              i
            </span>
            <span>
              Potrzebujesz pilnej pomocy? <strong>112</strong> · Niebieska Linia{' '}
              <strong>800 120 002</strong> ·{' '}
              <button
                type="button"
                className={styles['urgentLink']}
                onClick={stub}
              >
                Znajdź swój OPS
              </button>
            </span>
          </div>
          <section className={styles['panel']}>
            <h2 className={styles['panelTitle']}>2. Podobne problemy</h2>
            {load.status === 'loading' ? (
              <div
                role="status"
                aria-live="polite"
                className={styles['statsLoading']}
              >
                <Skeleton />
                <Skeleton />
                <Skeleton width="70%" />
              </div>
            ) : null}
            {load.status === 'ready' ? (
              <>
                <span className={styles['similarCount']}>
                  Inni zgłaszali podobny problem:{' '}
                  {String(load.data.similarCount)}{' '}
                  <span className={styles['similarNote']}>
                    (dane przykładowe)
                  </span>
                </span>
                {load.data.similar.map((item: SimilarProblem): ReactElement => (
                  <figure key={item.innovationId} className={styles['similar']}>
                    <blockquote className={styles['quote']}>
                      „{item.quote}”
                    </blockquote>
                    <figcaption className={styles['caption']}>
                      z karty:{' '}
                      <Link
                        to={`/innowacje/${item.innovationId}`}
                        className={styles['similarSource']}
                      >
                        {item.source} ↗
                      </Link>
                    </figcaption>
                  </figure>
                ))}
              </>
            ) : null}
          </section>
          <LocalStatsPanel municipality={state.municipality} />
        </aside>
      </div>
    </main>
  );
}
