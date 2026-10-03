import type { ReactElement } from 'react';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  readonly width?: string;
  readonly height?: string;
}

export function Skeleton({
  width = '100%',
  height = '1.25rem',
}: SkeletonProps): ReactElement {
  return (
    <div className={styles['skeleton']} style={{ width, height }} aria-hidden />
  );
}
