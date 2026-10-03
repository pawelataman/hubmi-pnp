import type { ReactElement } from 'react';
import { Outlet } from 'react-router';

import styles from './RopsLayout.module.css';
import { RopsSidebar } from './RopsSidebar';

export function RopsLayout(): ReactElement {
  return (
    <div className={styles['page']}>
      <RopsSidebar />
      <div className={styles['content']}>
        <Outlet />
      </div>
    </div>
  );
}
