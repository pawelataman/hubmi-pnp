import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { Link } from 'react-router';

import { EXAMPLE_IDEA, IDEA_STAGES } from '../../api/examples';
import type { HubApi } from '../../api/HubApi';
import type { IdeaForm, IdeaStage, SubmittedCase } from '../../api/types';
import { useApi, useSession, useToast } from '../../app/contexts';
import { AiBadge } from '../../ui/AiBadge';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { ChoiceChip } from '../../ui/ChoiceChip';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import styles from './IdeaScreen.module.css';
import {
  SUMMARY_LIMIT,
  validateIdea,
  type IdeaErrors,
  type IdeaField,
} from './validateIdea';

type TextField = 'name' | 'summary' | 'audience' | 'problem' | 'email';

/** Where focus should go once the element it targets has been rendered. */
type FocusTarget = 'invalid' | 'heading' | 'first' | 'submit';

export function IdeaScreen(): ReactElement {
  const api: HubApi = useApi();
  const { persona } = useSession();
  const { stub } = useToast();
  const [form, setForm] = useState<IdeaForm>(EXAMPLE_IDEA);
  const [errors, setErrors] = useState<IdeaErrors>({});
  const [sending, setSending] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<SubmittedCase | null>(null);
  const root: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
  const pendingFocus: RefObject<FocusTarget | null> =
    useRef<FocusTarget | null>(null);

  // Runs after every render. A request stays pending until its target exists,
  // because a render that was already queued can run this effect before the
  // render that the click caused.
  useEffect((): void => {
    const target: FocusTarget | null = pendingFocus.current;
    if (target === null || root.current === null) {
      return;
    }
    const selector: string =
      target === 'invalid'
        ? '[aria-invalid="true"]'
        : `[data-focus="${target}"]`;
    const element: HTMLElement | null =
      root.current.querySelector<HTMLElement>(selector);
    if (element !== null) {
      pendingFocus.current = null;
      element.focus();
    }
  });

  function change(patch: Partial<IdeaForm>): void {
    setForm((current: IdeaForm): IdeaForm => ({ ...current, ...patch }));
  }

  function text(
    key: TextField,
  ): (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ): void => {
      change({ [key]: event.target.value });
    };
  }

  async function send(): Promise<void> {
    setSending(true);
    setFailed(false);
    try {
      const result: SubmittedCase = await api.submitIdea(
        form,
        persona?.id ?? null,
      );
      pendingFocus.current = 'heading';
      setSubmitted(result);
    } catch {
      pendingFocus.current = 'submit';
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    const found: IdeaErrors = validateIdea(form);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      void send();
    } else {
      pendingFocus.current = 'invalid';
    }
  }

  function reset(): void {
    pendingFocus.current = 'first';
    setForm(EXAMPLE_IDEA);
    setErrors({});
    setFailed(false);
    setSubmitted(null);
  }

  function error(key: IdeaField): ReactElement | null {
    const message: string | undefined = errors[key];
    return message === undefined ? null : (
      <FieldError id={`idea-${key}-error`}>{message}</FieldError>
    );
  }

  function invalidProps(key: IdeaField): {
    readonly 'aria-invalid': boolean;
    readonly 'aria-describedby': string | undefined;
  } {
    const bad: boolean = errors[key] !== undefined;
    return {
      'aria-invalid': bad,
      'aria-describedby': bad ? `idea-${key}-error` : undefined,
    };
  }

  if (submitted !== null) {
    return (
      <main
        ref={root}
        role="status"
        aria-live="polite"
        className={styles['success']}
      >
        <span className={styles['check']} aria-hidden="true">
          ✓
        </span>
        <h1
          tabIndex={-1}
          data-focus="heading"
          className={styles['successTitle']}
        >
          Fiszka wysłana. Dziękujemy!
        </h1>
        <div className={styles['caseNumber']}>
          <span className={styles['caseNumberLabel']}>Numer zgłoszenia</span>
          <strong className={styles['caseNumberValue']}>{submitted.id}</strong>
        </div>
        <p className={styles['successText']}>
          Kurator ROPS przeczyta pomysł <strong>„{submitted.title}”</strong> i
          odpowie do <strong>{submitted.replyBy}</strong>. Powiadomimy Cię w
          aplikacji i e-mailem.
        </p>
        <div className={styles['successActions']}>
          <Link to="/moje-sprawy" className={buttonClass('primary', 'lg')}>
            Przejdź do Moich spraw
          </Link>
          <Button variant="secondary" size="lg" onClick={reset}>
            Zgłoś kolejny pomysł
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main ref={root} className={styles['main']}>
      <div className={styles['intro']}>
        <div className={styles['introText']}>
          <span className={styles['eyebrow']}>Kreator pomysłów</span>
          <h1 className={styles['title']}>Zgłoś pomysł</h1>
          <p className={styles['lead']}>
            5 krótkich pól. Resztę doprecyzujemy razem.
          </p>
        </div>
        <div className={styles['callNote']}>
          <span className={styles['callIcon']} aria-hidden="true">
            ◷
          </span>
          Teraz nie ma aktywnego naboru. Fiszkę możesz wysłać zawsze.
        </div>
      </div>
      <div className={styles['columns']}>
        <form className={styles['form']} onSubmit={submit} noValidate>
          <div className={styles['field']}>
            <label htmlFor="idea-name" className={styles['label']}>
              1. Nazwa robocza
            </label>
            <input
              id="idea-name"
              type="text"
              data-focus="first"
              className={cx(
                styles['input'],
                errors.name !== undefined && styles['invalid'],
              )}
              value={form.name}
              onChange={text('name')}
              {...invalidProps('name')}
            />
            {error('name')}
          </div>
          <div className={styles['field']}>
            <label htmlFor="idea-summary" className={styles['label']}>
              2. Istota pomysłu w jednym zdaniu
            </label>
            <textarea
              id="idea-summary"
              className={cx(
                styles['textarea'],
                errors.summary !== undefined && styles['invalid'],
              )}
              value={form.summary}
              onChange={text('summary')}
              aria-invalid={errors.summary !== undefined}
              aria-describedby={
                errors.summary !== undefined
                  ? 'idea-summary-error idea-summary-count'
                  : 'idea-summary-count'
              }
            />
            {error('summary')}
            <span id="idea-summary-count" className={styles['counter']}>
              {`${String(form.summary.length)} / ${String(SUMMARY_LIMIT)} znaków`}
            </span>
          </div>
          <div className={styles['row']}>
            <div className={styles['field']}>
              <label htmlFor="idea-audience" className={styles['label']}>
                3. Dla kogo
              </label>
              <input
                id="idea-audience"
                type="text"
                className={cx(
                  styles['input'],
                  errors.audience !== undefined && styles['invalid'],
                )}
                value={form.audience}
                onChange={text('audience')}
                {...invalidProps('audience')}
              />
              {error('audience')}
            </div>
            <div className={styles['field']}>
              <label htmlFor="idea-problem" className={styles['label']}>
                4. Jaki problem rozwiązuje
              </label>
              <input
                id="idea-problem"
                type="text"
                className={cx(
                  styles['input'],
                  errors.problem !== undefined && styles['invalid'],
                )}
                value={form.problem}
                onChange={text('problem')}
                {...invalidProps('problem')}
              />
              {error('problem')}
            </div>
          </div>
          <div
            role="group"
            aria-labelledby="idea-stage-label"
            className={styles['stageField']}
          >
            <span id="idea-stage-label" className={styles['label']}>
              5. Etap
            </span>
            <div className={styles['chips']}>
              {IDEA_STAGES.map((stage: IdeaStage): ReactElement => (
                <ChoiceChip
                  key={stage}
                  label={stage}
                  selected={form.stage === stage}
                  onToggle={(): void => {
                    change({ stage });
                  }}
                />
              ))}
            </div>
          </div>
          <div className={cx(styles['row'], styles['extras'])}>
            <div className={styles['field']}>
              <span className={styles['label']}>
                Zdjęcie lub szkic{' '}
                <span className={styles['optional']}>(opcjonalnie)</span>
              </span>
              <Button
                variant="neutral"
                className={styles['upload']}
                onClick={stub}
              >
                + Dodaj plik
              </Button>
            </div>
            <div className={styles['field']}>
              <label htmlFor="idea-email" className={styles['label']}>
                E-mail do odpowiedzi{' '}
                <span className={styles['optional']}>(opcjonalnie)</span>
              </label>
              <input
                id="idea-email"
                type="email"
                className={cx(
                  styles['input'],
                  errors.email !== undefined && styles['invalid'],
                )}
                value={form.email}
                onChange={text('email')}
                {...invalidProps('email')}
              />
              {error('email')}
            </div>
          </div>
          {failed ? (
            <FieldError>
              Nie udało się wysłać fiszki. Spróbuj ponownie.
            </FieldError>
          ) : null}
          <div className={styles['actions']}>
            <Button
              type="submit"
              size="lg"
              data-focus="submit"
              className={styles['submit']}
              disabled={sending}
            >
              Wyślij fiszkę
            </Button>
            <Button
              variant="neutral"
              size="lg"
              className={styles['assistant']}
              onClick={stub}
            >
              <span aria-hidden="true">
                <AiBadge />
              </span>
              Rozwiń pomysł z asystentem
            </Button>
          </div>
        </form>
        <aside className={styles['aside']}>
          <span id="idea-preview-label" className={styles['previewLabel']}>
            Podgląd fiszki
          </span>
          <section
            aria-labelledby="idea-preview-label"
            className={styles['preview']}
          >
            <div className={styles['previewHead']}>
              <span className={styles['stageTag']}>{form.stage}</span>
              <span className={styles['draftTag']}>szkic · nie wysłano</span>
            </div>
            <strong className={styles['previewName']}>{form.name}</strong>
            <p className={styles['previewSummary']}>{form.summary}</p>
            <dl className={styles['previewFacts']}>
              <dt>Dla kogo</dt>
              <dd>{form.audience}</dd>
              <dt>Problem</dt>
              <dd>{form.problem}</dd>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
