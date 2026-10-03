import type { ReactElement } from 'react';

import styles from './AiBadge.module.css';

interface AiBadgeProps {
  /** Text after the tag, e.g. "Sugestia AI, do weryfikacji". */
  readonly label?: string;
}

export function AiBadge({ label }: AiBadgeProps): ReactElement {
  if (label === undefined) {
    return <span className={styles['tag']}>AI</span>;
  }
  return (
    <span className={styles['badge']}>
      <span className={styles['tag']}>AI</span>
      {label}
    </span>
  );
}
