import { useState, type ChangeEvent, type ReactElement } from 'react';
import { Link, Navigate, useParams } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type {
  DraftSection,
  Innovation,
  InstitutionProfile,
  LabelledValue,
  ScheduleRow,
} from '../../api/types';
import { useAdaptation, useApi, useToast } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { usePendingFocus } from '../../app/usePendingFocus';
import { AiBadge } from '../../ui/AiBadge';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import styles from './DraftScreen.module.css';
import { parseProfile } from './profile';
import { useDraft, type DraftState } from './useDraft';

const SECTION_HEADINGS: readonly string[] = [
  'Zakres usługi',
  'Odbiorcy',
  'Kadra',
  'Harmonogram',
  'Koszty (widełki na rok)',
  'Ryzyka',
];

function assumptions(profile: InstitutionProfile): readonly string[] {
  return [
    `Gmina ${profile.municipality}`,
    `${String(profile.recipients)} odbiorców`,
    `Budżet ${profile.budget} / rok`,
    profile.resources.length > 0
      ? `Zasoby i partnerzy: ${profile.resources.join(', ')}`
      : 'Brak wskazanych zasobów',
    ...(profile.resources.includes('Transport')
      ? []
      : ['Brak własnego transportu']),
  ];
}

export function DraftScreen(): ReactElement {
  const { id = '' } = useParams();
  const api: HubApi = useApi();
  const { state } = useAdaptation();
  const { stub } = useToast();
  const profile: InstitutionProfile | null = state.submitted
    ? parseProfile(state.draft)
    : null;
  const innovation: AsyncResult<Innovation> = useAsync<Innovation>(
    `innovation:${id}`,
    (signal: AbortSignal): Promise<Innovation> => api.getInnovation(id, signal),
  );
  // Without the innovation there is nothing to draft for.
  const draft: DraftState = useDraft(
    id,
    innovation.state.status === 'error' ? null : profile,
  );
  const [edits, setEdits] = useState<Readonly<Record<string, string>>>({});
  const [editing, setEditing] = useState<{
    readonly id: string;
    readonly text: string;
  } | null>(null);
  const { rootRef, requestFocus } = usePendingFocus<string>();

  if (profile === null) {
    return <Navigate to={`/innowacje/${id}/dostosuj`} replace />;
  }

  if (innovation.state.status === 'error') {
    return (
      <main className={styles['failed']}>
        <LoadError
          message={innovation.state.message}
          onRetry={innovation.retry}
        />
        <Link to="/" className={styles['backLink']}>
          Wróć na stronę główną
        </Link>
      </main>
    );
  }

  const pending: readonly string[] = SECTION_HEADINGS.slice(
    draft.sections.length,
  );

  function save(): void {
    if (editing !== null) {
      const { id: sectionId, text }: { id: string; text: string } = editing;
      requestFocus(`edit:${sectionId}`);
      setEdits(
        (
          current: Readonly<Record<string, string>>,
        ): Readonly<Record<string, string>> => ({
          ...current,
          [sectionId]: text.trim(),
        }),
      );
      setEditing(null);
    }
  }

  function cancel(sectionId: string): void {
    requestFocus(`edit:${sectionId}`);
    setEditing(null);
  }

  function renderSection(section: DraftSection): ReactElement {
    if (section.kind === 'schedule') {
      return (
        <section key={section.id} id={section.id} className={styles['section']}>
          <h2 className={styles['sectionTitle']}>{section.heading}</h2>
          <div className={styles['schedule']}>
            <div className={styles['scheduleRow']}>
              <span />
              {section.months.map((month: string): ReactElement => (
                <span key={month} className={styles['month']}>
                  {month}
                </span>
              ))}
            </div>
            {section.rows.map((row: ScheduleRow): ReactElement => (
              <div key={row.label} className={styles['scheduleRow']}>
                <span>{row.label}</span>
                <div
                  role="img"
                  aria-label={`${row.label}: ${section.months[row.from - 1] ?? ''}–${section.months[row.to - 1] ?? ''}`}
                  className={cx(
                    styles['bar'],
                    styles[
                      row.tone === 'prepare'
                        ? 'barPrepare'
                        : row.tone === 'run'
                          ? 'barRun'
                          : 'barReview'
                    ],
                  )}
                  style={{
                    gridColumn: `${String(row.from + 1)} / ${String(row.to + 2)}`,
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (section.kind === 'costs') {
      return (
        <section key={section.id} id={section.id} className={styles['section']}>
          <h2 className={styles['sectionTitle']}>{section.heading}</h2>
          <div className={styles['costs']}>
            {section.rows.map((row: LabelledValue): ReactElement => (
              <div key={row.label} className={styles['costRow']}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
            <div className={cx(styles['costRow'], styles['costTotal'])}>
              <strong>Razem</strong>
              <strong>{section.total}</strong>
            </div>
          </div>
        </section>
      );
    }
    const text: string = edits[section.id] ?? section.text;
    return (
      <section key={section.id} id={section.id} className={styles['section']}>
        <div className={styles['sectionHead']}>
          <h2 className={styles['sectionTitle']}>{section.heading}</h2>
          {editing?.id === section.id ? null : (
            <button
              type="button"
              aria-label={`Edytuj: ${section.heading}`}
              data-focus={`edit:${section.id}`}
              className={styles['edit']}
              onClick={(): void => {
                requestFocus(`field:${section.id}`);
                setEditing({ id: section.id, text });
              }}
            >
              ✎ Edytuj
            </button>
          )}
        </div>
        {editing?.id === section.id ? (
          <div className={styles['editor']}>
            <textarea
              aria-label={`Treść: ${section.heading}`}
              data-focus={`field:${section.id}`}
              className={styles['textarea']}
              value={editing.text}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                setEditing({ id: section.id, text: event.target.value });
              }}
            />
            <div className={styles['editorActions']}>
              <Button onClick={save}>Zapisz</Button>
              <Button
                variant="neutral"
                onClick={(): void => {
                  cancel(section.id);
                }}
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <p className={styles['text']}>{text}</p>
        )}
      </section>
    );
  }

  return (
    <main ref={rootRef} className={styles['main']}>
      <nav aria-label="Sekcje szkicu" className={styles['nav']}>
        <span className={styles['navTitle']}>Sekcje</span>
        {draft.sections.map((section: DraftSection): ReactElement => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={styles['navLink']}
          >
            {section.heading}
          </a>
        ))}
      </nav>
      <div className={styles['center']}>
        <div className={styles['notice']}>
          <AiBadge />
          <strong>Szkic AI do weryfikacji</strong>
          <span className={styles['noticeText']}>
            Każdą sekcję możesz edytować. Sprawdź koszty z księgowością.
          </span>
          <span className={styles['saved']}>✓ Zapisano 14:32</span>
        </div>
        <article className={styles['document']}>
          <header className={styles['documentHead']}>
            <span className={styles['version']}>
              Szkic usługi · wersja 1 · przykład
            </span>
            {innovation.state.status === 'ready' ? (
              <h1 className={styles['title']}>
                {innovation.state.data.name} w gminie {profile.municipality}
              </h1>
            ) : (
              <Skeleton width="80%" height="2.7rem" />
            )}
          </header>
          {draft.sections.map(renderSection)}
          {!draft.done && !draft.failed && pending.length > 0 ? (
            <section
              role="status"
              aria-live="polite"
              className={styles['pending']}
            >
              <strong className={styles['pendingTitle']}>
                Piszemy sekcję „{pending[0]}”…
              </strong>
              <Skeleton width="92%" height="1.125rem" />
              <Skeleton width="76%" height="1.125rem" />
              {pending.length > 1 ? (
                <span className={styles['pendingRest']}>
                  Pozostało: {pending.slice(1).join(', ')}
                </span>
              ) : null}
            </section>
          ) : null}
          {draft.failed ? (
            <FieldError>Nie udało się przygotować szkicu.</FieldError>
          ) : null}
        </article>
      </div>
      <aside className={styles['aside']}>
        <div className={styles['actions']}>
          <Button size="lg" className={styles['transfer']} onClick={stub}>
            Przenieś do wniosku →
          </Button>
          <span className={styles['call']}>
            ◷ Trwa nabór „Usługa Wrażliwa” · do 30.11
          </span>
          <Button variant="secondary" className={styles['pdf']} onClick={stub}>
            ↓ Pobierz PDF dla kierownika
          </Button>
          <div className={styles['ask']}>
            <Button variant="neutral" onClick={stub}>
              Zapytaj autora
            </Button>
            <Button variant="neutral" onClick={stub}>
              Zapytaj eksperta
            </Button>
          </div>
        </div>
        <div className={styles['assumptions']}>
          <strong className={styles['assumptionsTitle']}>
            Założenia, na których opiera się szkic
          </strong>
          <ul
            aria-label="Założenia, na których opiera się szkic"
            className={styles['assumptionList']}
          >
            {assumptions(profile).map((item: string): ReactElement => (
              <li key={item} className={styles['assumption']}>
                <span className={styles['arrow']} aria-hidden="true">
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to={`/innowacje/${id}/dostosuj`} className={styles['change']}>
            Zmień dane gminy
          </Link>
        </div>
      </aside>
    </main>
  );
}
