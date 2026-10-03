import type { ReactElement } from 'react';
import { Link } from 'react-router';

import { useToast } from '../app/contexts';
import styles from './ToastViewport.module.css';

export function ToastViewport(): ReactElement | null {
  const { toast, dismiss } = useToast();
  if (toast === null) {
    return null;
  }
  return (
    <div role="status" aria-live="polite" className={styles['toast']}>
      <span className={styles['icon']} aria-hidden="true">
        ↩
      </span>
      <div className={styles['body']}>
        <span>{toast.text}</span>
        {toast.link === null ? null : (
          <Link to={toast.link.to} className={styles['link']} onClick={dismiss}>
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
  );
}
