import { Fragment, type ReactElement } from 'react';

import { cx } from '../../ui/cx';
import styles from './FlowSteps.module.css';

const STEPS: readonly string[] = [
  'Opis',
  'Podgląd',
  'Doprecyzowanie',
  'Wyniki',
];

interface FlowStepsProps {
  /** 1-based number of the current step. */
  readonly current: 2 | 3;
}

export function FlowSteps({ current }: FlowStepsProps): ReactElement {
  return (
    <ol aria-label="Etapy" className={styles['steps']}>
      {STEPS.map((label: string, index: number): ReactElement => {
        const position: number = index + 1;
        return (
          <Fragment key={label}>
            {index > 0 ? (
              <li aria-hidden="true" className={styles['dash']}>
                —
              </li>
            ) : null}
            <li
              aria-current={position === current ? 'step' : undefined}
              className={cx(
                position < current && styles['done'],
                position === current && styles['current'],
              )}
            >
              {position < current ? '✓ ' : ''}
              {String(position)}. {label}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
