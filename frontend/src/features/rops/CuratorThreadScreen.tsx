import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router';

import type { CaseThread, Message } from '../../api/types';
import { useSession, useToast } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { Composer } from '../thread/Composer';
import { useThread } from '../thread/useThread';
import { TYPE_ICONS } from './caseTypes';
import styles from './CuratorThreadScreen.module.css';

const ACTIONS: readonly { readonly label: string; readonly main: boolean }[] = [
  { label: 'Przypisz eksperta', main: true },
  { label: 'Scal z podobnym (2)', main: false },
  { label: 'Oznacz jako lukę', main: false },
  { label: 'Zamknij zgłoszenie', main: false },
];

export function CuratorThreadScreen(): ReactElement {
  const { id = '' } = useParams();
  const { persona } = useSession();
  const { stub } = useToast();
  const { state, retry, send } = useThread(id);

  const back: ReactElement = (
    <Link to="/rops/kolejka" className={styles['back']}>
      ← Kolejka zgłoszeń
    </Link>
  );

  if (state.status === 'loading') {
    return (
      <main className={styles['main']}>
        <div className={styles['column']}>
          {back}
          <div role="status" aria-live="polite" className={styles['loading']}>
            <span className="visually-hidden">Wczytujemy wątek…</span>
            <Skeleton height="2.5rem" width="60%" />
            <Skeleton height="6rem" />
            <Skeleton height="6rem" />
            <Skeleton height="9rem" />
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className={styles['main']}>
        <div className={styles['column']}>
          {back}
          <LoadError message={state.message} onRetry={retry} />
        </div>
      </main>
    );
  }

  const thread: CaseThread = state.data;
  const details: readonly { readonly label: string; readonly value: string }[] =
    [
      { label: 'Obszar', value: thread.area },
      { label: 'Powiat', value: thread.place },
      { label: 'Etap', value: thread.stage ?? '—' },
      { label: 'Ekspert', value: thread.expert ?? 'Nieprzypisany' },
    ];

  return (
    <main className={styles['main']}>
      <div className={styles['column']}>
        {back}
        <header className={styles['header']}>
          <span className={styles['typePill']}>
            {TYPE_ICONS[thread.type]} {thread.type}
          </span>
          <h1 className={styles['title']}>{thread.title}</h1>
          <span className={styles['caseId']}>{thread.id}</span>
        </header>
        {thread.messages.map((message: Message): ReactElement => {
          const mine: boolean = persona !== null && message.from === persona.id;
          return (
            <article key={message.id} className={styles['message']}>
              <div className={styles['messageHead']}>
                <strong>
                  {mine && persona !== null
                    ? `Ty (${persona.name})`
                    : message.authorName}
                </strong>
                <span className={styles['role']}>{message.role}</span>
                <span className={styles['time']}>{message.time}</span>
              </div>
              <p className={styles['text']}>{message.text}</p>
            </article>
          );
        })}
        <Composer
          label="Odpowiedź do autorki"
          sendLabel="Wyślij i powiadom autorkę"
          toolbar={
            <Button
              variant="neutral"
              className={styles['templates']}
              onClick={stub}
            >
              Szablony ▾
            </Button>
          }
          onSend={(text: string): Promise<void> =>
            persona === null ? Promise.resolve() : send(persona.id, text)
          }
        />
      </div>
      <aside className={styles['aside']}>
        <section className={styles['card']} aria-labelledby="actions-heading">
          <strong id="actions-heading">Akcje</strong>
          {ACTIONS.map(
            (action: {
              readonly label: string;
              readonly main: boolean;
            }): ReactElement => (
              <button
                key={action.label}
                type="button"
                className={
                  action.main ? styles['mainAction'] : styles['action']
                }
                onClick={stub}
              >
                {action.label}
              </button>
            ),
          )}
        </section>
        <section
          className={styles['details']}
          aria-labelledby="details-heading"
        >
          <strong id="details-heading" className={styles['detailsTitle']}>
            Szczegóły
          </strong>
          <dl className={styles['list']}>
            {details.map(
              (item: {
                readonly label: string;
                readonly value: string;
              }): ReactElement => (
                <div key={item.label} className={styles['detail']}>
                  <dt className={styles['detailLabel']}>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ),
            )}
          </dl>
        </section>
      </aside>
    </main>
  );
}
