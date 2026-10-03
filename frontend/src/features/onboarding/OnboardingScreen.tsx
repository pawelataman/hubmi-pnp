import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router';

import {
  EMPTY_PROFILE_ERRORS,
  MAX_DESCRIPTION_LENGTH,
  validateNeedsProfile,
  type NeedsProfileDraft,
  type NeedsProfileErrors,
  type NeedsProfileField,
  type ProfileValidation,
} from '../../api/needsProfile';
import type { PersonType } from '../../api/types';
import { useMatchmaking, useSession } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import styles from './OnboardingScreen.module.css';

interface PersonTypeOption {
  readonly value: PersonType;
  readonly label: string;
}

const PERSON_TYPES: readonly PersonTypeOption[] = [
  {
    value: 'beneficiary',
    label: 'Osoba potrzebująca — szukam wsparcia dla siebie',
  },
  { value: 'innovator', label: 'Dostawca innowacji — oferuję rozwiązanie' },
  {
    value: 'institution',
    label: 'Instytucja — szukam rozwiązania dla społeczności',
  },
  { value: 'expert', label: 'Ekspert / mentor — chcę dzielić się wiedzą' },
];

const EMPTY_DRAFT: NeedsProfileDraft = {
  displayName: '',
  description: '',
  municipality: '',
};

const EXAMPLE_DRAFT: NeedsProfileDraft = {
  displayName: 'Jan',
  description:
    'Mam 68 lat i mieszkam sam w małej miejscowości. Moje dzieci mieszkają daleko, a na co dzień rzadko mam z kim porozmawiać. Nie korzystam ze smartfona. Chciałbym mieć regularny kontakt z ludźmi, najlepiej przez zwykły telefon, bo trudno mi dojeżdżać na spotkania.',
  municipality: 'Jodłowa Wola',
};

