import type { ReactElement } from 'react';

import styles from './ChoiceChip.module.css';
import { cx } from './cx';

interface ChoiceChipProps {
  readonly label: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}

export function ChoiceChip({
  label,
  selected,
  onToggle,
}: ChoiceChipProps): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(styles['chip'], selected && styles['selected'])}
      onClick={onToggle}
    >
      {selected ? <span aria-hidden="true">✓ </span> : null}
      {label}
    </button>
  );
}
