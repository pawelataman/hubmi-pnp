import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router';

import { STATUS_VIEW } from '../../api/status';
import type { CaseThread, Message } from '../../api/types';
import { useSession } from '../../app/contexts';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { StatusPill } from '../../ui/StatusPill';
import { Stepper, type StepItem } from '../../ui/Stepper';
import { Composer } from '../thread/Composer';
import { useThread } from '../thread/useThread';
import styles from './AuthorThreadScreen.module.css';

function timelineSteps(thread: CaseThread): readonly StepItem[] {
  const { timeline } = thread;
  const reached: readonly (string | null)[] = [
    timeline.sent,
    timeline.inProgress,
    timeline.answered,
    timeline.closed,
  ];
  const labels: readonly string[] = [
    'Wysłane',
    'W trakcie',
    'Odpowiedziano',
    'Zamknięte',
  ];
  const last: number = reached.reduce(
    (found: number, date: string | null, index: number): number =>
      date === null ? found : index,
    0,
  );
  return labels.map((label: string, index: number): StepItem => {
    const date: string | null = reached[index] ?? null;
    return {
      label,
      note: date ?? '—',
      state: index < last ? 'done' : index === last ? 'current' : 'todo',
    };
  });
}

export function AuthorThreadScreen(): ReactElement {
  const { id = '' } = useParams();
  const { persona } = useSession();
  const { state, retry, send } = useThread(id);

  const back: ReactElement = (
    <Link to="/moje-sprawy" className={styles['back']}>
      ← Moje sprawy
    </Link>
  );

  if (state.status === 'loading') {
    return (
      <main className={styles['main']}>
        {back}
        <div role="status" aria-live="polite" className={styles['loading']}>
          <span className="visually-hidden">Wczytujemy wątek…</span>
          <Skeleton height="11rem" />
          <Skeleton height="6rem" />
          <Skeleton height="6rem" />
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className={styles['main']}>
        {back}
        <LoadError message={state.message} onRetry={retry} />
      </main>
    );
  }

  const thread: CaseThread = state.data;
  const view: (typeof STATUS_VIEW)[CaseThread['status']] =
    STATUS_VIEW[thread.status];

  return (
    <main className={styles['main']}>
      {back}
      <header className={styles['header']}>
        <div className={styles['headerTop']}>
          <span className={styles['about']}>
            Dotyczy: {thread.type.toLowerCase()} · {thread.id}
          </span>
          <span className={styles['pill']}>
            <StatusPill tone={view.tone} icon={view.icon}>
              {thread.status}
            </StatusPill>
          </span>
        </div>
        <h1 className={styles['title']}>{thread.title}</h1>
        <Stepper label="Postęp sprawy" items={timelineSteps(thread)} />
      </header>
      {thread.messages.map((message: Message): ReactElement => {
        const mine: boolean = persona !== null && message.from === persona.id;
        return (
          <article
            key={message.id}
            className={cx(styles['message'], !mine && styles['theirs'])}
          >
            <div className={styles['messageHead']}>
              <span className={styles['avatar']} aria-hidden="true">
                {message.initials}
              </span>
              <strong>{mine ? 'Ty' : message.authorName}</strong>
              <span className={styles['role']}>{message.role}</span>
              <span className={styles['time']}>{message.time}</span>
            </div>
            <p className={styles['text']}>{message.text}</p>
          </article>
        );
      })}
      <Composer
        label="Twoja odpowiedź"
        sendLabel="Wyślij"
        onSend={(text: string): Promise<void> =>
          persona === null ? Promise.resolve() : send(persona.id, text)
        }
      />
    </main>
  );
}
