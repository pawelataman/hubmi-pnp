import type { ReactElement, ReactNode } from 'react';

import { cx } from './cx';
import styles from './StatusPill.module.css';

export type StatusTone = 'new' | 'progress' | 'done' | 'alert' | 'closed';

interface StatusPillProps {
  readonly tone: StatusTone;
  readonly icon: string;
  readonly children: ReactNode;
}

export function StatusPill({
  tone,
  icon,
  children,
}: StatusPillProps): ReactElement {
  return (
    <span className={cx(styles['pill'], styles[tone])}>
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  );
}
