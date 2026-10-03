import {
  useState,
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
} from 'react';
import { Link, Navigate } from 'react-router';

import { expertiseLabel } from '../../api/expertProfile';
import type { HubApi } from '../../api/HubApi';
import type { ExpertInnovationMatch, ExpertProfile } from '../../api/types';
import { useApi, useSession } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import styles from './ExpertInnovationsScreen.module.css';

interface ExpertResultsProps {
  readonly profile: ExpertProfile;
}

export function ExpertInnovationsScreen(): ReactElement {
  const { persona, expertProfile } = useSession();
  if (persona?.id !== 'expert' || expertProfile === null) {
    return <Navigate to="/onboarding?typ=expert" replace />;
  }
  return <ExpertResults profile={expertProfile} />;
}

function ExpertResults({ profile }: ExpertResultsProps): ReactElement {
  const api: HubApi = useApi();
  const [draftQuery, setDraftQuery] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const { state: load, retry }: AsyncResult<readonly ExpertInnovationMatch[]> =
    useAsync<readonly ExpertInnovationMatch[]>(
      `expert-matches:${JSON.stringify({ profile, query })}`,
      (signal: AbortSignal): Promise<readonly ExpertInnovationMatch[]> =>
        api.findExpertInnovations({ profile, query }, signal),
    );

  function search(event: SyntheticEvent): void {
    event.preventDefault();
    const next: string = draftQuery.trim();
    if (next === query) {
      retry();
    } else {
      setQuery(next);
    }
  }

  function reset(): void {
    setDraftQuery('');
    setQuery('');
  }

  return (
    <main className={styles['main']}>
      <header className={styles['intro']}>
        <span className={styles['eyebrow']}>Perspektywa eksperta</span>
        <h1 className={styles['title']}>
          Innowacje dopasowane do Twojej ekspertyzy
        </h1>
        <p className={styles['lead']}>
          Znajdź rozwiązania, w których Twoja wiedza może pomóc. Otwórz kartę i
          dodaj korektę, sugestię lub pomysł.
        </p>
      </header>
      <section className={styles['profile']} aria-label="Twój profil eksperta">
        <div>
          <h2 className={styles['profileName']}>{profile.displayName}</h2>
          <p>{profile.profession}</p>
        </div>
        <span className={styles['tag']}>{expertiseLabel(profile.domain)}</span>
        <Link to="/onboarding?typ=expert" className={buttonClass('secondary')}>
          Edytuj profil eksperta
        </Link>
        <p className={styles['description']}>{profile.description}</p>
      </section>
      <form role="search" className={styles['search']} onSubmit={search}>
        <div className={styles['searchField']}>
          <label htmlFor="expert-search">Szukaj innowacji</label>
          <input
            id="expert-search"
            type="search"
            maxLength={200}
            value={draftQuery}
            placeholder="Np. telefon, wolontariat, internet"
            aria-describedby="expert-search-hint"
            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
              setDraftQuery(event.target.value);
            }}
          />
          <p id="expert-search-hint">
            Wyszukaj temat lub nazwę w katalogu demonstracyjnym. Kolejność
            uwzględnia Twój profil.
          </p>
        </div>
        <Button type="submit">Szukaj</Button>
        {query !== '' ? (
          <Button variant="secondary" onClick={reset}>
            Wyczyść wyszukiwanie
          </Button>
        ) : null}
      </form>
      <p className={styles['demoNote']}>
        POC: przykładowy katalog 3 innowacji. Dopasowanie jest symulowane na
        podstawie dziedziny i słów z profilu.
      </p>
      {load.status === 'loading' ? (
        <div className={styles['cards']}>
          <span role="status" className={styles['status']}>
            Szukamy innowacji pasujących do Twoich kompetencji…
          </span>
          <Skeleton height="14rem" />
          <Skeleton height="14rem" />
        </div>
      ) : null}
      {load.status === 'error' ? (
        <LoadError message={load.message} onRetry={retry} />
      ) : null}
      {load.status === 'ready' ? (
        <section
          aria-label="Dopasowane innowacje"
          className={styles['results']}
        >
          <p role="status">
            Znaleziono: {String(load.data.length)}{' '}
            {query !== '' ? `· „${query}”` : '· według Twojego profilu'}
          </p>
          {load.data.length === 0 ? (
            <div className={styles['empty']}>
              <h2>Brak innowacji dla tego wyszukiwania</h2>
              <p>
                Spróbuj innego hasła lub wróć do propozycji dopasowanych do
                profilu.
              </p>
              <Button variant="secondary" onClick={reset}>
                Pokaż wszystkie dopasowania
              </Button>
            </div>
          ) : (
            <div className={styles['cards']}>
              {load.data.map((match: ExpertInnovationMatch): ReactElement => (
                <article key={match.innovationId} className={styles['card']}>
                  <span className={styles['category']}>{match.category}</span>
                  <h2>{match.name}</h2>
                  <p>{match.summary}</p>
                  <div className={styles['reason']}>
                    <strong>Dlaczego warto się przyjrzeć</strong>
                    <p>{match.reason}</p>
                  </div>
                  <div className={styles['contribution']}>
                    <strong>Gdzie możesz pomóc</strong>
                    <p>{match.contribution}</p>
                  </div>
                  <Link
                    to={`/innowacje/${match.innovationId}`}
                    className={buttonClass('primary')}
                  >
                    Zobacz innowację i skomentuj →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
