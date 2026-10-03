import type { ReactElement } from 'react';
import { Link } from 'react-router';

import { useToast } from '../app/contexts';
import styles from './ToastViewport.module.css';

/** A permanent live region, so that a toast put into it is announced. */
export function ToastViewport(): ReactElement {
  const { toast, dismiss } = useToast();
  return (
    <div role="status" aria-live="polite" className={styles['region']}>
      {toast === null ? null : (
        <div className={styles['toast']}>
          <span className={styles['icon']} aria-hidden="true">
            {toast.link === null ? 'i' : '↩'}
          </span>
          <div className={styles['body']}>
            <span>{toast.text}</span>
            {toast.link === null ? null : (
              <Link
                to={toast.link.to}
                className={styles['link']}
                onClick={dismiss}
              >
                {toast.link.label}
              </Link>
            )}
          </div>
          <button
            type="button"
            aria-label="Zamknij"
            className={styles['close']}
            onClick={dismiss}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
