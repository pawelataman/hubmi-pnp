import styles from './Button.module.css';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'link';
export type ButtonSize = 'md' | 'lg';

/** The same look for a router `<Link>` as for `<Button>`. */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
): string {
  return cx(styles['button'], styles[variant], styles[size]);
}
