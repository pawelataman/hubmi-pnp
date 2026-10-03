import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import {
  Link,
  useNavigate,
  useParams,
  type NavigateFunction,
} from 'react-router';

import {
  BUDGET_OPTIONS,
  RESOURCE_OPTIONS,
  type ProfileDraft,
} from '../../api/examples';
import type { HubApi } from '../../api/HubApi';
import type {
  Innovation,
  LabelledValue,
  MunicipalityFacts,
} from '../../api/types';
import { useAdaptation, useApi } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { ChoiceChip } from '../../ui/ChoiceChip';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { Stepper } from '../../ui/Stepper';
import { parseProfile, profileSteps } from './profile';
import styles from './ProfileScreen.module.css';

export function ProfileScreen(): ReactElement {
  const { id = '' } = useParams();
  const api: HubApi = useApi();
  const { state, update } = useAdaptation();
  const navigate: NavigateFunction = useNavigate();
  const [invalid, setInvalid] = useState<boolean>(false);
  const recipients: RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement>(null);
  const draft: ProfileDraft = state.draft;
  const innovation: AsyncResult<Innovation> = useAsync<Innovation>(
    `innovation:${id}`,
    (signal: AbortSignal): Promise<Innovation> => api.getInnovation(id, signal),
  );
  // The key is constant on purpose: the mock ignores the municipality, and
  // reloading the panel on every keystroke would flicker.
  const facts: AsyncResult<MunicipalityFacts> = useAsync<MunicipalityFacts>(
    'municipality-facts',
    (signal: AbortSignal): Promise<MunicipalityFacts> =>
      api.getMunicipalityFacts(draft.municipality, signal),
  );

  function change(patch: Partial<ProfileDraft>): void {
    update({ draft: { ...draft, ...patch } });
    setInvalid(false);
  }

  function toggleResource(resource: string): void {
    change({
      resources: draft.resources.includes(resource)
        ? draft.resources.filter((item: string): boolean => item !== resource)
        : [...draft.resources, resource],
    });
  }

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    if (parseProfile(draft) === null) {
      setInvalid(true);
      recipients.current?.focus();
      return;
    }
    update({ draft, submitted: true });
    void navigate(`/innowacje/${id}/szkic`);
  }

  function field(
    key: 'municipality' | 'audience' | 'staff',
  ): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      change({ [key]: event.target.value });
    };
  }

  return (
    <main className={styles['main']}>
      <div className={styles['intro']}>
        <span className={styles['eyebrow']}>Dostosuj do mojej gminy</span>
        <h1 className={styles['title']}>Opowiedz nam o swojej instytucji</h1>
        <p className={styles['lead']}>
          Na tej podstawie przygotujemy szkic usługi. Wystarczą przybliżone
          dane.
        </p>
      </div>
      <Stepper label="Kroki" items={profileSteps(draft)} />
      <div className={styles['columns']}>
        <form className={styles['form']} onSubmit={submit} noValidate>
          <div className={styles['row']}>
            <div className={styles['field']}>
              <label htmlFor="municipality" className={styles['label']}>
                Gmina
              </label>
              <input
                id="municipality"
                type="text"
                className={styles['input']}
                value={draft.municipality}
                onChange={field('municipality')}
              />
            </div>
            <div className={styles['field']}>
              <label htmlFor="audience" className={styles['label']}>
                Grupa odbiorców
              </label>
              <input
                id="audience"
                type="text"
                className={styles['input']}
                value={draft.audience}
                onChange={field('audience')}
              />
            </div>
          </div>
          <div className={styles['field']}>
            <label htmlFor="recipients" className={styles['label']}>
              Szacowana liczba odbiorców
            </label>
            {invalid ? (
              <FieldError id="recipients-error">
                Wpisz liczbę, np. 40. Wystarczy przybliżenie.
              </FieldError>
            ) : null}
            <input
              id="recipients"
              ref={recipients}
              type="text"
              inputMode="numeric"
              className={cx(
                styles['input'],
                styles['count'],
                invalid && styles['invalid'],
              )}
              value={draft.recipients}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'recipients-error' : undefined}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                change({ recipients: event.target.value });
              }}
            />
          </div>
          <div
            role="group"
            aria-labelledby="budget-label"
            className={styles['chipField']}
          >
            <span id="budget-label" className={styles['label']}>
              Budżet na rok
            </span>
            <div className={styles['chips']}>
              {BUDGET_OPTIONS.map((option: string): ReactElement => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={draft.budget === option}
                  onToggle={(): void => {
                    change({ budget: draft.budget === option ? '' : option });
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles['field']}>
            <label htmlFor="staff" className={styles['label']}>
              Dostępna kadra
            </label>
            <input
              id="staff"
              type="text"
              className={styles['input']}
              value={draft.staff}
              onChange={field('staff')}
            />
          </div>
          <div
            role="group"
            aria-labelledby="resources-label"
            className={styles['chipField']}
          >
            <span id="resources-label" className={styles['label']}>
              Zasoby i partnerzy
            </span>
            <div className={styles['chips']}>
              {RESOURCE_OPTIONS.map((option: string): ReactElement => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={draft.resources.includes(option)}
                  onToggle={(): void => {
                    toggleResource(option);
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles['actions']}>
            <Link
              to={`/innowacje/${id}`}
              className={cx(buttonClass('secondary', 'lg'), styles['back'])}
            >
              ← Wstecz
            </Link>
            <Button type="submit" size="lg" className={styles['submit']}>
              Przygotuj szkic usługi →
            </Button>
            <span className={styles['saved']}>Zapisano automatycznie</span>
          </div>
        </form>
        <aside className={styles['aside']}>
          <div className={styles['panel']}>
            <div className={styles['thumb']}>miniatura innowacji</div>
            <div className={styles['panelBody']}>
              <span className={styles['eyebrowSmall']}>Wybrana innowacja</span>
              {innovation.state.status === 'loading' ? (
                <div role="status" aria-live="polite">
                  <Skeleton width="85%" height="1.625rem" />
                </div>
              ) : null}
              {innovation.state.status === 'error' ? (
                <LoadError
                  message={innovation.state.message}
                  onRetry={innovation.retry}
                />
              ) : null}
              {innovation.state.status === 'ready' ? (
                <>
                  <strong className={styles['innovationName']}>
                    {innovation.state.data.name}
                  </strong>
                  <span className={styles['innovationMeta']}>
                    {innovation.state.data.category} ·{' '}
                    {innovation.state.data.cost}
                  </span>
                </>
              ) : null}
              <Link to="/znajdz/wyniki" className={styles['changeLink']}>
                Zmień innowację
              </Link>
            </div>
          </div>
          <div className={styles['facts']}>
            {facts.state.status === 'loading' ? (
              <div
                role="status"
                aria-live="polite"
                className={styles['factsLoading']}
              >
                <Skeleton width="70%" height="1.5rem" />
                <Skeleton height="1.5rem" />
                <Skeleton height="1.5rem" />
              </div>
            ) : null}
            {facts.state.status === 'error' ? (
              <LoadError message={facts.state.message} onRetry={facts.retry} />
            ) : null}
            {facts.state.status === 'ready' ? (
              <>
                <strong className={styles['factsTitle']}>
                  {facts.state.data.title}
                </strong>
                {facts.state.data.rows.map(
                  (row: LabelledValue): ReactElement => (
                    <div key={row.label} className={styles['factRow']}>
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ),
                )}
                <span className={styles['factsSource']}>
                  {facts.state.data.source}
                </span>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
