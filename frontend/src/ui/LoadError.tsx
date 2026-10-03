import type { ReactElement } from 'react';

import { Button } from './Button';
import { FieldError } from './FieldError';
import styles from './LoadError.module.css';

interface LoadErrorProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps): ReactElement {
  return (
    <div className={styles['panel']}>
      <FieldError>{message}</FieldError>
      <Button variant="secondary" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </div>
  );
}
