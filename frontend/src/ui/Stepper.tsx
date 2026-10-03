import type { ReactElement } from 'react';

import { cx } from './cx';
import styles from './Stepper.module.css';

export interface StepItem {
  readonly label: string;
  readonly state: 'done' | 'current' | 'todo';
  readonly note?: string;
}

interface StepperProps {
  readonly label: string;
  readonly items: readonly StepItem[];
}

export function Stepper({ label, items }: StepperProps): ReactElement {
  return (
    <ol
      role="list"
      aria-label={label}
      className={styles['stepper']}
      style={{
        gridTemplateColumns: `repeat(${String(items.length)}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item: StepItem): ReactElement => (
        <li
          key={item.label}
          aria-current={item.state === 'current' ? 'step' : undefined}
          className={cx(styles['step'], styles[item.state])}
        >
          <div className={styles['bar']} />
          <span className={styles['label']}>
            {item.state === 'done' ? '✓ ' : ''}
            {item.label}
          </span>
          {item.note === undefined ? null : (
            <span className={styles['note']}>{item.note}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
