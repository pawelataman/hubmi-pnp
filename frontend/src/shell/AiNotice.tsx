import type { ReactElement } from 'react';

import { useToast } from '../app/contexts';
import styles from './AiNotice.module.css';

export function AiNotice(): ReactElement {
  const { stub } = useToast();
  return (
    <div role="note" aria-live="polite" className={styles['notice']}>
      <span className={styles['tag']}>AI</span>
      <span>
        Wyniki przygotowuje system AI na podstawie bazy przetestowanych
        innowacji.{' '}
        <strong className={styles['strong']}>
          Decyzję podejmuje człowiek.
        </strong>
      </span>
      <button type="button" className={styles['human']} onClick={stub}>
        Wolisz porozmawiać z człowiekiem?
      </button>
    </div>
  );
}