export function OnboardingScreen(): ReactElement {
  const { persona, needsProfile, profileError, saveNeedsProfile, signIn } =
    useSession();
  const { update } = useMatchmaking();
  const navigate: NavigateFunction = useNavigate();
  const editing: boolean =
    persona?.id === 'beneficiary' && needsProfile !== null;
  const [personType, setPersonType] = useState<PersonType>('beneficiary');
  const [draft, setDraft] = useState<NeedsProfileDraft>(
    editing && needsProfile !== null ? needsProfile : EMPTY_DRAFT,
  );
  const [errors, setErrors] =
    useState<NeedsProfileErrors>(EMPTY_PROFILE_ERRORS);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement>(null);

  function change(field: NeedsProfileField, value: string): void {
    setDraft((current: NeedsProfileDraft): NeedsProfileDraft => ({
      ...current,
      [field]: value,
    }));
    setErrors((current: NeedsProfileErrors): NeedsProfileErrors => ({
      ...current,
      [field]: null,
    }));
    setSaveError(null);
  }

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    if (personType !== 'beneficiary') {
      return;
    }
    const result: ProfileValidation = validateNeedsProfile(draft);
    if (!result.valid) {
      setErrors(result.errors);
      const invalidField: NeedsProfileField | undefined = (
        ['displayName', 'description', 'municipality'] as const
      ).find(
        (field: NeedsProfileField): boolean => result.errors[field] !== null,
      );
      if (invalidField !== undefined) {
        form.current
          ?.querySelector<HTMLElement>(`[name="${invalidField}"]`)
          ?.focus();
      }
      return;
    }
    try {
      saveNeedsProfile(result.profile);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Nie udało się zapisać profilu. Spróbuj ponownie.',
      );
      return;
    }
    update({
      audience: 'individual',
      description: result.profile.description,
      municipality: result.profile.municipality,
      onBehalf: false,
      submitted: true,
      restored: [],
      card: null,
      answers: {},
    });
    signIn('beneficiary');
    void navigate('/znajdz/doprecyzowanie');
  }

  function useExample(): void {
    setDraft(EXAMPLE_DRAFT);
    setErrors(EMPTY_PROFILE_ERRORS);
    setSaveError(null);
  }

  return (
    <main className={styles['main']}>
      <header className={styles['intro']}>
        <span className={styles['eyebrow']}>
          {editing ? 'Twój profil potrzeb' : 'Dołącz do HubMe'}
        </span>
        <h1 className={styles['title']}>
          {editing
            ? 'Opowiedz, czego teraz potrzebujesz'
            : 'Znajdź wsparcie dopasowane do Ciebie'}
        </h1>
        <p className={styles['lead']}>
          Opisz swoją sytuację własnymi słowami. Pomożemy Ci znaleźć innowacje,
          które mogą ułatwić codzienne życie.
        </p>
      </header>
      <div className={styles['columns']}>
        <form
          ref={form}
          className={styles['form']}
          onSubmit={submit}
          noValidate
        >
          <div className={styles['field']}>
            <label htmlFor="person-type" className={styles['label']}>
              Typ osoby
            </label>
            <select
              id="person-type"
              name="personType"
              className={styles['input']}
              value={personType}
              aria-describedby="person-type-hint"
              onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                const option: PersonTypeOption | undefined = PERSON_TYPES.find(
                  (item: PersonTypeOption): boolean =>
                    item.value === event.target.value,
                );
                if (option !== undefined) {
                  setPersonType(option.value);
                  setSaveError(null);
                }
              }}
            >
              {PERSON_TYPES.map((option: PersonTypeOption): ReactElement => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p id="person-type-hint" className={styles['hint']}>
              Wybierz rolę, w której chcesz korzystać z HubMe.
            </p>
          </div>
          {personType === 'beneficiary' ? (
            <>
              <div className={styles['sectionIntro']}>
                <h2 className={styles['sectionTitle']}>Opowiedz nam o sobie</h2>
                <p>
                  Wystarczy krótki opis. Później sprawdzisz i poprawisz
                  rozpoznane potrzeby.
                </p>
              </div>
              {profileError !== null ? (
                <FieldError id="stored-profile-error">
                  {profileError}
                </FieldError>
              ) : null}
              <div className={styles['field']}>
                <label htmlFor="profile-name" className={styles['label']}>
                  Imię lub pseudonim
                </label>
                <input
                  id="profile-name"
                  name="displayName"
                  className={cx(
                    styles['input'],
                    errors.displayName !== null && styles['invalid'],
                  )}
                  autoComplete="nickname"
                  required
                  maxLength={80}
                  value={draft.displayName}
                  aria-invalid={errors.displayName !== null}
                  aria-describedby={
                    errors.displayName !== null
                      ? 'profile-name-error'
                      : undefined
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    change('displayName', event.target.value);
                  }}
                />
                {errors.displayName !== null ? (
                  <FieldError id="profile-name-error">
                    {errors.displayName}
                  </FieldError>
                ) : null}
              </div>
              <div className={styles['field']}>
                <label
                  htmlFor="profile-description"
                  className={styles['label']}
                >
                  Twoja sytuacja i potrzeby
                </label>
                <p id="profile-description-hint" className={styles['hint']}>
                  Jak wygląda Twoja codzienność? Co sprawia Ci trudność i jakie
                  wsparcie byłoby pomocne? W przykładzie używaj fikcyjnych
                  danych, bez nazwisk, adresów i numerów telefonu.
                </p>
                <textarea
                  id="profile-description"
                  name="description"
                  className={cx(
                    styles['textarea'],
                    errors.description !== null && styles['invalid'],
                  )}
                  required
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={7}
                  value={draft.description}
                  aria-invalid={errors.description !== null}
                  aria-describedby={
                    errors.description !== null
                      ? 'profile-description-error profile-description-hint'
                      : 'profile-description-hint'
                  }
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                    change('description', event.target.value);
                  }}
                />
                {errors.description !== null ? (
                  <FieldError id="profile-description-error">
                    {errors.description}
                  </FieldError>
                ) : null}
                <span className={styles['counter']}>
                  {String(draft.description.length)} /{' '}
                  {String(MAX_DESCRIPTION_LENGTH)} znaków
                </span>
              </div>
              <div className={styles['field']}>
                <label
                  htmlFor="profile-municipality"
                  className={styles['label']}
                >
                  Miejscowość lub gmina{' '}
                  <span className={styles['optional']}>(opcjonalnie)</span>
                </label>
                <input
                  id="profile-municipality"
                  name="municipality"
                  className={cx(
                    styles['input'],
                    errors.municipality !== null && styles['invalid'],
                  )}
                  maxLength={120}
                  value={draft.municipality}
                  aria-invalid={errors.municipality !== null}
                  aria-describedby={
                    errors.municipality !== null
                      ? 'profile-municipality-error'
                      : undefined
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    change('municipality', event.target.value);
                  }}
                />
                {errors.municipality !== null ? (
                  <FieldError id="profile-municipality-error">
                    {errors.municipality}
                  </FieldError>
                ) : null}
              </div>
              {saveError !== null ? (
                <FieldError id="profile-save-error">{saveError}</FieldError>
              ) : null}
              <div className={styles['actions']}>
                <Button type="submit" size="lg">
                  Zapisz profil i znajdź rozwiązania →
                </Button>
                <Link to="/" className={styles['back']}>
                  Wróć na stronę główną
                </Link>
              </div>
              <p className={styles['demoNote']}>
                Konto demonstracyjne. Profil zapisujemy w tej przeglądarce.
              </p>
            </>
          ) : (
            <section className={styles['pending']} aria-live="polite">
              <span className={styles['pendingBadge']}>To be developed</span>
              <h2 className={styles['sectionTitle']}>
                Formularz w przygotowaniu
              </h2>
              <p>
                Onboarding dla tej roli będzie dostępny w kolejnej wersji. Teraz
                możesz wypróbować ścieżkę osoby potrzebującej.
              </p>
              <Button
                variant="secondary"
                onClick={(): void => {
                  setPersonType('beneficiary');
                }}
              >
                Wybierz osobę potrzebującą
              </Button>
            </section>
          )}
        </form>
        <aside
          className={styles['aside']}
          aria-label="Jak działa profil potrzeb"
        >
          <section className={styles['steps']}>
            <span className={styles['eyebrow']}>
              Od potrzeby do rozwiązania
            </span>
            <h2 className={styles['sectionTitle']}>
              Twój opis to pierwszy krok
            </h2>
            <ol className={styles['stepList']}>
              <li>
                <strong>Opisz swoją sytuację</strong>
                <span>
                  Powiedz, czego potrzebujesz i co jest dla Ciebie ważne.
                </span>
              </li>
              <li>
                <strong>Sprawdź rozpoznane potrzeby</strong>
                <span>Popraw podsumowanie i doprecyzuj oczekiwania.</span>
              </li>
              <li>
                <strong>Poznaj propozycje innowacji</strong>
                <span>
                  Zobacz rozwiązania oraz wyjaśnienie, jak mogą Ci pomóc.
                </span>
              </li>
            </ol>
          </section>
          <section className={styles['example']}>
            <span className={styles['exampleBadge']}>Scenariusz POC</span>
            <h2 className={styles['sectionTitle']}>Więcej kontaktu z ludźmi</h2>
            <p>
              Jan, 68 lat, mieszka sam. Szuka regularnych rozmów i wsparcia
              dostępnego przez zwykły telefon.
            </p>
            <p className={styles['hint']}>
              Ten prototyp pokazuje jeden scenariusz, z przykładowymi
              rekomendacjami.
            </p>
            {personType === 'beneficiary' ? (
              <Button variant="secondary" onClick={useExample}>
                Wypełnij przykładem Jana
              </Button>
            ) : null}
          </section>
        </aside>
      </div>
      <Link to="/" className={buttonClass('link')}>
        ← HubMe
      </Link>
    </main>
  );
}
