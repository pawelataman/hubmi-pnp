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

import { expertiseLabel } from '../../api/expertProfile';
import type { HubApi } from '../../api/HubApi';
import {
  EXPERT_COMMENT_KINDS,
  isExpertCommentKind,
  MAX_EXPERT_COMMENT_LENGTH,
} from '../../api/mock/expertComments';
import type { ExpertComment, ExpertCommentKind } from '../../api/types';
import { useApi, useSession, useToast } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { FieldError } from '../../ui/FieldError';
import { LoadError } from '../../ui/LoadError';
import styles from './ExpertComments.module.css';

interface ExpertCommentsProps {
  readonly innovationId: string;
}

const DATE_FORMAT: Intl.DateTimeFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function ExpertComments({
  innovationId,
}: ExpertCommentsProps): ReactElement {
  const api: HubApi = useApi();
  const { persona, expertProfile } = useSession();
  const { show } = useToast();
  const [kind, setKind] = useState<ExpertCommentKind>('improvement');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const field: RefObject<HTMLTextAreaElement | null> =
    useRef<HTMLTextAreaElement>(null);
  const pending: RefObject<boolean> = useRef<boolean>(false);
  const request: RefObject<AbortController | null> =
    useRef<AbortController | null>(null);
  useEffect(
    (): (() => void) => (): void => {
      request.current?.abort();
    },
    [],
  );
  const { state: load, retry }: AsyncResult<readonly ExpertComment[]> =
    useAsync<readonly ExpertComment[]>(
      `expert-comments:${innovationId}`,
      (signal: AbortSignal): Promise<readonly ExpertComment[]> =>
        api.listExpertComments(innovationId, signal),
    );
  const canComment: boolean =
    persona?.id === 'expert' && expertProfile !== null;

  async function submit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    if (!canComment || expertProfile === null || pending.current) {
      return;
    }
    if (
      text.trim().length < 10 ||
      text.trim().length > MAX_EXPERT_COMMENT_LENGTH
    ) {
      setError('Napisz komentarz od 10 do 3000 znaków.');
      field.current?.focus();
      return;
    }
    pending.current = true;
    const controller: AbortController = new AbortController();
    request.current = controller;
    setSending(true);
    setError(null);
    try {
      await api.addExpertComment(
        innovationId,
        expertProfile,
        { kind, text },
        controller.signal,
      );
      if (controller.signal.aborted) {
        return;
      }
      setText('');
      retry();
      show('Komentarz ekspercki zapisany w tej przeglądarce.');
    } catch (failure: unknown) {
      if (controller.signal.aborted) {
        return;
      }
      setError(
        failure instanceof Error
          ? failure.message
          : 'Nie udało się dodać komentarza. Spróbuj ponownie.',
      );
    } finally {
      pending.current = false;
      if (!controller.signal.aborted) {
        setSending(false);
      }
    }
  }

  return (
    <section
      id="komentarze-eksperckie"
      className={styles['section']}
      aria-labelledby="expert-comments-title"
    >
      <div className={styles['heading']}>
        <span className={styles['eyebrow']}>Wspólny rozwój innowacji</span>
        <h2 id="expert-comments-title">Komentarze eksperckie</h2>
        <p>
          Korekty, usprawnienia i nowe pomysły do tej innowacji. Każdy komentarz
          zachowuje kontekst kompetencji autora.
        </p>
      </div>
      {canComment ? (
        <form
          className={styles['form']}
          onSubmit={(event: SyntheticEvent): void => {
            void submit(event);
          }}
          noValidate
        >
          <p className={styles['author']}>
            Komentujesz jako <strong>{expertProfile?.displayName}</strong> ·{' '}
            {expertProfile?.profession}
          </p>
          <div className={styles['field']}>
            <label htmlFor="expert-comment-kind">Typ komentarza</label>
            <select
              id="expert-comment-kind"
              value={kind}
              disabled={sending}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                if (isExpertCommentKind(event.target.value)) {
                  setKind(event.target.value);
                }
              }}
            >
              {(Object.keys(EXPERT_COMMENT_KINDS) as ExpertCommentKind[]).map(
                (value: ExpertCommentKind): ReactElement => (
                  <option key={value} value={value}>
                    {EXPERT_COMMENT_KINDS[value]}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className={styles['field']}>
            <label htmlFor="expert-comment-text">
              Twój komentarz do innowacji
            </label>
            <p id="expert-comment-hint">
              Wskaż, co warto poprawić, uzasadnij sugestię lub opisz nowy
              pomysł.
            </p>
            <textarea
              ref={field}
              id="expert-comment-text"
              required
              rows={5}
              maxLength={MAX_EXPERT_COMMENT_LENGTH}
              value={text}
              disabled={sending}
              aria-invalid={error !== null}
              aria-describedby={
                error !== null
                  ? 'expert-comment-hint expert-comment-error'
                  : 'expert-comment-hint'
              }
              onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                setText(event.target.value);
                setError(null);
              }}
            />
            <span className={styles['counter']}>
              {String(text.length)} / {String(MAX_EXPERT_COMMENT_LENGTH)} znaków
            </span>
          </div>
          {error !== null ? (
            <FieldError id="expert-comment-error">{error}</FieldError>
          ) : null}
          <Button type="submit" disabled={sending || load.status !== 'ready'}>
            {sending ? 'Zapisujemy komentarz…' : 'Dodaj komentarz ekspercki'}
          </Button>
          <p className={styles['demoNote']}>
            Komentarz demonstracyjny. Zapisujemy go lokalnie w tej przeglądarce.
          </p>
        </form>
      ) : (
        <div className={styles['invite']}>
          <p>
            Chcesz zaproponować zmianę? Uzupełnij profil eksperta, aby dodać
            komentarz.
          </p>
          <Link
            to="/onboarding?typ=expert"
            className={buttonClass('secondary')}
          >
            Dołącz jako ekspert
          </Link>
        </div>
      )}
      {load.status === 'loading' ? (
        <p role="status">Wczytujemy komentarze…</p>
      ) : null}
      {load.status === 'error' ? (
        <LoadError message={load.message} onRetry={retry} />
      ) : null}
      {load.status === 'ready' ? (
        <div
          className={styles['comments']}
          aria-label="Lista komentarzy eksperckich"
          aria-live="polite"
        >
          {load.data.length === 0 ? (
            <p className={styles['empty']}>
              Jeszcze nie ma komentarzy eksperckich do tej innowacji. Dodaj
              pierwszą sugestię.
            </p>
          ) : null}
          {load.data.map((comment: ExpertComment): ReactElement => (
            <article key={comment.id} className={styles['comment']}>
              <div className={styles['commentHead']}>
                <h3>{comment.authorName}</h3>
                <span className={styles['tag']}>
                  {EXPERT_COMMENT_KINDS[comment.kind]}
                </span>
                <time dateTime={comment.createdAt}>
                  {DATE_FORMAT.format(new Date(comment.createdAt))}
                </time>
              </div>
              <p className={styles['credentials']}>
                {comment.profession} · {expertiseLabel(comment.domain)}
              </p>
              <p className={styles['commentText']}>{comment.text}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
