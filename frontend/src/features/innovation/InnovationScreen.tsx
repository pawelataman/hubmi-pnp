import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type { Innovation, LabelledValue, Review } from '../../api/types';
import { useApi, useMatchmaking, useToast } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { AiBadge } from '../../ui/AiBadge';
import { buttonClass } from '../../ui/buttonClass';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import styles from './InnovationScreen.module.css';

type Tab = 'opis' | 'finansowanie' | 'opinie';

export function InnovationScreen(): ReactElement {
  const { id = '' } = useParams();
  const api: HubApi = useApi();
  const { state: matchmaking } = useMatchmaking();
  const { stub } = useToast();
  const [tab, setTab] = useState<Tab>('opis');
  const { state: load, retry }: AsyncResult<Innovation> = useAsync<Innovation>(
    `innovation:${id}`,
    (signal: AbortSignal): Promise<Innovation> => api.getInnovation(id, signal),
  );

  if (load.status === 'loading') {
    return (
      <main className={styles['loading']}>
        <span
          role="status"
          aria-live="polite"
          className={styles['loadingTitle']}
        >
          Wczytujemy kartę innowacji…
        </span>
        <Skeleton width="10rem" height="1.375rem" />
        <div className={styles['skeletonTitle']}>
          <Skeleton width="100%" height="3rem" />
        </div>
        <div className={styles['skeletonButtons']}>
          <Skeleton width="16.25rem" height="3.5rem" />
          <Skeleton width="10.625rem" height="3.5rem" />
          <Skeleton width="10.625rem" height="3.5rem" />
        </div>
        <div className={styles['skeletonColumns']}>
          <Skeleton height="26.25rem" />
          <div className={styles['skeletonLines']}>
            <Skeleton width="80%" />
            <Skeleton width="90%" />
            <Skeleton width="70%" />
          </div>
        </div>
      </main>
    );
  }

  if (load.status === 'error') {
    return (
      <main className={styles['main']}>
        <LoadError message={load.message} onRetry={retry} />
        <Link to="/" className={styles['backLink']}>
          Wróć na stronę główną
        </Link>
      </main>
    );
  }

  const innovation: Innovation = load.data;
  const tabs: readonly (readonly [Tab, string])[] = [
    ['opis', 'Opis'],
    ['finansowanie', 'Finansowanie i wsparcie'],
    ['opinie', `Opinie (${String(innovation.reviewCount)})`],
  ];

  const funding: ReactElement = (
    <section className={styles['sideCard']}>
      <h2 className={styles['sideTitle']}>Finansowanie i wsparcie</h2>
      <div className={styles['tags']}>
        {innovation.fundingProgrammes.map((programme: string): ReactElement => (
          <span key={programme} className={styles['tag']}>
            {programme}
          </span>
        ))}
      </div>
      <span className={styles['fundingNote']}>{innovation.fundingNote}</span>
    </section>
  );

  const reviews: ReactElement = (
    <section className={styles['sideCard']}>
      <div className={styles['reviewsHead']}>
        <h2 className={styles['sideTitle']}>Opinie</h2>
        <strong className={styles['rating']}>{innovation.rating}</strong>
        <span className={styles['reviewsLead']}>
          średnio z {String(innovation.reviewCount)} opinii
        </span>
      </div>
      {innovation.reviews.map((review: Review): ReactElement => (
        <div key={review.heading} className={styles['review']}>
          <strong className={styles['reviewHeading']}>{review.heading}</strong>
          <span className={styles['reviewQuote']}>„{review.quote}”</span>
        </div>
      ))}
    </section>
  );

  return (
    <main className={styles['main']}>
      {matchmaking.card !== null ? (
        <Link to="/znajdz/wyniki" className={styles['backLink']}>
          ← Wróć do wyników
        </Link>
      ) : null}
      <header className={styles['header']}>
        <div className={styles['chips']}>
          <span className={cx(styles['chip'], styles['chipCategory'])}>
            {innovation.category}
          </span>
          <span className={cx(styles['chip'], styles['chipVerified'])}>
            ✓ Zweryfikowano {innovation.verified}
          </span>
          {innovation.seeksTesters ? (
            <span className={cx(styles['chip'], styles['chipTesters'])}>
              ◎ Szuka testerów
            </span>
          ) : null}
          {innovation.hasVideo ? (
            <span className={cx(styles['chip'], styles['chipVideo'])}>
              ▶ Ma film
            </span>
          ) : null}
        </div>
        <h1 className={styles['title']}>{innovation.name}</h1>
        <div className={styles['meta']}>
          <span>
            Autor: <strong>{innovation.author}</strong>
          </span>
          <span>
            Inkubator: <strong>{innovation.incubator}</strong>
          </span>
          <span>
            <strong>{innovation.rating} / 5</strong> ·{' '}
            {String(innovation.reviewCount)} opinii
          </span>
          <span className={styles['sample']}>przykładowe dane</span>
        </div>
      </header>
      <div className={styles['actions']}>
        <Link
          to={`/innowacje/${innovation.id}/dostosuj`}
          className={cx(buttonClass('primary', 'lg'), styles['primaryAction'])}
        >
          Dostosuj do mojej gminy
        </Link>
        <button
          type="button"
          className={cx(styles['action'], styles['actionOutline'])}
          onClick={stub}
        >
          Zapytaj autora
        </button>
        <button
          type="button"
          className={cx(styles['action'], styles['actionOutline'])}
          onClick={stub}
        >
          Chcę testować
        </button>
        <button
          type="button"
          className={cx(styles['action'], styles['actionNeutral'])}
          onClick={stub}
        >
          Oceń
        </button>
        {innovation.seeksTesters ? (
          <span className={styles['testerNote']}>{innovation.testerNote}</span>
        ) : null}
      </div>
      <div role="tablist" className={styles['tabs']}>
        {tabs.map(([key, label]: readonly [Tab, string]): ReactElement => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls="innovation-panel"
            className={cx(styles['tab'], tab === key && styles['tabCurrent'])}
            onClick={(): void => {
              setTab(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="innovation-panel"
        aria-labelledby={`tab-${tab}`}
        className={tab === 'opis' ? styles['columns'] : undefined}
      >
        {tab === 'opis' ? (
          <>
            <div className={styles['column']}>
              {innovation.hasVideo ? (
                <div className={styles['video']}>
                  <span className={styles['videoCaption']}>
                    kadr z filmu o innowacji · 3:12
                  </span>
                  <span className={styles['videoControls']}>
                    <button
                      type="button"
                      className={cx(styles['videoButton'], styles['play'])}
                      onClick={stub}
                    >
                      ▶ Odtwórz
                    </button>
                    <button
                      type="button"
                      className={styles['videoButton']}
                      onClick={stub}
                    >
                      Napisy PL
                    </button>
                    <button
                      type="button"
                      className={styles['videoButton']}
                      onClick={stub}
                    >
                      Transkrypcja
                    </button>
                  </span>
                </div>
              ) : null}
              <section className={styles['sourceCard']}>
                <div className={styles['sourceHead']}>
                  <h2 className={styles['sourceTitle']}>Co mówi źródło</h2>
                  <span className={styles['sourceTag']}>
                    Fakty z karty innowacji
                  </span>
                </div>
                {innovation.facts.map((fact: LabelledValue): ReactElement => (
                  <div key={fact.label} className={styles['fact']}>
                    <span className={styles['factLabel']}>{fact.label}</span>
                    <span className={styles['factValue']}>{fact.value}</span>
                  </div>
                ))}
                <div className={styles['fact']}>
                  <span className={styles['factLabel']}>Materiały</span>
                  <div className={styles['materials']}>
                    {innovation.materials.map(
                      (material: string): ReactElement => (
                        <button
                          key={material}
                          type="button"
                          className={styles['material']}
                          onClick={stub}
                        >
                          ↓ {material}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </section>
            </div>
            <div className={styles['sideColumn']}>
              <section className={styles['aiCard']}>
                <div className={styles['aiBadge']}>
                  <AiBadge label="Sugestia AI, do weryfikacji" />
                </div>
                <h2 className={styles['aiTitle']}>
                  Jak to przenieść do siebie
                </h2>
                {innovation.steps.map(
                  (step: string, index: number): ReactElement => (
                    <div key={step} className={styles['step']}>
                      <span className={styles['stepNumber']}>
                        {String(index + 1)}
                      </span>
                      <span className={styles['stepText']}>{step}</span>
                    </div>
                  ),
                )}
              </section>
              {funding}
              {reviews}
            </div>
          </>
        ) : null}
        {tab === 'finansowanie' ? funding : null}
        {tab === 'opinie' ? reviews : null}
      </div>
    </main>
  );
}
