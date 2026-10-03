import { Fragment, type ReactElement } from 'react';

import type { MatchmakingAudience } from '../../api/types';
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
  readonly audience?: MatchmakingAudience;
}

export function FlowSteps({
  current,
  audience = 'institution',
}: FlowStepsProps): ReactElement {
  const steps: readonly string[] =
    audience === 'individual'
      ? ['Profil potrzeb', 'Doprecyzowanie', 'Wyniki']
      : STEPS;
  const active: number = audience === 'individual' ? current - 1 : current;
  return (
    <ol aria-label="Etapy" className={styles['steps']}>
      {steps.map((label: string, index: number): ReactElement => {
        const position: number = index + 1;
        return (
          <Fragment key={label}>
            {index > 0 ? (
              <li aria-hidden="true" className={styles['dash']}>
                —
              </li>
            ) : null}
            <li
              aria-current={position === active ? 'step' : undefined}
              className={cx(
                position < active && styles['done'],
                position === active && styles['current'],
              )}
            >
              {position < active ? '✓ ' : ''}
              {String(position)}. {label}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
