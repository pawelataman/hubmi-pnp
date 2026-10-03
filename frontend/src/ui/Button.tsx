import type { ButtonHTMLAttributes, ReactElement } from 'react';

import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from './buttonClass';
import { cx } from './cx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      {...rest}
      type={type}
      className={cx(buttonClass(variant, size), className)}
    />
  );
}
