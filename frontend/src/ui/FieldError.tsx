import type { ReactElement, ReactNode } from 'react';

import styles from './FieldError.module.css';

interface FieldErrorProps {
  readonly id?: string;
  readonly children: ReactNode;
}

export function FieldError({ id, children }: FieldErrorProps): ReactElement {
  return (
    <div id={id} role="alert" className={styles['error']}>
      <span className={styles['mark']} aria-hidden="true">
        !
      </span>
      <span>{children}</span>
    </div>
  );
}
