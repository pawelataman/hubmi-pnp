import type { ReactElement, ReactNode } from 'react';

import styles from './Card.module.css';
import { cx } from './cx';

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'section' | 'article';
}

export function Card({
  children,
  className,
  as: Tag = 'div',
}: CardProps): ReactElement {
  return <Tag className={cx(styles['card'], className)}>{children}</Tag>;
}
