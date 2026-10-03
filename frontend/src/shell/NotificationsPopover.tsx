import type { ReactElement } from 'react';
import { Link } from 'react-router';

import type { Notification } from '../api/types';
import { useNotifications, useToast } from '../app/contexts';
import { Button } from '../ui/Button';
import { cx } from '../ui/cx';
import styles from './NotificationsPopover.module.css';

interface NotificationsPopoverProps {
  readonly onClose: () => void;
}

export function NotificationsPopover({
  onClose,
}: NotificationsPopoverProps): ReactElement {
  const { items, unread, markAllRead } = useNotifications();
  const { stub } = useToast();

  return (
    <div role="dialog" aria-label="Powiadomienia" className={styles['popover']}>
      <div className={styles['head']}>
        <strong className={styles['title']}>Powiadomienia</strong>
        {items.length === 0 ? null : (
          <>
            <span className={styles['count']}>
              · {String(unread)} nieprzeczytane
            </span>
            <button
              type="button"
              className={styles['markRead']}
              onClick={markAllRead}
            >
              Oznacz jako przeczytane
            </button>
          </>
        )}
      </div>
      {items.length === 0 ? (
        <div className={styles['empty']}>
          <strong className={styles['title']}>
            Nie masz jeszcze powiadomień
          </strong>
          <p>
            Tu zobaczysz odpowiedzi ROPS, ekspertów i autorów innowacji oraz
            nowe nabory w obszarach, które obserwujesz.
          </p>
          <Button variant="secondary" onClick={stub}>
            Wybierz obserwowane obszary
          </Button>
        </div>
      ) : (
        <ul className={styles['list']}>
          {items.map((item: Notification): ReactElement => (
            <li
              key={item.id}
              className={cx(styles['item'], item.unread && styles['unread'])}
            >
              <span className={styles['icon']} aria-hidden="true">
                {item.icon}
              </span>
              <div className={styles['body']}>
                {item.caseId === null ? (
                  <span>{item.text}</span>
                ) : (
                  <Link
                    to={`/moje-sprawy/${item.caseId}`}
                    className={styles['itemLink']}
                    onClick={onClose}
                  >
                    {item.text}
                  </Link>
                )}
                <span className={styles['meta']}>
                  {item.type} · {item.time}
                </span>
              </div>
              {item.unread ? (
                <span className={styles['fresh']}>Nowe</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/ustawienia-powiadomien"
        className={styles['settings']}
        onClick={onClose}
      >
        Ustawienia powiadomień
      </Link>
    </div>
  );
}
