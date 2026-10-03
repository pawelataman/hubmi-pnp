import type { ReactElement, ReactNode } from 'react';

import { cx } from './cx';
import styles from './Switch.module.css';

interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly children: ReactNode;
  /** Optional trailing text such as "Włączone". Hidden from the name. */
  readonly stateLabel?: string;
}

export function Switch({
  checked,
  onChange,
  children,
  stateLabel,
}: SwitchProps): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles['switch']}
      onClick={(): void => {
        onChange(!checked);
      }}
    >
      <span
        className={cx(styles['track'], checked && styles['on'])}
        aria-hidden="true"
      >
        <span className={styles['thumb']}>{checked ? '✓' : ''}</span>
      </span>
      <span>{children}</span>
      {stateLabel === undefined ? null : (
        <span className={styles['state']} aria-hidden="true">
          {stateLabel}
        </span>
      )}
    </button>
  );
}
