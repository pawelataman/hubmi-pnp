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
  Navigate,
  useNavigate,
  type NavigateFunction,
} from 'react-router';

import { EXAMPLE_PROMPTS } from '../../api/examples';
import { useMatchmaking, useSession, useToast } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import { Switch } from '../../ui/Switch';
import styles from './StartScreen.module.css';

const MIN_LENGTH: number = 60;

export function StartScreen(): ReactElement {
  const { state, update } = useMatchmaking();
  const { persona } = useSession();
  const personal: boolean = persona?.id === 'beneficiary';
  const { stub } = useToast();
  const navigate: NavigateFunction = useNavigate();
  const [description, setDescription] = useState<string>(state.description);
  const [municipality, setMunicipality] = useState<string>(state.municipality);
  const [onBehalf, setOnBehalf] = useState<boolean>(state.onBehalf);
  const [invalid, setInvalid] = useState<boolean>(false);
  const field: RefObject<HTMLTextAreaElement | null> =
    useRef<HTMLTextAreaElement>(null);

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    if (description.trim().length < MIN_LENGTH) {
      setInvalid(true);
      field.current?.focus();
      return;
    }
    update({
      description: description.trim(),
      municipality,
      onBehalf,
      submitted: true,
      restored: [],
      card: null,
      answers: {},
    });
    void navigate('/znajdz/podglad');
  }

  if (persona?.id === 'expert') {
    return <Navigate to="/ekspert/innowacje" replace />;
  }

  return (
    <main className={styles['main']}>
      <div className={styles['intro']}>
        <span className={styles['eyebrow']}>Matchmaking społeczny</span>
        <h1 className={styles['title']}>
          Znajdź sprawdzone rozwiązanie problemu społecznego
        </h1>
        <p className={styles['lead']}>
          Opisz sytuację własnymi słowami. Pokażemy innowacje, które ktoś już
          przetestował w Polsce. Nie musisz się logować.
        </p>
      </div>
      {persona === null ? (
        <p className={styles['hint']}>
          Chcesz zachować swoje potrzeby?{' '}
          <Link to="/onboarding">Załóż profil osoby potrzebującej</Link>.
        </p>
      ) : null}
      <form className={styles['form']} onSubmit={submit} noValidate>
        <div className={styles['field']}>
          <label htmlFor="description" className={styles['label']}>
            Opisz problem
          </label>
          {invalid ? (
            <FieldError id="description-error">
              Opis jest za krótki. Dopisz 2–3 zdania: kogo dotyczy problem i co
              jest najtrudniejsze.
            </FieldError>
          ) : null}
          <div className={styles['textareaWrap']}>
            <textarea
              id="description"
              ref={field}
              className={cx(styles['textarea'], invalid && styles['invalid'])}
              value={description}
              aria-invalid={invalid}
              aria-describedby={
                invalid ? 'description-error' : 'description-hint'
              }
              onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                setDescription(event.target.value);
                setInvalid(false);
              }}
            />
            <Button
              variant="neutral"
              aria-label="Dyktuj opis"
              className={styles['dictate']}
              onClick={stub}
            >
              <span className={styles['mic']} aria-hidden="true" />
              Dyktuj
            </Button>
          </div>
          <p id="description-hint" className={styles['hint']}>
            <span className={styles['info']} aria-hidden="true">
              i
            </span>
            {personal
              ? 'Opisz potrzeby i istotny kontekst swojej sytuacji. Nie podawaj nazwisk, adresów ani numerów telefonu.'
              : 'Opisz problem, nie osobę. Nie podawaj imion, adresów ani informacji o zdrowiu.'}
          </p>
        </div>
        <div className={styles['row']}>
          <div className={styles['field']}>
            <label htmlFor="municipality" className={styles['labelSmall']}>
              Gmina lub powiat{' '}
              <span className={styles['optional']}>(opcjonalnie)</span>
            </label>
            <input
              id="municipality"
              className={styles['input']}
              value={municipality}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                setMunicipality(event.target.value);
              }}
            />
          </div>
          <Switch
            checked={onBehalf}
            onChange={setOnBehalf}
            stateLabel={onBehalf ? 'Włączone' : 'Wyłączone'}
          >
            Zgłaszam w czyimś imieniu
          </Switch>
        </div>
        <div className={styles['examples']}>
          <span className={styles['labelSmall']}>
            Nie wiesz, jak zacząć? Kliknij przykład:
          </span>
          <div className={styles['exampleGrid']}>
            {EXAMPLE_PROMPTS.map((prompt: string): ReactElement => (
              <button
                key={prompt}
                type="button"
                className={styles['example']}
                onClick={(): void => {
                  setDescription(prompt);
                  setInvalid(false);
                }}
              >
                „{prompt}”
              </button>
            ))}
          </div>
        </div>
        <div className={styles['actions']}>
          <Button type="submit" size="lg" className={styles['submit']}>
            Dalej →
          </Button>
          <span className={styles['note']}>Zajmie to około 2 minut.</span>
        </div>
      </form>
      <div className={styles['human']}>
        <span className={styles['humanBadge']} aria-hidden="true">
          ROPS
        </span>
        <div className={styles['humanText']}>
          <strong>Wolisz porozmawiać z człowiekiem?</strong>
          <span>
            Dział Innowacji Społecznych ROPS w Krakowie · tel. 12 000 00 00
            (przykład) · pon.–pt. 8:00–16:00
          </span>
        </div>
        <button type="button" className={styles['humanLink']} onClick={stub}>
          Napisz do nas
        </button>
      </div>
    </main>
  );
}
