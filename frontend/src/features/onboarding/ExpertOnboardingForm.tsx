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
  EMPTY_EXPERT_ERRORS,
  EXPERTISE_DOMAINS,
  isExpertiseDomain,
  MAX_EXPERT_DESCRIPTION_LENGTH,
  validateExpertProfile,
  type ExpertProfileDraft,
  type ExpertProfileErrors,
  type ExpertProfileField,
  type ExpertProfileValidation,
  type ExpertiseOption,
} from '../../api/expertProfile';
import { useSession } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import styles from './OnboardingScreen.module.css';

const EMPTY_DRAFT: ExpertProfileDraft = {
  displayName: '',
  profession: '',
  domain: '',
  description: '',
};
const EXAMPLE_DRAFT: ExpertProfileDraft = {
  displayName: 'Alicja',
  profession: 'Psycholożka i trenerka wolontariuszy',
  domain: 'senior-support',
  description:
    'Pracuję z osobami starszymi i wspieram organizacje przeciwdziałające samotności. Prowadzę szkolenia wolontariuszy z komunikacji i rozpoznawania potrzeb seniorów. Chcę pomagać w poprawie scenariuszy rozmów i rozwijaniu bezpiecznych usług wsparcia.',
};

export function ExpertOnboardingForm(): ReactElement {
  const { expertProfile, expertProfileError, saveExpertProfile, signIn } =
    useSession();
  const navigate: NavigateFunction = useNavigate();
  const [draft, setDraft] = useState<ExpertProfileDraft>(
    expertProfile ?? EMPTY_DRAFT,
  );
  const [errors, setErrors] =
    useState<ExpertProfileErrors>(EMPTY_EXPERT_ERRORS);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement>(null);

  function change(field: ExpertProfileField, value: string): void {
    if (field === 'domain' && value !== '' && !isExpertiseDomain(value)) {
      return;
    }
    setDraft((current: ExpertProfileDraft): ExpertProfileDraft =>
      field === 'domain'
        ? { ...current, domain: isExpertiseDomain(value) ? value : '' }
        : { ...current, [field]: value },
    );
    setErrors((current: ExpertProfileErrors): ExpertProfileErrors => ({
      ...current,
      [field]: null,
    }));
    setSaveError(null);
  }

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    const result: ExpertProfileValidation = validateExpertProfile(draft);
    if (!result.valid) {
      setErrors(result.errors);
      const invalidField: ExpertProfileField | undefined = (
        ['displayName', 'profession', 'domain', 'description'] as const
      ).find(
        (field: ExpertProfileField): boolean => result.errors[field] !== null,
      );
      if (invalidField !== undefined) {
        form.current
          ?.querySelector<HTMLElement>(`[name="${invalidField}"]`)
          ?.focus();
      }
      return;
    }
    try {
      saveExpertProfile(result.profile);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Nie udało się zapisać profilu. Spróbuj ponownie.',
      );
      return;
    }
    signIn('expert');
    void navigate('/ekspert/innowacje');
  }

  return (
    <form
      ref={form}
      className={styles['formFields']}
      onSubmit={submit}
      noValidate
    >
      <div className={styles['sectionIntro']}>
        <h2 className={styles['sectionTitle']}>
          Twoje doświadczenie i kompetencje
        </h2>
        <p>
          Opowiedz, czym się zajmujesz i w jakich obszarach możesz pomóc twórcom
          innowacji.
        </p>
        <Button
          variant="secondary"
          onClick={(): void => {
            setDraft(EXAMPLE_DRAFT);
            setErrors(EMPTY_EXPERT_ERRORS);
            setSaveError(null);
          }}
        >
          Wypełnij przykładem Alicji
        </Button>
      </div>
      {expertProfileError !== null ? (
        <FieldError>{expertProfileError}</FieldError>
      ) : null}
      <div className={styles['field']}>
        <label htmlFor="expert-name" className={styles['label']}>
          Imię lub pseudonim
        </label>
        <input
          id="expert-name"
          name="displayName"
          className={cx(
            styles['input'],
            errors.displayName !== null && styles['invalid'],
          )}
          required
          autoComplete="nickname"
          maxLength={80}
          value={draft.displayName}
          aria-invalid={errors.displayName !== null}
          aria-describedby={
            errors.displayName !== null ? 'expert-name-error' : undefined
          }
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            change('displayName', event.target.value);
          }}
        />
        {errors.displayName !== null ? (
          <FieldError id="expert-name-error">{errors.displayName}</FieldError>
        ) : null}
      </div>
      <div className={styles['field']}>
        <label htmlFor="expert-profession" className={styles['label']}>
          Czym się zajmujesz?
        </label>
        <input
          id="expert-profession"
          name="profession"
          className={cx(
            styles['input'],
            errors.profession !== null && styles['invalid'],
          )}
          required
          maxLength={120}
          value={draft.profession}
          placeholder="Np. psycholożka, projektant usług, trener wolontariuszy"
          aria-invalid={errors.profession !== null}
          aria-describedby={
            errors.profession !== null ? 'expert-profession-error' : undefined
          }
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            change('profession', event.target.value);
          }}
        />
        {errors.profession !== null ? (
          <FieldError id="expert-profession-error">
            {errors.profession}
          </FieldError>
        ) : null}
      </div>
      <div className={styles['field']}>
        <label htmlFor="expert-domain" className={styles['label']}>
          Dziedzina ekspertyzy
        </label>
        <select
          id="expert-domain"
          name="domain"
          className={cx(
            styles['input'],
            errors.domain !== null && styles['invalid'],
          )}
          required
          value={draft.domain}
          aria-invalid={errors.domain !== null}
          aria-describedby={
            errors.domain !== null ? 'expert-domain-error' : undefined
          }
          onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
            change('domain', event.target.value);
          }}
        >
          <option value="">Wybierz dziedzinę</option>
          {EXPERTISE_DOMAINS.map((option: ExpertiseOption): ReactElement => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.domain !== null ? (
          <FieldError id="expert-domain-error">{errors.domain}</FieldError>
        ) : null}
      </div>
      <div className={styles['field']}>
        <label htmlFor="expert-description" className={styles['label']}>
          O Tobie i Twojej ekspertyzie
        </label>
        <p id="expert-description-hint" className={styles['hint']}>
          Jakie masz doświadczenie? Jakie problemy rozwiązujesz? W czym chcesz
          wspierać twórców? Do demonstracji użyj fikcyjnych danych.
        </p>
        <textarea
          id="expert-description"
          name="description"
          className={cx(
            styles['textarea'],
            errors.description !== null && styles['invalid'],
          )}
          required
          rows={6}
          maxLength={MAX_EXPERT_DESCRIPTION_LENGTH}
          value={draft.description}
          aria-invalid={errors.description !== null}
          aria-describedby={
            errors.description !== null
              ? 'expert-description-error expert-description-hint'
              : 'expert-description-hint'
          }
          onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
            change('description', event.target.value);
          }}
        />
        {errors.description !== null ? (
          <FieldError id="expert-description-error">
            {errors.description}
          </FieldError>
        ) : null}
        <span className={styles['counter']}>
          {String(draft.description.length)} /{' '}
          {String(MAX_EXPERT_DESCRIPTION_LENGTH)} znaków
        </span>
      </div>
      {saveError !== null ? <FieldError>{saveError}</FieldError> : null}
      <div className={styles['actions']}>
        <Button type="submit" size="lg">
          Zapisz profil i znajdź innowacje →
        </Button>
        <Link to="/" className={styles['back']}>
          Wróć na stronę główną
        </Link>
      </div>
      <p className={styles['demoNote']}>
        Konto demonstracyjne. Profil zapisujemy w tej przeglądarce.
      </p>
    </form>
  );
}

export function ExpertOnboardingAside(): ReactElement {
  return (
    <aside className={styles['aside']} aria-label="Jak działa profil eksperta">
      <section className={styles['steps']}>
        <span className={styles['eyebrow']}>Od wiedzy do zmiany</span>
        <h2 className={styles['sectionTitle']}>Pomóż rozwijać innowacje</h2>
        <ol className={styles['stepList']}>
          <li>
            <strong>Opisz swoje kompetencje</strong>
            <span>
              Wskaż dziedzinę, doświadczenie i obszary, w których możesz pomóc.
            </span>
          </li>
          <li>
            <strong>Znajdź pasujące innowacje</strong>
            <span>
              Przeglądaj propozycje według profilu i wyszukuj interesujące
              tematy.
            </span>
          </li>
          <li>
            <strong>Podziel się wiedzą</strong>
            <span>
              Dodaj korektę, sugestię usprawnienia lub nowy pomysł na karcie
              innowacji.
            </span>
          </li>
        </ol>
      </section>
      <section className={styles['example']}>
        <span className={styles['exampleBadge']}>Scenariusz POC</span>
        <h2 className={styles['sectionTitle']}>
          Wsparcie z perspektywy eksperta
        </h2>
        <p>
          Alicja szkoli wolontariuszy pracujących z seniorami. Znajduje Telefony
          Życzliwości i proponuje ulepszenie scenariusza rozmów.
        </p>
        <p className={styles['hint']}>
          Dopasowania są demonstracyjne. Komentarze pozostają w tej
          przeglądarce.
        </p>
      </section>
    </aside>
  );
}
